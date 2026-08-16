# Namflix — Google Play Console Setup Pack

Everything needed to publish Namflix on Google Play. Values are ready to paste.
Steps marked **(you only)** need your Google account / legal / financial action, or a
file upload — neither can be automated from here.

_Last verified: 2026-08-01, right after the iOS 1.0 submission (build 13)._

---

## 0. Prerequisites / status

| Item | Status |
|---|---|
| Package name | `com.namflix.app` |
| Android build (.aab) | version code **8** building on EAS — id `7cafb7d5-3380-4428-a32a-34e6b2d0652e` |
| App signing key | managed by EAS (same key reused across builds) |
| RevenueCat Android key | ✅ already on EAS production (`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_…`) |
| Privacy Policy URL | ✅ live → `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/privacy` |
| Support URL | ✅ live → `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/support` |
| Support email | `Namflix.sleep@gmail.com` |
| Play hi-res icon (512²) | ✅ `store/android/playstore-icon-512.png` |
| Feature graphic (1024×500) | ✅ `store/android/playstore-feature-1024x500.png` |
| Phone screenshots | ✅ 4 EN + 4 AR, 1080×1920 → `store/android/screenshots/phone/{en,ar}/` |

> **Build 8 already contains the RevenueCat Android key**, so unlike the old note in this
> file there is no "build twice" problem: this .aab can go straight to production once the
> Play subscriptions exist. Products are only *read* at runtime — creating them in Play
> after uploading needs no rebuild.

### ⚠️ Personal-account gate (check this first)

If your Play developer account is a **personal** account (not an organization), Google
requires a **closed test with at least 12 testers opted in for 14 continuous days**
before you can apply for production access. Organization accounts are exempt.
Check Play Console → Dashboard; if that requirement is showing, plan for the 14 days —
everything below still applies, you just release to closed testing first.

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
