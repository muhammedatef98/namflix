import { DEFAULT_AD_POLICY, parseAdPolicy, type AdPolicy } from '@/lib/ads/policy';
import {
  canShowAds,
  grantUnlock,
  initialAdsState,
  interstitialBlockReason,
  isQuietHour,
  isUnlockActive,
  pruneExpiredUnlocks,
  rewardedCapReached,
  rewardedUsedToday,
  unlockRemainingMs,
  type AdsState,
  type InterstitialContext,
} from '@/lib/ads/rules';
import { itemIdForRoute } from '@/lib/ads/items';
import { parseAdsState } from '@/lib/ads/storage';
import { hoursLeftLabel, hoursPhrase } from '@/lib/i18n';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Local-time date helper so tests don't depend on the machine's timezone. */
const at = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min);

describe('premium → no ads', () => {
  it('never allows ads for premium users, even with the SDK present', () => {
    expect(canShowAds({ isPremium: true, sdkAvailable: true })).toBe(false);
    expect(canShowAds({ isPremium: true, sdkAvailable: false })).toBe(false);
  });

  it('allows ads for free users only when the SDK is available', () => {
    expect(canShowAds({ isPremium: false, sdkAvailable: true })).toBe(true);
    expect(canShowAds({ isPremium: false, sdkAvailable: false })).toBe(false);
  });
});

describe('rewarded unlock expiry', () => {
  const t0 = at(2026, 10, 9, 21, 30);

  it('unlocks only the rewarded item, for exactly the configured hours', () => {
    const s = grantUnlock(initialAdsState(t0), 'sound:rain-tent', t0, 24);
    expect(isUnlockActive(s, 'sound:rain-tent', t0)).toBe(true);
    expect(isUnlockActive(s, 'sound:waves-real', t0)).toBe(false);
    expect(isUnlockActive(s, 'sound:rain-tent', new Date(t0.getTime() + 24 * HOUR - 1))).toBe(true);
    expect(isUnlockActive(s, 'sound:rain-tent', new Date(t0.getTime() + 24 * HOUR))).toBe(false);
  });

  it('reports remaining time and clamps to zero after expiry', () => {
    const s = grantUnlock(initialAdsState(t0), 'tool:breathe', t0, 24);
    expect(unlockRemainingMs(s, 'tool:breathe', new Date(t0.getTime() + 6 * HOUR))).toBe(18 * HOUR);
    expect(unlockRemainingMs(s, 'tool:breathe', new Date(t0.getTime() + 30 * HOUR))).toBe(0);
    expect(unlockRemainingMs(s, 'tool:never', t0)).toBe(0);
  });

  it('survives a restart (serialise → parse) and still expires correctly', () => {
    const s = grantUnlock(initialAdsState(t0), 'tool:mixer', t0, 24);
    const restored = parseAdsState(JSON.stringify(s), new Date(t0.getTime() + HOUR));
    expect(isUnlockActive(restored, 'tool:mixer', new Date(t0.getTime() + 2 * HOUR))).toBe(true);
    expect(isUnlockActive(restored, 'tool:mixer', new Date(t0.getTime() + 25 * HOUR))).toBe(false);
  });

  it('prunes expired unlocks but keeps live ones', () => {
    let s = grantUnlock(initialAdsState(t0), 'a', t0, 1);
    s = grantUnlock(s, 'b', t0, 24);
    const later = new Date(t0.getTime() + 2 * HOUR);
    const pruned = pruneExpiredUnlocks(s, later);
    expect(Object.keys(pruned.unlocks)).toEqual(['b']);
    // Nothing to prune → same object (no needless writes).
    expect(pruneExpiredUnlocks(pruned, later)).toBe(pruned);
  });

  it('falls back to a clean state for corrupt storage', () => {
    const s = parseAdsState('{not json', t0);
    expect(s.unlocks).toEqual({});
    expect(s.rewardedCount).toBe(0);
    const bad = parseAdsState(JSON.stringify({ unlocks: { x: 'soon' }, rewardedCount: 'many' }), t0);
    expect(bad.unlocks).toEqual({});
    expect(bad.rewardedCount).toBe(0);
  });
});

describe('rewarded daily cap', () => {
  it('counts unlocks per local day and stops at the cap (default 3)', () => {
    const cap = DEFAULT_AD_POLICY.rewardedDailyCap;
    expect(cap).toBe(3);
    const day = at(2026, 10, 9, 10);
    let s: AdsState = initialAdsState(day);
    for (let i = 0; i < cap; i++) {
      expect(rewardedCapReached(s, day, cap)).toBe(false);
      s = grantUnlock(s, `item-${i}`, day, 24);
    }
    expect(rewardedUsedToday(s, day)).toBe(3);
    expect(rewardedCapReached(s, day, cap)).toBe(true);
  });

  it('resets at local midnight', () => {
    const late = at(2026, 10, 9, 23, 59);
    let s = initialAdsState(late);
    s = grantUnlock(s, 'a', late, 24);
    s = grantUnlock(s, 'b', late, 24);
    s = grantUnlock(s, 'c', late, 24);
    expect(rewardedCapReached(s, late, 3)).toBe(true);
    const nextDay = at(2026, 10, 10, 0, 1);
    expect(rewardedUsedToday(s, nextDay)).toBe(0);
    expect(rewardedCapReached(s, nextDay, 3)).toBe(false);
    expect(grantUnlock(s, 'd', nextDay, 24).rewardedCount).toBe(1);
  });

  it('a cap of 0 disables rewarded unlocks entirely', () => {
    const d = at(2026, 10, 9);
    expect(rewardedCapReached(initialAdsState(d), d, 0)).toBe(true);
  });
});

describe('interstitial gating', () => {
  const enabled: AdPolicy = { ...DEFAULT_AD_POLICY, enableInterstitials: true };
  const install = at(2026, 9, 1, 12);
  const veteran: AdsState = { ...initialAdsState(install), sessionsCompleted: 10 };
  const ctx: InterstitialContext = {
    trigger: 'home_after_session',
    naturalBreak: true,
    audioPlaying: false,
    sleepTimerActive: false,
  };
  const afternoon = at(2026, 10, 9, 15);
  const reason = (over: Partial<Parameters<typeof interstitialBlockReason>[0]> = {}) =>
    interstitialBlockReason({ policy: enabled, state: veteran, isPremium: false, context: ctx, now: afternoon, ...over });

  it('is OFF by default (ENABLE_INTERSTITIALS = false)', () => {
    expect(DEFAULT_AD_POLICY.enableInterstitials).toBe(false);
    expect(reason({ policy: DEFAULT_AD_POLICY })).toBe('disabled');
  });

  it('passes when every rule is satisfied', () => {
    expect(reason()).toBeNull();
  });

  it('premium bypass: never for premium users', () => {
    expect(reason({ isPremium: true })).toBe('premium');
  });

  it('only at a natural break, never with audio or a sleep timer running', () => {
    expect(reason({ context: { ...ctx, naturalBreak: false } })).toBe('not_natural_break');
    expect(reason({ context: { ...ctx, audioPlaying: true } })).toBe('audio_playing');
    expect(reason({ context: { ...ctx, sleepTimerActive: true } })).toBe('timer_active');
  });

  it('respects the 20:00–07:00 quiet window (wrapping midnight)', () => {
    expect(reason({ now: at(2026, 10, 9, 19, 59) })).toBeNull();
    expect(reason({ now: at(2026, 10, 9, 20, 0) })).toBe('quiet_hours');
    expect(reason({ now: at(2026, 10, 9, 23, 30) })).toBe('quiet_hours');
    expect(reason({ now: at(2026, 10, 10, 3, 0) })).toBe('quiet_hours');
    expect(reason({ now: at(2026, 10, 10, 6, 59) })).toBe('quiet_hours');
    expect(reason({ now: at(2026, 10, 10, 7, 0) })).toBeNull();
  });

  it('quiet window is configurable, including non-wrapping windows', () => {
    expect(isQuietHour(13, 12, 14)).toBe(true);
    expect(isQuietHour(14, 12, 14)).toBe(false);
    expect(isQuietHour(5, 22, 6)).toBe(true);
    expect(isQuietHour(12, 9, 9)).toBe(false);
  });

  it('waits for the first 3 days and first 5 sessions', () => {
    const fresh = { ...veteran, installedAt: afternoon.getTime() - 2 * DAY };
    expect(reason({ state: fresh })).toBe('too_new');
    expect(reason({ state: { ...veteran, installedAt: afternoon.getTime() - 3 * DAY } })).toBeNull();
    expect(reason({ state: { ...veteran, sessionsCompleted: 4 } })).toBe('too_few_sessions');
    expect(reason({ state: { ...veteran, sessionsCompleted: 5 } })).toBeNull();
  });

  it('frequency cap: at most one every 4 hours', () => {
    const recent = { ...veteran, lastInterstitialAt: afternoon.getTime() - 3 * HOUR - 59 * 60_000 };
    expect(reason({ state: recent })).toBe('frequency_cap');
    const old = { ...veteran, lastInterstitialAt: afternoon.getTime() - 4 * HOUR };
    expect(reason({ state: old })).toBeNull();
  });
});

describe('remote policy parsing', () => {
  it('uses defaults for a missing row or missing columns', () => {
    expect(parseAdPolicy(null)).toEqual(DEFAULT_AD_POLICY);
    expect(parseAdPolicy({ lifetime_mode: 'free' })).toEqual(DEFAULT_AD_POLICY);
  });

  it('reads overrides and clamps hostile values', () => {
    const p = parseAdPolicy({
      ads_enable_interstitials: true,
      ads_rewarded_daily_cap: 5,
      ads_quiet_start_hour: 99,
      ads_interstitial_interval_hours: 0,
      ads_min_sessions: 'nope',
    });
    expect(p.enableInterstitials).toBe(true);
    expect(p.rewardedDailyCap).toBe(5);
    expect(p.quietStartHour).toBe(23);
    expect(p.interstitialIntervalHours).toBe(1);
    expect(p.minSessions).toBe(DEFAULT_AD_POLICY.minSessions);
  });
});

describe('item ids and labels', () => {
  it('derives stable per-item ids from gated routes', () => {
    expect(itemIdForRoute('/player/rain-tent')).toBe('sound:rain-tent');
    expect(itemIdForRoute('/breathe')).toBe('tool:breathe');
    expect(itemIdForRoute('/mixer?x=1')).toBe('tool:mixer');
  });

  it('formats the time-left badge in both languages', () => {
    expect(hoursLeftLabel(17.2 * HOUR, 'en')).toBe('18h left');
    expect(hoursLeftLabel(17.2 * HOUR, 'ar')).toBe('متاح لمدة ١٨ ساعة');
    expect(hoursLeftLabel(5 * HOUR, 'ar')).toBe('متاح لمدة ٥ ساعات');
    expect(hoursLeftLabel(30 * 60_000, 'en')).toBe('<1h left');
    expect(hoursPhrase(24, 'en')).toBe('24 hours');
    expect(hoursPhrase(24, 'ar')).toBe('٢٤ ساعة');
  });
});
