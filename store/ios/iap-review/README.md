# IAP review assets

## Review screenshots (the ones App Review actually sees)

| File | Attached to |
|---|---|
| `paywall-subscriptions.png` | Monthly, Yearly |
| `paywall-lifetime.png` | Lifetime |

Both are 1206x2622, captured 19 Aug 2026 from **build 15** running in the iOS
Simulator against `ios/Namflix.storekit` (a StoreKit configuration file), so the
prices are the real configured ones: Yearly $39.99, Monthly $7.99, Lifetime
$99.99, and "Save 58% vs monthly".

### Why the old one had to go

`paywall.png` (kept for history) was the previous review screenshot on all three
products. By 18 Aug it had drifted badly:

- "Claim it free" + a 28-day countdown — the Egypt giveaway was cancelled
- Monthly **$4.99** — the price is $7.99
- "Save 33% vs monthly" — it is 58%
- **no Lifetime card at all**, yet it was the screenshot attached to Lifetime

That is a Guideline 2.3.2 rejection waiting to happen. It was replaced before the
19 Aug resubmission.

### How to re-capture after a UI or price change

```bash
# 1. point the scheme at the StoreKit config (LaunchAction ->
#    <StoreKitConfigurationFileReference identifier = "../../Namflix.storekit">)
# 2. build and run on a simulator
npx expo run:ios --device "<simulator udid>" --scheme Namflix
# 3. fresh install matters: a leftover test purchase makes the paywall render
#    "You're on Lifetime" instead of the plan cards
xcrun simctl uninstall <udid> com.namflix.app
xcrun simctl install  <udid> <path-to>/Namflix.app
xcrun simctl launch   <udid> com.namflix.app
xcrun simctl openurl  <udid> "namflix://premium"
xcrun simctl io <udid> screenshot paywall.png
# 4. revert the scheme afterwards — it is not needed for EAS/production builds
```

## Promotional images (App Store Promotion)

`promo-1024.png` (`make-promo.js`) is the **only** promotional image in use, on
Lifetime, and only so offer-code redemptions have artwork.

**Monthly and Yearly must have no promotional image.** Apple rejected build 14 on
18 Aug 2026 under 2.3.2 because Monthly and Lifetime carried the *same* file.
`make-promo-monthly.js` / `promo-monthly-1024.png` exist as a distinct fallback
if a Monthly image is ever genuinely wanted — but deleting is the safer answer,
since we do not promote in-app purchases on the App Store.

Deleting a subscription image **is** possible, despite what the older reviewer
notes claimed. The Delete control is simply hidden while a submission is open:
cancel or remove the item from the submission first, and it appears.
