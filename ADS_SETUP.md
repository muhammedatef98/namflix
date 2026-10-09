# Ads (AdMob) — setup & how it works

Free users can unlock a locked sound / tool / method for 24 h by watching one
short rewarded ad (max 3 per day). Premium (any subscription or Lifetime) =
zero ads and zero ad requests. **No app-open ads, no ads on launch.** Optional
interstitials exist but are **OFF** (`ENABLE_INTERSTITIALS = false`).

## Where things live

| What | File |
|---|---|
| Pure rules (expiry, daily cap, interstitial gating, premium bypass) | `lib/ads/rules.ts` |
| Policy defaults + remote overrides | `lib/ads/policy.ts`, `supabase/app_config_ads.sql` |
| SDK wrapper (lazy init, UMP consent, ATT, load/show with timeouts) | `lib/ads/sdk.ts` |
| Rewarded / interstitial orchestration | `lib/ads/flows.ts` |
| React API: `canShowAds()`, `showRewarded(itemId)`, `isTemporarilyUnlocked(itemId)`, `maybeShowInterstitial(trigger)` | `contexts/AdsContext.tsx` |
| Lock sheet UI | `components/UnlockSheet.tsx` |
| Central gate (`open(route)`, badges) | `hooks/useFeatureGate.ts` |
| Ad unit ids / test ids | `lib/ads/config.ts`, `app.config.js` |
| Analytics events (local-only until you add a sink) | `lib/analytics.ts` |

## Manual checklist

1. **AdMob**: create the account → add the app twice (iOS `com.namflix.app`,
   Android `com.namflix.app`) → create a **Rewarded** unit per platform (and an
   Interstitial unit per platform only if you plan to enable them).
2. **Fill in the ids** as EAS environment variables for the `production`
   environment (and `.env` locally): `ADMOB_IOS_APP_ID`, `ADMOB_ANDROID_APP_ID`,
   `REWARDED_UNIT_IOS`, `REWARDED_UNIT_ANDROID` (+ `INTERSTITIAL_UNIT_*`).
   They are read at build time → **a new native build is required** (not OTA).
3. **app-ads.txt**: publish the line AdMob gives you at
   `https://<your developer website>/app-ads.txt` (the domain listed as the
   developer website in App Store Connect and Play Console).
4. **Privacy forms**: update App Store privacy labels and the Play Data safety
   form (advertising data, device/advertising ID, coarse location, product
   interaction, diagnostics — shared with Google for advertising). Update the
   hosted privacy policy (`functions/v1/privacy`) to match `app/privacy.tsx`.
5. **UMP**: AdMob → Privacy & messaging → create the GDPR (EEA/UK) message —
   and optionally the US-states message and the IDFA explainer — then publish.
6. **Remote config** (optional): run `supabase/app_config_ads.sql`; then tune
   `ads_*` columns in `app_config` without a release.
7. **Test on real devices** with a `preview` build (uses Google test ads via
   `ADS_USE_TEST_IDS=1`): lock → watch ad → unlocked + badge; 4th unlock shows
   the daily-limit message; airplane mode shows "No ad available"; a running
   mix pauses during the ad and resumes after; subscribing hides every ad option
   immediately; ATT appears only on the first "watch ad" tap.
