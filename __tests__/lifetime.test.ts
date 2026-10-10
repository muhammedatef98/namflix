// Remote config must never hand out a free Lifetime by accident, and the paid
// Lifetime must be found in the store offering.
const mockSingle = jest.fn();
jest.mock('@/lib/config', () => ({ DEMO_MODE: false }));
jest.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ single: mockSingle }) }) }) },
}));
jest.mock('react-native-purchases', () => ({ default: {} }));

import { DEFAULT_CONFIG, fetchAppConfig } from '@/lib/remoteConfig';
import { DEFAULT_AD_POLICY } from '@/lib/ads/policy';
import { findPackage } from '@/lib/purchases';

describe('Lifetime remote config', () => {
  beforeEach(() => mockSingle.mockReset());

  it("defaults to 'off' — never free", () => {
    expect(DEFAULT_CONFIG.lifetimeMode).toBe('off');
    expect(DEFAULT_CONFIG.ads).toEqual(DEFAULT_AD_POLICY);
  });

  it("a network failure falls back to 'off'", async () => {
    mockSingle.mockRejectedValue(new Error('offline'));
    await expect(fetchAppConfig()).resolves.toMatchObject({ lifetimeMode: 'off' });
  });

  it("a query error or missing row falls back to 'off'", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'nope' } });
    await expect(fetchAppConfig()).resolves.toMatchObject({ lifetimeMode: 'off' });
  });

  it("missing or garbage values land on 'off'; only explicit 'free' / 'paid' pass", async () => {
    for (const [value, expected] of [
      [undefined, 'off'],
      [42, 'off'],
      ['FREE', 'off'],
      ['free', 'free'],
      ['paid', 'paid'],
    ] as const) {
      mockSingle.mockResolvedValue({ data: { id: 1, lifetime_mode: value }, error: null });
      await expect(fetchAppConfig()).resolves.toMatchObject({ lifetimeMode: expected });
    }
  });

  it('reads free_until and the ad policy from the same row', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 1, lifetime_mode: 'paid', free_until: '2026-12-31T00:00:00Z', ads_rewarded_daily_cap: 5 },
      error: null,
    });
    const cfg = await fetchAppConfig();
    expect(cfg.freeUntil).toBe('2026-12-31T00:00:00Z');
    expect(cfg.ads.rewardedDailyCap).toBe(5);
    expect(cfg.ads.enableInterstitials).toBe(false);
  });
});

describe('Lifetime package lookup', () => {
  const pkg = (identifier: string, packageType = 'CUSTOM') => ({
    packageType,
    product: { identifier, priceString: '$1' },
  });

  it('finds Lifetime by product id', () => {
    const packages = [pkg('namflix.premium.yearly', 'ANNUAL'), pkg('namflix.premium.lifetime')];
    expect(findPackage(packages, 'lifetime')?.product.identifier).toBe('namflix.premium.lifetime');
  });

  it("falls back to RevenueCat's LIFETIME package type when the store id differs", () => {
    const packages = [pkg('namflix.premium.monthly', 'MONTHLY'), pkg('com.namflix.lifetime_v2', 'LIFETIME')];
    expect(findPackage(packages, 'lifetime')?.product.identifier).toBe('com.namflix.lifetime_v2');
  });

  it('returns nothing when no Lifetime is offered (card stays hidden)', () => {
    expect(findPackage([pkg('namflix.premium.monthly', 'MONTHLY')], 'lifetime')).toBeUndefined();
  });

  it('never matches a subscription by package type alone', () => {
    expect(findPackage([pkg('x', 'LIFETIME')], 'yearly')).toBeUndefined();
  });
});
