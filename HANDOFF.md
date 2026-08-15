# Namflix — session handoff, 15 August 2026

Everything done in this session, what is left, and the exact commands. Written so
another session (or another person) can pick it up cold.

---

## Why this session happened

Apple rejected **iOS 1.0 build 13** on four counts. The Supabase auth logs showed
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

## Code changes (all committed to the working tree, `tsc` clean)

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
- **`app/premium.tsx`** — added a restore prompt (see "known gap" below) and the paid-Lifetime card.

### The revenue leak (separate bug, found en route)
`DEFAULT_CONFIG.lifetimeMode` was `'free'` and `normaliseMode` fell back to
`'free'`, so **any** failed `app_config` fetch — offline, renamed column — granted
a permanent free Lifetime. Both now default to `'off'`; only an explicit `'free'`
from the dashboard opens the giveaway. The DB row itself was already correct
(`free_until = 2026-08-28`) and was left alone.

⚠️ Shared code, so this covers Android too — but **iOS build 13 and Android vc8
are pre-fix artifacts and must not be shipped.**

### Paid Lifetime
`PaidPlan` gained `'lifetime'`; `PRODUCT_IDS.lifetime = 'namflix.premium.lifetime'`;
`PLAN_ORDER = ['yearly','monthly','lifetime']`. RevenueCat serves the
non-consumable as just another package, so it rides the existing purchase path —
no new card, no new branch. The card is gated on `lifetimeMode === 'paid'`, so on
**28 Aug 2026** flipping one row in `app_config` switches it on with **no build and
no review**. Auto-renew disclosure is scoped to subscriptions only.

---

## Store / backend state

### App Store Connect
- Submission **cancelled** (it was rejected and had to be rebuilt anyway; cancelling was the only way to unlock the subscription fields).
- Monthly promotional image **replaced** with `store/ios/iap-review/promo-1024.png` — original artwork, no price, not a screenshot. ASC offers no way to *delete* a subscription image, only replace, despite what the rejection letter says.
- Yearly has no promotional image (verified on the correct product — the Yearly id is **6795105649**, not 6795105469).
- **App Privacy published: Purchase History only.** Email Address and User ID removed.
- New IAP: **Lifetime**, non-consumable, `namflix.premium.lifetime`, Apple ID `6801891841`, $99.99, EN + AR localizations, promo image attached. Status *Prepare for Submission* — deliberately NOT added to review yet, because doing so re-locks its fields and Apple requires it to ship with a new app version anyway.

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
to E£399.99/E£4,999.99. Those are non-starters in the largest Arabic market.
**The Egypt numbers are a judgement call, not a measured one — change them freely.**

### Supabase
- `support` (v2) and `privacy` (v3) redeployed with the no-account copy; the `privacy` source is now **in the repo** (`supabase/functions/privacy/`) — it previously lived only on Supabase.
- All **6 rows deleted from `auth.users`** (incl. the reviewer's), so "we hold no user data" is literally true.
- **New signups disabled** (Authentication → Allow new users to sign up = OFF). Note: this page has a separate **Save changes** button; toggling alone does not persist.
- `delete-account` and `grant-lifetime` edge functions **deleted**; their source is preserved in `supabase/functions/_retired/` with a README explaining why they must not be redeployed.

### RevenueCat
- Product `namflix.premium.lifetime` created (App Store, non-consumable), attached to entitlement **`premium`**, and added to the **`$rc_lifetime`** package of the `default` offering.

---

## Restore-after-reinstall — verified against RevenueCat's docs

**iOS: the Restore button is the mechanism, by design.** RevenueCat's docs are
explicit that `restorePurchases()`

> "**should not** be triggered programmatically, since it may cause OS level
> sign-in prompts to appear, and should only be called from some user interaction
> (e.g. tapping a 'Restore' button.)"

So auto-restoring on launch is not an option we are missing — it is something the
SDK tells you not to do. Our code calls it only from `onRestore` in
`app/premium.tsx`, which is correct. The explanatory line above that button is the
whole fix, and it is in place.

**Android: covered by Auto Backup, and now pinned.** RevenueCat's own mitigation
for anonymous users is to make sure its data is backed up to the user's Google
account so the anonymous id — and with it the entitlement — comes back on
reinstall. That depends on `android:allowBackup`. Expo's default is `true`
(`getAllowBackup()` in `@expo/config-plugins` returns `config.android?.allowBackup ?? true`),
so this was already working, but it was working *by accident*. It is now set
explicitly in `app.json`:

```json
"android": { "allowBackup": true }
```

Do not remove it. It is load-bearing for purchase recovery, which is not obvious
from the flag's name.

**⚠️ The Billing Client 8 trap — we are on the right side of it, deliberately.**
From Play Billing 8, Google removed the ability to query *consumed* one-time
purchases, so they cannot be restored. RevenueCat **auto-consumes any product
configured as a consumable in its dashboard**, and a misconfigured one-time
product gets consumed automatically. For an app with no accounts — exactly ours —
that purchase would be **permanently unrecoverable**.

`namflix.premium.lifetime` is configured **Non-consumable** in RevenueCat
(verified on the product page). If anyone ever flips it to Consumable, every
Lifetime buyer on Android silently loses their purchase on reinstall with no way
back. Treat that setting as immutable.

**Still unverified, and only testable by doing it:** no purchase has ever been
made through this app. The path is correct by construction and now matches the
documented guidance, but it is unexercised. Do a sandbox purchase on each platform
before trusting it.

Sources: [Restoring Purchases](https://www.revenuecat.com/docs/getting-started/restoring-purchases) ·
[Restoring consumable purchases won't work in Billing Client 8](https://www.revenuecat.com/docs/known-store-issues/play-billing-library/restore-consumable-purchases-bc8)

---

## Free-Lifetime redeem code

Built on **Apple Offer Codes**, not a hand-rolled code system. That matters: we
never see or validate the code, Apple does — so there is no secret in the bundle
to extract, and the giveaway is switched off from App Store Connect rather than by
shipping a build.

**Done:**
- Offer **"Lifetime Free Code"** created on the Lifetime IAP — **Free Offer**, all
  175 storefronts, and eligibility set to **all three** customer groups (never
  purchased / purchased in the last 30 days / purchased more than 30 days ago), so
  the code works for anybody.
- `redeemOfferCode()` + `canRedeemInApp()` in `lib/purchases.ts`, wired to a
  **"Redeem a code"** control under Restore on the paywall (hidden once premium is
  active). iOS shows Apple's native redemption sheet; Android gets a one-line
  instruction, because Play has no in-app sheet — codes are redeemed in the Play
  Store app and arrive on the next entitlement sync.
- Redemption is silent to us, so after the sheet closes the code re-reads the
  entitlement instead of trusting a return value.

**To turn the giveaway off:** App Store Connect → the Lifetime IAP → Offer Codes →
**Deactivate**. Takes effect immediately, no build.

**⚠️ Blocked until approval — the one remaining step.** Apple:

> "To create custom codes, your in-app purchase must be approved by App Review,
> and your app must be in the Ready for Distribution state."

So the actual memorable code string (e.g. `NAMFLIX-FRIENDS`) cannot be minted yet.
Everything around it is finished and waiting. **After the app is approved:** open
that offer → **Create Custom Codes** → pick the word and a redemption limit. One
click, no build, no resubmission.

The redemption URL template is already live for one-time codes:
`https://apps.apple.com/redeem?ctx=offercodes&id=6794132000&code=CODE`

---

## What is left

### 1. Build (blocked here — the CLI call was declined in-session)
```bash
cd /Users/mohamed/Desktop/namflix/namflix-app && npx eas-cli build --platform all --profile production
```

### 2. Google Play — none of it could be done from this session
`play.google.com` is **blocked at the tool layer**, so every Play item is outstanding:
- create `namflix.premium.lifetime` as a **one-time product**
- add it to RevenueCat's Play Store app + the `$rc_lifetime` package
- apply the same regional pricing (especially Egypt)
- update the **Data safety** form → Purchase history only; remove Email address and User IDs
- keep the closed-testing track running: a **personal** developer account needs **12 testers × 14 continuous days** before production unlocks

### 3. Resubmit on iOS
Upload build 14 → reassemble the submission (app version + `Namflix paid` group +
Monthly + Yearly + **Lifetime**) → submit → paste `store/ios/REVIEW_REPLY.md`.

⚠️ `REVIEW_REPLY.md` says the image was *replaced*, not removed. Keep it that way —
Apple checks the claim against the listing.

### 4. Optional, high value
7-day introductory offer on the yearly plan. App Store Connect only, no build —
`readFreeTrial` in `lib/purchases.ts` already reads it from StoreKit and only
advertises a trial that actually exists.

---

## Decisions worth not relitigating

- **No ads.** Contradicts the published "no ads, no trackers" policy, wrong for a 3 a.m. sleep app, and worth roughly one yearly subscriber per month at this volume.
- **Keep the free tier** (`lib/freeTier.ts` — breathing, cognitive shuffle, Night Rescue, 6 sounds). It is the word-of-mouth engine.
- **Lifetime at 2.5× yearly**, not a token price. A cheap permanent unlock cannibalises the subscription forever.
