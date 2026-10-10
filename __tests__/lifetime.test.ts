// Remote config must never fall back to a free Lifetime, whatever happens.
const mockSingle = jest.fn();
jest.mock('@/lib/config', () => ({ DEMO_MODE: false }));
jest.mock('@/lib/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ single: mockSingle }) }) }) },
}));
jest.mock('react-native-purchases', () => ({ default: {} }));

import { DEFAULT_CONFIG, fetchAppConfig, normaliseMode } from '@/lib/remoteConfig';
import { findPackage } from '@/lib/purchases';

describe('paid Lifetime fallback', () => {
  beforeEach(() => mockSingle.mockReset());

  it('defaults to paid', () => {
    expect(DEFAULT_CONFIG.lifetimeMode).toBe('paid');
  });

  it("treats legacy 'free', missing and garbage values as paid; only 'off' hides it", () => {
    expect(normaliseMode('free')).toBe('paid');
    expect(normaliseMode(undefined)).toBe('paid');
    expect(normaliseMode(42)).toBe('paid');
    expect(normaliseMode('paid')).toBe('paid');
    expect(normaliseMode('off')).toBe('off');
  });

  it('a network failure falls back to paid', async () => {
    mockSingle.mockRejectedValue(new Error('offline'));
    await expect(fetchAppConfig()).resolves.toMatchObject({ lifetimeMode: 'paid' });
  });

  it('a query error or missing row falls back to paid', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'nope' } });
    await expect(fetchAppConfig()).resolves.toMatchObject({ lifetimeMode: 'paid' });
  });

  it("a row still saying 'free' is read as paid", async () => {
    mockSingle.mockResolvedValue({ data: { id: 1, lifetime_mode: 'free' }, error: null });
    await expect(fetchAppConfig()).resolves.toMatchObject({ lifetimeMode: 'paid' });
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
