# Namflix — Google Play Console Setup Pack

Everything needed to publish Namflix on Google Play. Values are ready to paste.
Steps marked **(you only)** require your Google account / legal / financial action
and cannot be automated.

---

## 0. Prerequisites / status

| Item | Status |
|---|---|
| Package name | `com.namflix.app` |
| Android build (.aab) | building on EAS — version code **5** (`eas build:list --platform android`) |
| App signing key | managed by EAS (reused across builds) |
| Privacy Policy URL | ✅ live → `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/privacy` |
| Support email | `muhammedatef98@gmail.com` |
| Play hi-res icon (512²) | ✅ `store/android/playstore-icon-512.png` |
| Feature graphic (1024×500) | ✅ `store/android/playstore-feature-1024x500.png` |
| Phone screenshots (min 2) | ⛔ still needed — capture from the running app |

> ⚠️ **IAP ordering:** Android in-app purchases need (a) the RevenueCat **Android**
> key `goog_…` set as an EAS env var, and (b) a **rebuild** afterwards. That key
> doesn't exist until you finish the RevenueCat + Play subscription setup below,
> so the *current* build (vc 5) is for getting the listing/testing track live —
> the **final** production build comes after step 6.

---

## 1. Create the app  **(you only)**

Play Console → **Create app**
- App name: **Namflix**
- Default language: **العربية (ar-EG)**  *(add English (US) later as a second listing)*
- App or game: **App**
- Free or paid: **Free**
- Declarations: tick Developer Program Policies + US export laws

## 2. Store listing → Main store listing

- **App name (30):** `Namflix`
- **Short description (80):**
  - AR: `نوم أعمق بأصوات وتنفّس وهدوء قائم على الأدلة — ممل عن قصد.`
  - EN: `Evidence-based sleep sounds, breathing & calm — boring on purpose.`
- **Full description (4000):** see `listing-ar.txt` / `listing-en.txt` below.
- **App icon:** upload `playstore-icon-512.png`
- **Feature graphic:** upload `playstore-feature-1024x500.png`
- **Phone screenshots:** 2–8, PNG/JPG, 16:9 or 9:16, min edge ≥ 320px, max ≥ 1080px.
- **App category:** **Health & Fitness** (alt: Lifestyle)
- **Tags:** sleep, relaxation, meditation, sounds
- **Contact:** email `muhammedatef98@gmail.com`

## 3. Dashboard "Set up your app" answers

| Section | Answer |
|---|---|
| **App access** | All functionality available without special access *(guest mode needs no login)* |
| **Ads** | **No**, the app has no ads |
| **Content rating** | Start questionnaire; category **Reference / Health**; answers: no violence, no sexual content, no profanity, no drugs, no gambling → expect **Everyone / PEGI 3**. Email: `muhammedatef98@gmail.com` |
| **Target audience** | Age groups: **18 and over** (avoid Families policy). Not appealing to children: **No** |
| **News app** | No |
| **Health apps** | It's wellness/education, **not** a medical device. If asked, declare it does **not** provide medical/health-monitoring features |
| **Government app** | No |
| **Financial features** | No |
| **Privacy Policy** | `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/privacy` |

## 4. Data safety form

Namflix collects very little. Declare exactly:

- **Does your app collect or share user data?** Yes (minimal).
- **Data types:**
  - **Email address** — Collected, **not** shared. Purpose: *Account management*.
    Optional (only if the user signs in; guest mode collects none). Not for ads.
  - **Purchase history** — Collected (via Google Play Billing / RevenueCat), not shared.
    Purpose: *App functionality* (unlock premium, restore).
  - **Crash logs & Diagnostics** — Collected (Sentry), not shared. Purpose: *Analytics /
    App functionality* (crash fixing). No advertising ID.
- **Security:** Data is **encrypted in transit** — Yes.
- **Deletion:** Users **can request data deletion** — Yes. In-app: Home → Delete account
  (immediate & permanent). Also documented in the privacy policy.
- **No** ad ID, **no** location, **no** contacts, **no** health data, **no** data sold.

## 5. In-app products → Subscriptions  **(you only, needs a build uploaded first)**

Monetize → Subscriptions → **Create subscription** (use the SAME ids as iOS):

| Subscription ID | Name | Base plan | Billing period | Price (base, USD) | Auto-renew |
|---|---|---|---|---|---|
| `namflix.premium.monthly` | Namflix Premium (Monthly) | `monthly-auto` | 1 month | **$4.99** | On |
| `namflix.premium.yearly` | Namflix Premium (Yearly) | `yearly-auto` | 1 year | **$39.99** | On |

- Let Google auto-convert to local prices (175 markets, same as App Store).
- Grace period / account hold: keep Google defaults.
- Benefits text (optional): "Unlock every soundscape, program & mixer."

## 6. RevenueCat — Android side  **(you only)**

1. Play Console → API access → create/link a **Google service account**, grant it
   Play permissions (Financial data, Manage orders).
2. RevenueCat → project `5da21fd9` → **+ New app → Play Store**, upload that service
   account JSON, set package `com.namflix.app`.
3. Attach both products to the existing entitlement **`premium`** and offering **`default`**.
4. Copy the **public Android SDK key** (starts `goog_`).
5. Set it on EAS + local:
   ```bash
   eas env:create production --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_XXX --visibility sensitive --non-interactive
   ```
   (and uncomment the line in local `.env`)
6. **Rebuild + submit:**
   ```bash
   eas build --platform android --profile production
   eas submit --platform android --profile production --latest
   ```

## 7. Release  **(you only)**

1. Testing → **Internal testing** → create release → upload the .aab (or use
   `eas submit`) → add your email as a tester → install & verify (icon, sounds,
   paywall shows real prices once step 6 is done).
2. When happy → **Production** → create release → roll out.

---

## Store copy

### listing-ar.txt (العربية)
```
نامفلكس تطبيق للنوم مبني على الأدلة العلمية — بسيط، هادئ، وممل عن قصد.

بدل ما يشدّك ويصحّيك، نامفلكس مصمَّم يهدّيك:
• مكتبة أصوات نوم تقدر تمزجها بنفسك: مطر، أمواج، ضجيج أبيض، ليل، ونار هادئة.
• تمارين تنفّس ومسح للجسد واسترخاء عضلي تدريجي — كلها بأدلة سريرية.
• قسم "ملل عن قصد" لتهدئة العقل والجسد وقت الأرق.
• وضع ضيف بدون حساب، وثيم داكن دافئ مريح للعين ليلاً.
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
• Guest mode with no account, and a warm dark theme that's easy on night-time eyes.
• No ads, no trackers, minimal data.

Namflix offers educational relaxation content; it is not a medical device or medical advice.

The free version is enough to start. Premium unlocks every sound, program and mixer.
```
