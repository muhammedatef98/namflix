# Namflix — session handoff

**Last updated: 19 August 2026.** Everything done, everything left, and the exact
commands. Written so another session (or another person) can pick it up cold.

**Status right now:** iOS 1.0 (**build 15**) is **Waiting for Review** —
resubmitted 19 Aug at 12:16 AM, 5 items. Android is the outstanding half.

---

## 18 August 2026 — build 14 rejected (2.3.2), and what it exposed

**The rejection was one line:** Monthly and Lifetime carried the *same*
promotional image file. Apple: "You submitted duplicate or identical promotional
images for different promoted In-App Purchase products." Nothing else was cited;
the other four items were all `Ready for Review`.

**Fixed by deleting the Monthly image outright** (we promote no IAP on the App
Store, so it had no purpose). Exactly one promotional image now exists across the
three products — on Lifetime, kept only so offer-code redemptions have artwork.
Yearly has none. Verified after reload.

⚠️ **Correction to the note below: a subscription image CAN be deleted.** The
Delete control is simply absent while a submission is open — the file inputs
carry `disabled`. Cancel the submission and both the control and the inputs come
back. The old claim ("ASC offers no way to delete") was written from that trap
and has been removed from the reviewer notes and `REVIEW_REPLY.md`, because it
was a false statement sitting in front of App Review.

**Two live contradictions found while checking the screenshots** — neither was
in the rejection, both would have been visible to the next reviewer:

| Where | Said | Now |
|---|---|---|
| `lib/i18n.ts` `premiumFeat4` — **on the paywall** | "on every device you sign in with" | "restore it on any of your devices" |
| `lib/i18n.ts` `supportWhyBody` — Support screen | "the accounts backend" | (removed) |

Both claimed infrastructure that was deleted on 9 Aug. The paywall one is the
dangerous one: it is on the exact screen the reviewer opens to test the IAP,
while the reviewer notes say "There is no account and no sign-in screen."
The dead `exit` key (`خروج`) went too.

**⚠️ The IAP REVIEW screenshots are the real landmine — all three are stale.**
`Monthly`, `Yearly` and `Lifetime` each carry a *pixel-identical* copy of the old
paywall capture (`store/ios/iap-review/paywall.png`). It shows:

- a **"Free offer ends in 28 days … Claim it free"** card — the launch giveaway
  that was cancelled (`lifetime_mode = 'paid'`)
- **Monthly $4.99** — the real price is **$7.99**
- **Yearly "Save 33% vs monthly"** — it is now 58%
- **no Lifetime plan at all** — while the Lifetime IAP's own review notes say
  "The attached screenshot shows that paywall"

A wrong price plus a giveaway that does not exist, sitting in the review
material, is the same 2.3.2 family the app was already rejected under twice.

**RESOLVED 19 Aug.** Replaced with `paywall-subscriptions.png` (Monthly, Yearly)
and `paywall-lifetime.png` (Lifetime), both captured from build 15.

⚠️ **Correction: the simulator CAN render StoreKit prices.** Add a StoreKit
configuration file (`ios/Namflix.storekit`, in the repo) and reference it from the
scheme's LaunchAction; RevenueCat then resolves all three products normally. That
is how these captures were made — no device needed. Full recipe in
`store/ios/iap-review/README.md`.

One trap: a leftover test purchase makes the paywall render *"You're on Lifetime
— everything is unlocked"* instead of the plan cards. Uninstall and reinstall the
app on the simulator first.

**The 8 App Store screenshots were checked one by one (EN + AR): clean.** Home,
Methods, Listen, Sound Mixer — no sign-out, no account UI, no prices.

**⚠️ These are JS changes, so build 14 does not contain them.** Shipping the copy
fix needs build 15.

---

## Why this session happened

Apple rejected **iOS 1.0 build 13** on four counts (2.1.0 App Completeness,
2.3.2 Accurate Metadata ×2, 5.1.1 Data Collection). The Supabase auth logs showed
two of them were really one bug:

```
08:59:11  POST /otp    → 200  user_confirmation_requested   (email sent)
08:59:53  GET  /verify → 303  user_signedup                 (reviewer clicked a LINK)
09:01:06  GET  /verify → 403  "One-time token not found"    (clicked again, token spent)
```

The email template sent a magic link, not the numeric `{{ .Token }}` the app asked
for. The reviewer could never sign in — so they also never saw the delete-account
button, which only rendered for signed-in users. Two rejections, one cause.

---

## The decision

Rather than repair OTP, **accounts were removed from the app entirely.** No
sign-in, no email collected, no user data on any server.

This kills Guideline 2.1(a) and 5.1.1(v) at the source: with no account creation,
the deletion requirement does not apply on either store (Play's stricter
web-deletion-URL rule drops too).

---

## Code changes (working tree, `tsc` clean)

### Deleted
| File | Why |
|---|---|
| `app/login.tsx` | 223 lines — no sign-in screen any more |
| `contexts/AuthContext.tsx` | 102 lines |
| `identifyUser` / `grantLifetimeFree` / `refreshEntitlement` in `lib/purchases.ts` | all account-scoped |
| `worry_entries` sync in `lib/worry.ts` | write-only; nothing ever read it, and the table never existed |
| login + delete-account keys in `lib/i18n.ts` | dead strings |
| `monthlyPrice` / `yearlyPrice` in `lib/remoteConfig.ts` | read but never rendered — a trap that could show a price the store would not charge (2.3.1) |

### Changed
- **`app/_layout.tsx`** — `AuthProvider` and the auth gate removed; app opens straight to the hub. The one-per-install launch-offer push survives.
- **`contexts/PremiumContext.tsx`** — `accountId` gone. RevenueCat keys entitlements to the store account (Apple ID / Google), which is what "Restore purchases" reads.
- **`app.json`** — `ios.privacyManifests.NSPrivacyCollectedDataTypes` emptied. It still declared EmailAddress + UserID; Apple validates this, and an app with no sign-in claiming to collect email is a guaranteed rejection.
- **`app/privacy.tsx`** + hosted `privacy` / `support` functions — rewritten to say no accounts, no server-side data.
- **`app/premium.tsx`** — added a restore prompt, the paid-Lifetime card, and the "Redeem a code" control.

### The revenue leak (separate bug, found en route)
`DEFAULT_CONFIG.lifetimeMode` was `'free'` and `normaliseMode` fell back to
`'free'`, so **any** failed `app_config` fetch — offline, renamed column — granted
a permanent free Lifetime. Both now default to `'off'`; only an explicit `'free'`
from the dashboard opens the giveaway.

⚠️ Shared code, so this covers Android too — but **iOS build 13 and Android vc8
are pre-fix artifacts and must not be shipped.**

### Paid Lifetime
`PaidPlan` gained `'lifetime'`; `PRODUCT_IDS.lifetime = 'namflix.premium.lifetime'`;
`PLAN_ORDER = ['yearly','monthly','lifetime']`. RevenueCat serves the
non-consumable as just another package, so it rides the existing purchase path.
The card is gated on `lifetimeMode === 'paid'`, switchable from `app_config` with
**no build and no review**. Auto-renew disclosure is scoped to subscriptions only.

**Current DB state: `lifetime_mode = 'paid'`, `free_until = null`.** The Egypt
launch giveaway was deliberately cancelled — everything is paid.

---

## Store / backend state

### App Store Connect — **Waiting for Review**
- Version 1.0 submitted with app version + `Namflix paid` group + Monthly + Yearly + **Lifetime**.
- Monthly promotional image **replaced** with `store/ios/iap-review/promo-1024.png` — original artwork, no price, not a screenshot. ASC offers no way to *delete* a subscription image, only replace, despite what the rejection letter says.
- Yearly has no promotional image (verified on the correct product — the Yearly id is **6795105649**, not 6795105469).
- **App Privacy published: Purchase History only.** Email Address and User ID removed.
- Lifetime IAP: non-consumable, `namflix.premium.lifetime`, Apple ID `6801891841`, $99.99, EN + AR localizations, promo image attached.
- ⚠️ **There is no "Reply to App Review" box on this submission** — the old one is "Removed" and the new one carries no Apple message. The substance of `store/ios/REVIEW_REPLY.md` was moved into the reviewer **Notes** field instead.
- ⚠️ `REVIEW_REPLY.md` says the Monthly image was *replaced*, not removed. Keep it that way — Apple checks the claim against the listing.

### Stale store copy — swept in four places
Old copy described a **guest mode** and a **$4.99** price that no longer exist —
that is a live 2.3.1/2.3.2 risk. All four fixed and saved:
1. ASC reviewer notes
2. ASC English description
3. ASC Arabic description
4. Play Arabic full description — "• وضع ضيف بدون حساب…" → "• بدون تسجيل ولا حساب — افتحه فيشتغل…" (581/4000)

### Pricing (all verified after save)
| | Monthly | Yearly | Lifetime |
|---|---|---|---|
| 🇺🇸 US | **$7.99** (was 4.99) | $39.99 | **$99.99** |
| 🇸🇦 Saudi | SAR 34.99 | SAR 179.99 | auto |
| 🇦🇪 UAE | AED 29.99 | AED 149.99 | auto |
| 🇪🇬 **Egypt** | **E£99.99** | **E£499.99** | **E£1,299.99** |

Raising monthly takes the annual discount from 33% → **58%**, which is what pushes
people to the yearly plan. Egypt was the real find: it sat at full US parity
(E£249.99/mo, **E£1,999.99/yr** ≈ $41) and auto-recalculation would have pushed it
to E£399.99/E£4,999.99. Non-starters in the largest Arabic market.
**The Egypt numbers are a judgement call, not a measured one — change them freely.**

### Supabase
- `support` (v2) and `privacy` (v3) redeployed with the no-account copy; the `privacy` source is now **in the repo** (`supabase/functions/privacy/`) — it previously lived only on Supabase.
- All **6 rows deleted from `auth.users`** (incl. the reviewer's), so "we hold no user data" is literally true.
- **New signups disabled.** ⚠️ That page has a separate **Save changes** button; toggling alone does not persist.
- `delete-account` and `grant-lifetime` edge functions **deleted**; source preserved in `supabase/functions/_retired/` with a README explaining why they must not be redeployed.
- Official app email everywhere: **Namflix.sleep@gmail.com**

### RevenueCat
- `namflix.premium.lifetime` created (App Store, **non-consumable**), attached to entitlement **`premium`**, added to the **`$rc_lifetime`** package of the `default` offering.
- The Play Store side of this product does **not** exist yet.

---

## Restore-after-reinstall

**iOS: VERIFIED ON DEVICE, 16 Aug 2026.** The owner bought Lifetime, deleted the
app, reinstalled, was shown the paywall, tapped **Restore purchases**, and the
entitlement came back. Purchase, entitlement and restore work end to end.

**The Restore button is the mechanism, by design.** RevenueCat's docs say
`restorePurchases()`

> "**should not** be triggered programmatically, since it may cause OS level
> sign-in prompts to appear, and should only be called from some user interaction
> (e.g. tapping a 'Restore' button.)"

So auto-restoring on launch is not something we are missing — it is something the
SDK tells you not to do. Our code calls it only from `onRestore` in
`app/premium.tsx`. The explanatory line above that button is the whole fix, and it
is why that line has to stay.

**Android: covered by Auto Backup, and now pinned.** RevenueCat's mitigation for
anonymous users is to have its data backed up to the user's Google account so the
anonymous id — and with it the entitlement — returns on reinstall. That depends on
`android:allowBackup`. Expo's default is `true`, so this already worked, but *by
accident*. Now explicit in `app.json`:

```json
"android": { "allowBackup": true }
```

Do not remove it. It is load-bearing for purchase recovery, which is not obvious
from the flag's name.

**⚠️ The Billing Client 8 trap — we are on the right side of it, deliberately.**
From Play Billing 8, Google removed the ability to query *consumed* one-time
purchases, so they cannot be restored. RevenueCat **auto-consumes any product
configured as a consumable in its dashboard**. For an app with no accounts —
exactly ours — that purchase would be **permanently unrecoverable**.
`namflix.premium.lifetime` is **Non-consumable** in RevenueCat. If anyone flips it
to Consumable, every Android Lifetime buyer silently loses their purchase on
reinstall with no way back. Treat that setting as immutable.

Sources: [Restoring Purchases](https://www.revenuecat.com/docs/getting-started/restoring-purchases) ·
[Restoring consumable purchases won't work in Billing Client 8](https://www.revenuecat.com/docs/known-store-issues/play-billing-library/restore-consumable-purchases-bc8)

---

## Free-Lifetime redeem code

Built on **Apple Offer Codes**, not a hand-rolled code system. That matters: we
never see or validate the code, Apple does — so there is no secret in the bundle
to extract, and the giveaway is switched off from App Store Connect rather than by
shipping a build.

**Done:**
- Offer **"Lifetime Free Code"** on the Lifetime IAP — **Free Offer**, all 175
  storefronts, eligibility set to **all three** customer groups, so it works for anybody.
- `redeemOfferCode()` + `canRedeemInApp()` in `lib/purchases.ts`, wired to a
  **"Redeem a code"** control under Restore on the paywall (hidden once premium is
  active). iOS shows Apple's native sheet; Android gets a one-line instruction,
  because Play has no in-app sheet — codes are redeemed in the Play Store app and
  arrive on the next entitlement sync.
- Redemption is silent to us, so after the sheet closes the code **re-reads the
  entitlement** instead of trusting a return value.
- Verified in the shipped build: the owner opened the app and saw both the plans
  and the redeem control.

**⚠️ Blocked until approval — the one remaining step.** Apple:

> "To create custom codes, your in-app purchase must be approved by App Review,
> and your app must be in the Ready for Distribution state."

So the memorable code string (e.g. `NAMFLIX-FRIENDS`) cannot be minted yet.
**After approval:** open that offer → **Create Custom Codes** → pick the word and a
redemption limit. One click, no build, no resubmission.

One-time-code redemption URL template (already live):
`https://apps.apple.com/redeem?ctx=offercodes&id=6794132000&code=CODE`

**To kill the giveaway:** App Store Connect → Lifetime IAP → Offer Codes →
**Deactivate**. Immediate, no build.

---

## What is left

### 1. Google Play — the whole outstanding half

**a) Data safety form — the one thing deliberately left unsaved.**

The form still declares **"Username and other authentication"** under account
creation, plus a **Delete account URL** — both describe an app that no longer
exists. The correction is: uncheck it, select **"My app does not allow users to
create an account"** (the URL field then disappears on its own), and answer the two
follow-ups **No**.

But finishing that wizard lands on a Preview reading **"No data collection
declared"**, and that is **under-declaring**: RevenueCat receives purchase data
off-device, so **Purchase history** must be declared — matching the Apple App
Privacy declaration exactly. The wizard would not navigate back to the Data types
step (tab clicks and Back both bounced to Preview), so rather than save a
declaration believed to be incomplete, the edits were discarded and the form left
in its original saved state. **Nothing was saved. No damage.**

Do all three in one pass:
1. **Data collection and security:** → "My app does not allow users to create an account"; both follow-ups **No**
2. **Data types:** tick **Purchase history** only; untick Email address and User IDs
3. **Data usage:** Purchase history → Collected, **not** Shared, purpose **App functionality**, **Required**

Preview should end up saying "Purchase history", not "No data collection declared".

⚠️ Coordinate-based clicking in Play Console lands one row off — it once ticked
"Username, password, and other authentication" by accident. Use the keyboard or
verify every click by re-reading the row.

**b) Everything else on Play:**
- create `namflix.premium.lifetime` as a **one-time product**
- add it to RevenueCat's **Play Store** app + the `$rc_lifetime` package
- apply the same regional pricing (especially Egypt)
- check whether an English listing exists and needs the same guest-mode sweep
- keep the closed-testing track running: a **personal** developer account needs
  **12 testers × 14 continuous days** before production unlocks
- ⚠️ `eas submit` for Android fails non-interactively ("Google Service Account Keys
  cannot be set up in --non-interactive mode") — the `.aab` was uploaded by hand

### 2. Still unverified on both platforms
- a **production** (non-sandbox) purchase
- Android buy → delete → reinstall, to confirm Auto Backup actually restores

### 3. Optional, high value
7-day introductory offer on the yearly plan. App Store Connect only, no build —
`readFreeTrial` in `lib/purchases.ts` already reads it from StoreKit and only
advertises a trial that actually exists.

### Build command, for reference
```bash
cd /Users/mohamed/Desktop/namflix/namflix-app && npx eas-cli build --platform all --profile production
```

---

## Decisions worth not relitigating

- ~~**No ads.**~~ **Reversed (Oct 2026): optional rewarded ads for free users only.**
  On a locked item a free user may watch one short AdMob ad to open it for 24h (3/day).
  No app-open ads, no banners, interstitials off (`ENABLE_INTERSTITIALS`). Nothing ad-related
  runs at launch; Premium of any kind (including `lifetime-free` / redeemed codes) makes no
  ad requests. The in-app and hosted privacy policies, `app.json` privacy manifest,
  `store/ios/REVIEW_NOTES.md` and `store/android/PLAY_CONSOLE_SETUP.md` §3/§4b were updated
  to disclose it. See `ADS_SETUP.md`.
- **Keep the free tier** (`lib/freeTier.ts` — breathing, cognitive shuffle, Night Rescue, 6 sounds). It is the word-of-mouth engine.
- **Lifetime at 2.5× yearly**, not a token price. A cheap permanent unlock cannibalises the subscription forever.
- **No hand-rolled redeem codes.** A code shipped in the bundle is extractable and cannot be revoked without a new build. Apple Offer Codes solve both.
- **The Egypt launch giveaway is cancelled.** Everything is paid.

---

## Things that cost time — don't rediscover them

- **`npx` cache corruption** (`ENOTEMPTY` on eas-cli): clear `~/.npm/_npx/6bc7bae5c2059953`.
- **`grep` finds nothing in an `.ipa`** — Hermes bytecode is binary. Use `grep -a`.
- **Supabase auth settings** and **ASC** both have separate Save buttons; reload and re-read to confirm a change persisted.
- **A subscription's file inputs are `disabled` while a submission is pending.** Uploads fail silently until the submission is cancelled.
