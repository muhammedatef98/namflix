/**
 * Ad unit ids. Real ids come from build-time env (see app.config.js), injected
 * into `expo.extra.ads`:
 *
 *   REWARDED_UNIT_IOS / REWARDED_UNIT_ANDROID
 *   INTERSTITIAL_UNIT_IOS / INTERSTITIAL_UNIT_ANDROID
 *   ADS_USE_TEST_IDS=1   → force Google's test units (dev / preview builds)
 *
 * Development builds (__DEV__) ALWAYS use Google's official test units, so a
 * developer can never click a live ad. A production build with no real id
 * configured simply has no ads (never a test unit in production).
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export type AdFormat = 'rewarded' | 'interstitial';

type AdsExtra = {
  rewardedUnitIos?: string;
  rewardedUnitAndroid?: string;
  interstitialUnitIos?: string;
  interstitialUnitAndroid?: string;
  useTestIds?: boolean;
};

// Google's public sample units — https://developers.google.com/admob/ios/test-ads
// and https://developers.google.com/admob/android/test-ads. Hardcoded (rather
// than imported from the SDK) so reading them never loads the native module.
export const GOOGLE_TEST_UNITS: Record<AdFormat, { ios: string; android: string }> = {
  rewarded: {
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  },
  interstitial: {
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  },
};

function adsExtra(): AdsExtra {
  const extra = Constants.expoConfig?.extra as { ads?: AdsExtra } | undefined;
  return extra?.ads ?? {};
}

export function usingTestAds(): boolean {
  return __DEV__ || adsExtra().useTestIds === true;
}

/** The ad unit for this platform, or null when ads of that format aren't configured. */
export function adUnitId(format: AdFormat): string | null {
  const os = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : null;
  if (!os) return null;
  if (usingTestAds()) return GOOGLE_TEST_UNITS[format][os];
  const e = adsExtra();
  const id =
    format === 'rewarded'
      ? os === 'ios'
        ? e.rewardedUnitIos
        : e.rewardedUnitAndroid
      : os === 'ios'
        ? e.interstitialUnitIos
        : e.interstitialUnitAndroid;
  return id && id.trim().length > 0 ? id.trim() : null;
}
