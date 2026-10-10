/**
 * Locally granted premium — a claimed free Lifetime or a redeemed lifetime
 * code, both stored on device as namflix.plan = 'lifetime-free' — must count as
 * premium AND must never reach the ads SDK: no consent, no load, no preload.
 *
 * Renders the real PremiumProvider + AdsProvider; only the store, remote
 * config, audio and the AdMob wrapper are replaced. The free-user control case
 * proves the spies would see an ad request if the premium bypass broke.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@/lib/remoteConfig', () => {
  const { DEFAULT_AD_POLICY } = jest.requireActual('@/lib/ads/policy');
  const config = { lifetimeMode: 'off', freeUntil: null, ads: { ...DEFAULT_AD_POLICY, enableInterstitials: true } };
  return { DEFAULT_CONFIG: config, fetchAppConfig: jest.fn(async () => config) };
});

// Store not configured, as on a device before RevenueCat answers.
jest.mock('@/lib/purchases', () => ({
  configurePurchases: jest.fn(async () => false),
  hasActiveEntitlement: jest.fn(async () => false),
  getPurchasablePlans: jest.fn(async () => []),
  onEntitlementChange: jest.fn(() => () => undefined),
  buyPlan: jest.fn(),
  restorePurchases: jest.fn(),
}));

jest.mock('@/lib/redeemCodes', () => ({
  isValidLifetimeCode: (code: string) => code === 'GOOD-CODE',
}));

// Every way into AdMob, as spies. An ad unit is configured and the SDK is
// "in the binary", so a free user really would be shown an ad.
jest.mock('@/lib/ads/sdk', () => {
  const mockSlot = () => ({
    acquire: jest.fn(async () => ({ show: async () => ({ shown: true, earned: true }) })),
    preload: jest.fn(),
    takeIfReady: jest.fn(async () => null),
    clear: jest.fn(),
  });
  return {
  isAdsSdkAvailable: jest.fn(() => true),
  isAdsInitialized: jest.fn(() => true),
  prepareAds: jest.fn(async () => ({ canRequestAds: true, nonPersonalized: false })),
  privacyOptionsRequired: jest.fn(async () => false),
  showPrivacyOptions: jest.fn(),
  rewardedSlot: mockSlot(),
  interstitialSlot: mockSlot(),
  };
});
jest.mock('@/lib/ads/config', () => ({ adUnitId: () => 'test-unit' }));

jest.mock('@/contexts/PlaybackContext', () => ({
  usePlayback: () => ({ suspend: () => () => undefined, playing: false, timerMin: null }),
}));
jest.mock('@/contexts/MixerContext', () => ({
  useMixer: () => ({ suspend: () => () => undefined, hasMix: false, playing: false }),
}));
jest.mock('@/contexts/LocaleContext', () => ({ useLocale: () => ({ lang: 'en' }) }));
jest.mock('@/components/UnlockSheet', () => ({ UnlockSheet: () => null }));

import { PremiumProvider, usePremium } from '@/contexts/PremiumContext';
import { AdsProvider, useAds } from '@/contexts/AdsContext';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import * as sdk from '@/lib/ads/sdk';

type Probe = {
  premium: ReturnType<typeof usePremium>;
  ads: ReturnType<typeof useAds>;
  gate: ReturnType<typeof useFeatureGate>;
};

function Capture({ into }: { into: { current: Probe | null } }) {
  into.current = { premium: usePremium(), ads: useAds(), gate: useFeatureGate() };
  return null;
}

async function mount(): Promise<{ probe: () => Probe; tree: ReactTestRenderer }> {
  const ref: { current: Probe | null } = { current: null };
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(
      <PremiumProvider>
        <AdsProvider>
          <Capture into={ref} />
        </AdsProvider>
      </PremiumProvider>,
    );
  });
  return { probe: () => ref.current!, tree };
}

/** Try every path that could reach the ads SDK. */
async function exerciseEveryAdPath(p: () => Probe) {
  await act(async () => {
    p().gate.open('/player/rain-tent'); // a locked, non-free-tier sound
    p().ads.preloadRewarded();
    p().ads.noteSessionEnded();
    await p().ads.showRewarded('sound:rain-tent');
    await p().ads.maybeShowInterstitial('home_after_session');
  });
}

function adRequests(): number {
  return [
    sdk.prepareAds,
    sdk.rewardedSlot.acquire,
    sdk.rewardedSlot.preload,
    sdk.interstitialSlot.preload,
    sdk.interstitialSlot.takeIfReady,
  ].reduce((n, fn) => n + (fn as jest.Mock).mock.calls.length, 0);
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('locally granted premium gets no ads', () => {
  it("a stored 'lifetime-free' user is premium and makes no ad requests", async () => {
    await AsyncStorage.setItem('namflix.plan', 'lifetime-free');
    const { probe, tree } = await mount();

    expect(probe().premium.plan).toBe('lifetime-free');
    expect(probe().premium.isPremium).toBe(true);
    expect(probe().gate.isLocked('/player/rain-tent')).toBe(false);
    expect(probe().ads.canShowAds()).toBe(false);

    await exerciseEveryAdPath(probe);
    await act(async () => {
      expect(await probe().ads.showRewarded('sound:rain-tent')).toBe('premium');
    });
    expect(adRequests()).toBe(0);
    // Unlocked content opens directly — no lock sheet, no paywall detour.
    expect(mockPush).toHaveBeenCalledWith('/player/rain-tent');
    act(() => tree.unmount());
  });

  it('a user who redeems a lifetime code becomes premium and makes no ad requests', async () => {
    const { probe, tree } = await mount();
    expect(probe().premium.isPremium).toBe(false);

    await act(async () => {
      expect(await probe().premium.redeemLifetimeCode('nope')).toBe(false);
    });
    expect(probe().premium.isPremium).toBe(false);

    await act(async () => {
      expect(await probe().premium.redeemLifetimeCode('GOOD-CODE')).toBe(true);
    });
    expect(probe().premium.isPremium).toBe(true);
    expect(await AsyncStorage.getItem('namflix.plan')).toBe('lifetime-free');

    await exerciseEveryAdPath(probe);
    expect(adRequests()).toBe(0);
    act(() => tree.unmount());
  });

  it('control: a free user does reach the ads SDK (so the checks above can fail)', async () => {
    const { probe, tree } = await mount();
    expect(probe().premium.isPremium).toBe(false);
    expect(probe().gate.isLocked('/player/rain-tent')).toBe(true);
    // Free-tier routes never lock, ads or not.
    expect(probe().gate.isLocked('/breathe')).toBe(false);

    await act(async () => {
      expect(await probe().ads.showRewarded('sound:rain-tent')).toBe('rewarded');
    });
    expect(sdk.prepareAds).toHaveBeenCalled();
    expect(sdk.rewardedSlot.acquire).toHaveBeenCalled();
    act(() => tree.unmount());
  });
});
