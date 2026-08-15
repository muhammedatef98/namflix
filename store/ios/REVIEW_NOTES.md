# App Review notes — Namflix 1.0.0

Paste the **"For the reviewer"** block below into App Store Connect →
*App Review Information → Notes*. The rest of this file is the internal
checklist behind it.

---

## For the reviewer (paste this)

```
Namflix is an evidence-based sleep-support app (ambient sound, CBT-I style
techniques, guided wind-down journeys). Bilingual: English and Arabic.

SIGN-IN
None. Namflix has no accounts and no sign-in screen — the app opens straight
into its content. No demo credentials are needed.

FREE WITHOUT ANY PURCHASE
The app is usable with no payment: 4·7·8 breathing, the
cognitive shuffle, the "Boring on Purpose" hub, Night Rescue (the 3 a.m. mode)
and six ambient sounds are permanently free. The rest is premium.

IN-APP PURCHASES
Two auto-renewable subscriptions in one group, entitlement handled by
RevenueCat:
  namflix.premium.monthly  — $4.99 / month
  namflix.premium.yearly   — $39.99 / year
Both are reachable from the paywall (home banner "PREMIUM", or any locked
feature). The paywall lists what the subscription includes, the billed price,
Restore Purchases, and tappable Terms of Use (Apple standard EULA) and Privacy
Policy links.

LIMITED-TIME LAUNCH OFFER
Until 28 August 2026 the app also offers a free "Lifetime" unlock (no charge,
no purchase) as a launch promotion. It is granted directly by us, not through
StoreKit, so it is not an alternative payment method — nothing is sold outside
Apple's IAP. After that date the card disappears and the subscriptions are the
only way to unlock.

DONATION LINK
Home → Support → "Buy me a coffee" opens ko-fi.com in Safari (outside the app)
for voluntary tips. It unlocks no content, features or tiers — everything in
the app is available without it. Included per Guideline 3.2.1.

BACKGROUND AUDIO
UIBackgroundModes: audio is used so sleep sounds keep playing with the screen
off — this is the app's core function.

PRIVACY
No ads, no ad identifiers, no analytics or tracking SDKs, so no ATT prompt.
No personal data is collected at all: there are no accounts, so there is no
e-mail address and nothing held on our servers. Preferences, favourites and
nightly check-ins live only on the device and go when the app is deleted, so
there is no account-deletion flow to provide. Privacy policy is in-app (Home →
Privacy policy) and at
https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/privacy

HEALTH
Educational self-help content only. It does not diagnose or treat, and a
"not medical care — see a clinician" disclaimer is shown at the bottom of the
home screen and in the privacy policy.

Support: Namflix.sleep@gmail.com
```

---

## Internal pre-submit checklist

### Must be true in App Store Connect before submitting
- [ ] Both subscriptions attached to **this version** (In-App Purchases section
      of the version page), each with localisation + review screenshot, state
      "Ready to Submit" — otherwise Guideline 2.1(b).
- [ ] Privacy Policy URL filled in (App Information).
- [ ] Terms of Use: either the EULA field, or the Apple standard EULA link in
      the description — the app already links it on the paywall.
- [ ] Support URL filled in (Guideline 1.5):
      `https://eqwkyyrahwvhjflweado.supabase.co/functions/v1/support`
- [ ] Optional but the biggest conversion lever: add a 7-day **introductory
      free trial** to the yearly subscription in App Store Connect. No build is
      needed — the paywall reads the trial from StoreKit and only then shows
      "7 days free, then …" plus the required trial disclosure. If no trial is
      configured, none is advertised.
- [ ] App Privacy answers match reality: **Purchase History only** (App
      Functionality). Email Address and User ID must be REMOVED — accounts no
      longer exist. No tracking, no third-party advertising.
- [ ] Age rating questionnaire completed (expect 4+).
- [ ] Category: Health & Fitness (alt: Lifestyle).
- [ ] Screenshots show the app in use (no splash, and no login screen — it is
      gone) — 1290×2796 set is in
      `store/ios/screenshots/iphone/{en,ar}`.
- [ ] Description contains no other platform names ("Android", "Google Play")
      and no price claims that can drift out of date.

### Must be true in the build
- [x] Privacy manifest declares required-reason APIs and an EMPTY
      `NSPrivacyCollectedDataTypes` (`ios.privacyManifests` in app.json) —
      it must not claim e-mail or user ID any more.
- [x] `ITSAppUsesNonExemptEncryption: false`.
- [x] No microphone / camera / location usage strings in Info.plist.
- [x] Restore Purchases on the paywall.
- [x] Terms + Privacy links on the paywall.
- [x] No accounts, so 5.1.1(v) account deletion does not apply.
- [x] No sign-in gate anywhere — the app opens directly into content.
- [x] Paid buttons only render when StoreKit actually returns a purchasable
      product, so a price is never shown without a working purchase.
