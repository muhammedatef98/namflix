/**
 * Dynamic layer over app.json — only for values that come from build-time env.
 *
 * AdMob (set these as EAS environment variables / in .env; see .env.example):
 *   ADMOB_IOS_APP_ID, ADMOB_ANDROID_APP_ID          → native App IDs (Info.plist / AndroidManifest)
 *   REWARDED_UNIT_IOS, REWARDED_UNIT_ANDROID        → rewarded ad units
 *   INTERSTITIAL_UNIT_IOS, INTERSTITIAL_UNIT_ANDROID → interstitial ad units (only used if enabled)
 *   ADS_USE_TEST_IDS=1                              → force Google test units (dev/preview builds)
 *
 * Without real App IDs the build falls back to Google's official SAMPLE App
 * IDs, which only ever serve test ads — so a missing env var can never crash
 * the SDK or serve live ads from an unconfigured build.
 */

// Google's documented sample AdMob App IDs (test-only).
const SAMPLE_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
const SAMPLE_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

// Google's recommended SKAdNetwork identifiers for AdMob
// (https://developers.google.com/admob/ios/3p-skadnetworks).
const SK_AD_NETWORK_ITEMS = [
  'cstr6suwn9', '4fzdc2evr5', '2fnua5tdw4', 'ydx93a7ass', 'p78axxw29g', 'v72qych5uu',
  'ludvb6z3bs', 'cp8zw746q7', '3sh42y64q3', 'c6k4g5qg8m', 's39g8k73mm', 'wg4vff78zm',
  '3qy4746246', 'f38h382jlk', 'hs6bdukanm', 'mlmmfzh3r3', 'v4nxqhlyqp', 'wzmmz9fp6w',
  'su67r6k2v3', 'yclnxrl5pm', 't38b2kh725', '7ug5zh24hu', 'gta9lk7p23', 'vutu7akeur',
  'y5ghdn5j9k', 'v9wttpbfk9', 'n38lu8286q', '47vhws6wlr', 'kbd757ywx3', '9t245vhmpl',
  'a2p9lx4jpn', '22mmun2rn5', '44jx6755aq', 'k674qkevps', '4468km3ulz', '2u9pt9hc89',
  '8s468mfl3y', 'klf5c3l5u5', 'ppxm28t8ap', 'kbmxgpxpgc', 'uw77j35x4d', '578prtvx9j',
  '4dzt52r2t5', 'tl55sbb4fm', 'c3frkrj4fj', 'e5fvkxwrpn', '8c4e2ghe7u', '3rd42ekr43',
  '97r2b46745', '3qcr597p9d',
].map((id) => `${id}.skadnetwork`);

const env = (name) => {
  const v = process.env[name];
  return v && v.trim().length > 0 ? v.trim() : undefined;
};

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-google-mobile-ads',
      {
        iosAppId: env('ADMOB_IOS_APP_ID') ?? SAMPLE_IOS_APP_ID,
        androidAppId: env('ADMOB_ANDROID_APP_ID') ?? SAMPLE_ANDROID_APP_ID,
        // Keep launch untouched: no measurement work until the SDK is started
        // on demand (first "watch an ad").
        delayAppMeasurementInit: true,
        skAdNetworkItems: SK_AD_NETWORK_ITEMS,
      },
    ],
  ],
  extra: {
    ...config.extra,
    ads: {
      rewardedUnitIos: env('REWARDED_UNIT_IOS'),
      rewardedUnitAndroid: env('REWARDED_UNIT_ANDROID'),
      interstitialUnitIos: env('INTERSTITIAL_UNIT_IOS'),
      interstitialUnitAndroid: env('INTERSTITIAL_UNIT_ANDROID'),
      useTestIds: env('ADS_USE_TEST_IDS') === '1',
    },
  },
});
