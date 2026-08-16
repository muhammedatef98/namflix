# Namflix — Google Play Console Setup Pack

Everything needed to publish Namflix on Google Play. Values are ready to paste.
Steps marked **(you only)** need your Google account / legal / financial action, or a
file upload — neither can be automated from here.

_Last verified: 2026-08-16, after iOS 1.0 build 14 went to Waiting for Review._

---

## 0. Prerequisites / status

| Item | Status |
|---|---|
| Package name | `com.namflix.app` |
| Android build (.aab) | ✅ version code **10** — id `edbfbb04-da69-4e62-9598-eed5ab5d17d1` |
| App signing key | managed by EAS (same key reused across builds) |
| RevenueCat Android key | ✅ already on EAS production (`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_…`) |
| Privacy Policy URL | ✅ live → `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/privacy` |
| Support URL | ✅ live → `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/support` |
| Support email | `Namflix.sleep@gmail.com` |
| Play hi-res icon (512²) | ✅ `store/android/playstore-icon-512.png` |
| Feature graphic (1024×500) | ✅ `store/android/playstore-feature-1024x500.png` |
| Phone screenshots | ✅ 4 EN + 4 AR, 1080×1920 → `store/android/screenshots/phone/{en,ar}/` |

> 🚫 **Ship version code 10. Never ship version code 8.**
> vc8 (1 Aug) predates the fix for the free-Lifetime leak — in that build any failed
> `app_config` fetch granted a permanent free Lifetime. vc10 (16 Aug) is the post-fix
> artifact: accounts removed, leak closed, paid Lifetime and the redeem control present.
>
> A note on provenance, because it looks wrong at a glance: EAS labels vc10 with commit
> `da61e8d`, which is one commit *before* the account-removal commit `dfb9b7e`. That is
> because the tree was still uncommitted when the build ran and EAS archived the working
> tree. The build genuinely contains the new code — confirmed by the redeem control being
> visible in the shipped app, which exists only in the post-fix source.
>
> vc10 already contains the RevenueCat Android key, so there is no "build twice" problem:
> this .aab can go straight up once the Play products exist. Products are only *read* at
> runtime — creating them in Play after uploading needs no rebuild.
>
> ⚠️ `eas submit --platform android` fails non-interactively ("Google Service Account Keys
> cannot be set up in --non-interactive mode"). Upload the .aab by hand.

### ⚠️ Personal-account gate (check this first)

If your Play developer account is a **personal** account (not an organization), Google
requires a **closed test with at least 12 testers opted in for 14 continuous days**
before you can apply for production access. Organization accounts are exempt.
Check Play Console → Dashboard; if that requirement is showing, plan for the 14 days —
everything below still applies, you just release to closed testing first.

### What is actually outstanding (as of 2026-08-16)

iOS is done and awaiting review. Android is the whole remaining half:

- [ ] **Data safety form** — see §4a. The one item deliberately left unsaved.
- [ ] **Create `namflix.premium.lifetime`** as a one-time product — see §5a-ii.
- [ ] **RevenueCat Play side** — add that product to the Play app + `$rc_lifetime`.
- [ ] **Regional pricing** on all three products, Egypt set by hand — see §5a.
- [ ] **Sweep the English listing** for guest-mode / $4.99 copy. The Arabic listing was
      already corrected in console; English was believed clean but is unverified.
- [ ] **Closed testing** — 12 testers × 14 continuous days, if this is a personal account.

Still unverified on **both** platforms: a real production (non-sandbox) purchase, and on
Android a buy → uninstall → reinstall to confirm Auto Backup actually restores the
entitlement. Auto Backup is the entire Android restore story and it rests on
`android.allowBackup: true` in `app.json` — load-bearing despite the innocuous name.

---

## 1. Create the app  **(you only)**

Play Console → **Create app**
- App name: **Namflix**
- Default language: **العربية (ar)** *(add English (US) as a second listing)*
- App or game: **App**
- Free or paid: **Free** (with in-app purchases)
- Declarations: tick Developer Program Policies + US export laws

## 2. Store listing → Main store listing

- **App name (30):** `Namflix`
- **Short description (80):**
  - AR: `نوم أعمق بأصوات وتنفّس وهدوء قائم على الأدلة — ممل عن قصد.`
  - EN: `Evidence-based sleep sounds, breathing & calm — boring on purpose.`
- **Full description (4000):** see the copy blocks at the bottom of this file.
- **App icon:** `playstore-icon-512.png`
- **Feature graphic:** `playstore-feature-1024x500.png`
- **Phone screenshots:** upload `screenshots/phone/en/*.png` to the English listing and
  `screenshots/phone/ar/*.png` to the Arabic one (min 2, we have 4 each).
- **App category:** **Health & Fitness**
- **Tags:** sleep, relaxation, meditation, sounds
- **Contact:** email `Namflix.sleep@gmail.com`, website = the support URL above

## 3. Dashboard "Set up your app" answers

| Section | Answer |
|---|---|
| **App access** | All functionality available without special access — the app has no sign-in at all. (Premium is a purchase, not restricted access; no test account required.) |
| **Ads** | **No**, the app has no ads |
| **Content rating** | Questionnaire → category **Reference, News, or Educational**; no violence / sex / profanity / drugs / gambling. Answer **Yes** to references to health & medical topics if asked (the CBT-I program + sleep-restriction calculator) — this is the same driver that made iOS 13+. Email: `Namflix.sleep@gmail.com` |
| **Target audience** | Age groups: **18 and over**. Appeals to children: **No** |
| **News app** | No |
| **Health apps** | Declare it as a **wellness / health-education** app: **not** a medical device, does **not** provide diagnosis, treatment or health monitoring. No health data is collected. |
| **Government app** | No |
| **Financial features** | No |
| **Data safety** | See section 4 |
| **Privacy Policy** | `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/privacy` |

## 4. Data safety form — declare exactly this

Namflix collects almost nothing. **Match this to the privacy policy, not to an ideal —
the policy promises no accounts, no ads, no ad identifiers, no analytics trackers.**

⚠️ Updated 2026-08-09: accounts were removed from the app. If Email address or
User IDs are still declared on the form from an earlier submission, **remove them** —
a Data safety form that overstates collection is itself a policy violation.

### 4a. Walkthrough — do all three steps in ONE pass  **(outstanding)**

> **Status: not yet saved.** A previous attempt was deliberately discarded rather than
> saved half-corrected. Nothing was damaged, but nothing was fixed either — the live
> form still declares **"Username and other authentication"** and a **Delete account
> URL**, both describing an app that no longer exists.

**Why it must be one pass:** the wizard would not navigate *backwards* to the Data
types step — clicking the step tabs and the Back button both bounced forward to
Preview. If you correct the account question and then try to return for the data
types, you can get stuck on a form that reads **"No data collection declared"**, which
is *under*-declaring. RevenueCat receives purchase data off-device, so **Purchase
history must be declared** — and it must match the Apple App Privacy declaration,
which is already published as Purchase History only.

Play Console → Policy → **App content** → **Data safety** → Manage.

| # | Step | Do exactly this |
|---|---|---|
| 1 | **Data collection and security** | Select **"My app does not allow users to create an account."** The Delete account URL field disappears on its own — do not go looking for it. Answer the two follow-up questions **No**. |
| 2 | **Data types** | Tick **Purchase history** only. **Untick Email address. Untick User IDs.** Leave every other category unticked — no crash logs, no diagnostics, no ad ID, no location. |
| 3 | **Data usage and handling** | Purchase history → **Collected**, **not Shared**, processed **not** ephemerally. Purpose: **App functionality** only. Users can't request deletion → it is a store-side purchase record. Mark **Required**. |
| 4 | **Preview** | Must read **"Purchase history"**. If it says **"No data collection declared"**, step 2 did not take — start the wizard again rather than saving. |

Then **Save**, reload the page, and re-read it. Play Console has bitten this project
before by appearing to accept a change that did not persist.

⚠️ **Do not click by coordinates in this form.** Coordinate-based clicking lands one
row off here, and it once ticked **"Username, password, and other authentication"** by
accident — the precise opposite of the correction being made. Use the keyboard, or
verify every click by re-reading the row label afterwards.

- **Does your app collect or share user data?** → **Yes** (purchase history only).
- **Data types:**
  - **Purchase history** — Collected, **not** shared. Purpose: **App functionality**
    (unlock premium, restore purchases). Required for purchasers.
  - **Email address** — **NO.** There is no sign-in and no e-mail is ever requested.
  - **User IDs** — **NO.** RevenueCat keys the entitlement to the Google account;
    the app itself holds no user identifier.
- **Do NOT declare crash logs / diagnostics.** There is **no Sentry, no analytics SDK and
  no crash reporter** in the app — the stale `EXPO_PUBLIC_SENTRY_DSN` env var on EAS is
  unused by any code. Declaring it would be a false statement on the form.
- **No** ad ID, **no** location, **no** contacts, **no** health data, **no** data sold,
  **no** data shared with third parties.
- **Security:** encrypted in transit → **Yes**.
- **Deletion:** there is no account to delete, and no server-side user data. All app
  data is on-device and goes with an uninstall — state this rather than supplying a
  web deletion URL, which Play only requires for apps that create accounts.

## 5. Monetization

### 5a. Subscriptions  **(you only — needs a build uploaded first)**

Monetize → Subscriptions → **Create subscription** (same ids as iOS, RevenueCat shares them):

| Subscription ID | Name | Base plan | Billing period | Price (USD) | Auto-renew |
|---|---|---|---|---|---|
| `namflix.premium.monthly` | Namflix Premium (Monthly) | `monthly-auto` | 1 month | **$7.99** | On |
| `namflix.premium.yearly` | Namflix Premium (Yearly) | `yearly-auto` | 1 year | **$39.99** | On |

- **Do not let Google auto-convert every market.** Auto-conversion prices Egypt at US
  parity, which is a non-starter in the largest Arabic market. Match iOS by hand:

| | Monthly | Yearly | Lifetime |
|---|---|---|---|
| 🇺🇸 US | $7.99 | $39.99 | $99.99 |
| 🇸🇦 Saudi | SAR 34.99 | SAR 179.99 | auto |
| 🇦🇪 UAE | AED 29.99 | AED 149.99 | auto |
| 🇪🇬 **Egypt** | **E£99.99** | **E£499.99** | **E£1,299.99** |

  Monthly at $7.99 (not $4.99) is what takes the annual discount from 33% → 58%, which
  is the whole reason the yearly plan converts. Keep default grace period / account hold.
- Benefit text: "Unlock every soundscape, program and mixer."
- A free trial is optional and needs **no rebuild** — the paywall only shows a trial line
  when the store actually reports a zero-price intro offer (`readFreeTrial` in `lib/purchases.ts`).

### 5a-ii. Lifetime — one-time product  **(you only — outstanding)**

Monetize → **In-app products** (NOT Subscriptions) → Create product:

| Product ID | Name | Type | Price (USD) |
|---|---|---|---|
| `namflix.premium.lifetime` | Namflix Premium (Lifetime) | one-time | **$99.99** |

Then in RevenueCat: add it to the **Play Store** app and to the **`$rc_lifetime`**
package of the `default` offering, alongside the App Store product that is already there.

> ⚠️ **Set it Non-consumable in RevenueCat, and treat that as immutable.**
> From Play Billing 8 Google removed the ability to query *consumed* one-time purchases,
> and RevenueCat auto-consumes anything configured as a consumable. In an app with no
> accounts — exactly this one — a consumable Lifetime becomes **permanently
> unrecoverable** on reinstall, with no way back for the buyer.

The card only renders when `lifetime_mode = 'paid'` in `app_config` (it is), so the
product must exist on Play before an Android user opens the paywall.

### 5b. The Ko-fi tip is allowed, but keep it clean

`app/support.tsx` opens `https://ko-fi.com/muhammedatef98` in the **system browser**.
Google Play permits collecting **voluntary donations** outside Play Billing — the rule it
would break is unlocking anything for the payment. Ours unlocks nothing and says so on
screen, and the link never appears on the paywall. Leave it that way.

### 5c. RevenueCat — verify the Play side  **(you only)**

The `goog_…` key already exists, so most of this is probably done. Confirm:
1. Play Console → API access → a **Google service account** linked with Financial data +
   Manage orders permissions.
2. RevenueCat → Play Store app, package `com.namflix.app`, that service-account JSON uploaded.
3. Both products attached to entitlement **`premium`** and offering **`default`**.

## 6. Release  **(you only)**

1. Testing → **Closed testing** (or Internal testing) → create release → upload the .aab →
   add testers → install and verify: icon, sounds streaming, Arabic layout, real prices on
   the paywall once 5a is done.
2. If the 12-testers/14-days gate applies, run closed testing for the full 14 days.
3. **Production** → create release → roll out.

**The first upload is by hand.** `eas submit --platform android` fails with "Google
Service Account Keys cannot be set up in --non-interactive mode" until the key already
exists — that is the setup step failing, not the upload.

Once the app exists in Play Console and a service-account key is in `eas.json`
(`submit.production.android.serviceAccountKeyPath`), later uploads can be automated with:

```bash
eas submit --platform android --profile production --latest
```

---

## Store copy

### listing-ar.txt (العربية)
```
نامفلكس تطبيق للنوم مبني على الأدلة العلمية — بسيط، هادئ، وممل عن قصد.

بدل ما يشدّك ويصحّيك، نامفلكس مصمَّم يهدّيك:
• مكتبة أصوات نوم تقدر تمزجها بنفسك: مطر، أمواج، ضجيج أبيض، ليل، ونار هادئة.
• تمارين تنفّس ومسح للجسد واسترخاء عضلي تدريجي — كلها بأدلة سريرية.
• قسم "ملل عن قصد" لتهدئة العقل والجسد وقت الأرق.
• وضع "الإنقاذ الليلي" لصحوة الثالثة فجرًا.
• بدون تسجيل ولا حساب — افتحه فيشتغل. وثيم داكن دافئ مريح للعين ليلاً.
• بدون إعلانات، وبدون تتبّع، وبأقلّ قدر من البيانات.

نامفلكس محتوى تعليمي للاسترخاء والنوم، وليس جهازًا طبيًا أو نصيحة طبية.

النسخة المجانية تكفي للبداية. Premium يفتح كل الأصوات والبرامج والمازج.
```

### listing-en.txt (English)
```
Namflix is an evidence-based sleep app — simple, calm, and boring on purpose.

Instead of grabbing your attention, Namflix is built to let it go:
• A library of sleep sounds you mix yourself: rain, waves, white noise, night, soft fire.
• Breathing, body-scan and progressive muscle relaxation — all clinically grounded.
• A "Boring on Purpose" section to quiet the mind and body when sleep won't come.
• Night Rescue, a dedicated mode for the 3 a.m. wake-up.
• No sign-up, no account — just open it. Warm dark theme that's easy on night-time eyes.
• No ads, no trackers, minimal data.

Namflix offers educational relaxation content; it is not a medical device or medical advice.

The free version is enough to start. Premium unlocks every sound, program and mixer.
```
