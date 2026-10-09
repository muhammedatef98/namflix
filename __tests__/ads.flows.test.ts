import { runInterstitialFlow, runRewardedFlow, type AdsFlowDeps, type InterstitialDeps } from '@/lib/ads/flows';
import { DEFAULT_AD_POLICY, type AdPolicy } from '@/lib/ads/policy';
import { initialAdsState, isUnlockActive, type AdsState } from '@/lib/ads/rules';
import type { LoadedAd, ShowResult } from '@/lib/ads/sdk';

const NOW = new Date(2026, 9, 9, 15, 0);

function fakeAd(result: ShowResult): LoadedAd {
  return { loadedAt: NOW.getTime(), show: jest.fn(async () => result) };
}

function makeDeps(over: Partial<AdsFlowDeps> = {}, startState?: AdsState) {
  let state = startState ?? initialAdsState(NOW);
  const restore = jest.fn();
  const deps: AdsFlowDeps = {
    isPremium: () => false,
    sdkAvailable: () => true,
    policy: () => DEFAULT_AD_POLICY,
    getState: () => state,
    setState: (s) => {
      state = s;
    },
    prepare: jest.fn(async () => ({ canRequestAds: true, nonPersonalized: false })),
    acquire: jest.fn(async () => fakeAd({ shown: true, earned: true })),
    suspendAudio: jest.fn(() => restore),
    track: jest.fn(),
    now: () => NOW,
    ...over,
  };
  return { deps, restore, state: () => state };
}

describe('runRewardedFlow', () => {
  it('premium users: no consent prompt, no SDK call, no ad', async () => {
    const { deps } = makeDeps({ isPremium: () => true });
    await expect(runRewardedFlow('sound:x', deps)).resolves.toBe('premium');
    expect(deps.prepare).not.toHaveBeenCalled();
    expect(deps.acquire).not.toHaveBeenCalled();
    expect(deps.track).not.toHaveBeenCalled();
  });

  it('earned reward unlocks that item, pauses then restores audio, tracks events', async () => {
    const { deps, restore, state } = makeDeps();
    await expect(runRewardedFlow('sound:x', deps)).resolves.toBe('rewarded');
    expect(isUnlockActive(state(), 'sound:x', NOW)).toBe(true);
    expect(isUnlockActive(state(), 'sound:y', NOW)).toBe(false);
    expect(deps.suspendAudio).toHaveBeenCalledTimes(1);
    expect(restore).toHaveBeenCalledTimes(1);
    const events = (deps.track as jest.Mock).mock.calls.map((c) => c[0]);
    expect(events).toEqual(['rewarded_started', 'rewarded_completed']);
  });

  it('dismissed before the reward: nothing unlocked, audio restored', async () => {
    const { deps, restore, state } = makeDeps({ acquire: jest.fn(async () => fakeAd({ shown: true, earned: false })) });
    await expect(runRewardedFlow('sound:x', deps)).resolves.toBe('dismissed');
    expect(isUnlockActive(state(), 'sound:x', NOW)).toBe(false);
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it('no fill resolves politely (never hangs, never throws)', async () => {
    const { deps } = makeDeps({ acquire: jest.fn(async () => null) });
    await expect(runRewardedFlow('sound:x', deps)).resolves.toBe('no_fill');
    expect(deps.track).toHaveBeenCalledWith('rewarded_failed', { item_id: 'sound:x', reason: 'no_fill' });
  });

  it('SDK errors are caught and audio is still restored', async () => {
    const restore = jest.fn();
    const ad: LoadedAd = { loadedAt: 0, show: jest.fn(async () => Promise.reject(new Error('boom'))) };
    const { deps } = makeDeps({ acquire: jest.fn(async () => ad), suspendAudio: () => restore });
    await expect(runRewardedFlow('sound:x', deps)).resolves.toBe('no_fill');
    expect(restore).toHaveBeenCalledTimes(1);
  });

  it('daily cap: blocks the 4th unlock without touching the SDK', async () => {
    const capped: AdsState = { ...initialAdsState(NOW), rewardedCount: 3 };
    const { deps } = makeDeps({}, capped);
    await expect(runRewardedFlow('sound:x', deps)).resolves.toBe('cap');
    expect(deps.prepare).not.toHaveBeenCalled();
    expect(deps.track).toHaveBeenCalledWith('rewarded_daily_cap_hit', { item_id: 'sound:x', cap: 3 });
  });

  it('becoming premium while the consent form is up stops the ad', async () => {
    let premium = false;
    const { deps } = makeDeps({
      isPremium: () => premium,
      prepare: jest.fn(async () => {
        premium = true;
        return { canRequestAds: true, nonPersonalized: false };
      }),
    });
    await expect(runRewardedFlow('sound:x', deps)).resolves.toBe('premium');
    expect(deps.acquire).not.toHaveBeenCalled();
  });

  it('declined consent still requests (non-personalised) ads', async () => {
    const { deps } = makeDeps({ prepare: jest.fn(async () => ({ canRequestAds: true, nonPersonalized: true })) });
    await runRewardedFlow('sound:x', deps);
    expect(deps.acquire).toHaveBeenCalledWith(true);
  });

  it('rewarded kill switch or missing SDK → unavailable', async () => {
    const off: AdPolicy = { ...DEFAULT_AD_POLICY, rewardedEnabled: false };
    await expect(runRewardedFlow('x', makeDeps({ policy: () => off }).deps)).resolves.toBe('unavailable');
    await expect(runRewardedFlow('x', makeDeps({ sdkAvailable: () => false }).deps)).resolves.toBe('unavailable');
  });
});

describe('runInterstitialFlow', () => {
  const enabled: AdPolicy = { ...DEFAULT_AD_POLICY, enableInterstitials: true };
  const veteran: AdsState = { ...initialAdsState(new Date(2026, 8, 1)), sessionsCompleted: 10 };
  const ctx = {
    trigger: 'home_after_session' as const,
    naturalBreak: true,
    audioPlaying: false,
    sleepTimerActive: false,
  };

  function interstitialDeps(over: Partial<InterstitialDeps> = {}) {
    let state = veteran;
    const deps: InterstitialDeps = {
      isPremium: () => false,
      sdkAvailable: () => true,
      policy: () => enabled,
      getState: () => state,
      setState: (s) => {
        state = s;
      },
      prepare: jest.fn(async () => ({ canRequestAds: true, nonPersonalized: false })),
      takeIfReady: jest.fn(async () => fakeAd({ shown: true, earned: false })),
      suspendAudio: jest.fn(() => () => undefined),
      track: jest.fn(),
      now: () => NOW,
      ...over,
    };
    return { deps, state: () => state };
  }

  it('shows when allowed and records the time for the frequency cap', async () => {
    const { deps, state } = interstitialDeps();
    await expect(runInterstitialFlow(ctx, deps)).resolves.toBe(true);
    expect(state().lastInterstitialAt).toBe(NOW.getTime());
    expect(deps.track).toHaveBeenCalledWith('interstitial_shown', { trigger: 'home_after_session' });
  });

  it('premium bypass: never touches the SDK', async () => {
    const { deps } = interstitialDeps({ isPremium: () => true });
    await expect(runInterstitialFlow(ctx, deps)).resolves.toBe(false);
    expect(deps.takeIfReady).not.toHaveBeenCalled();
  });

  it('off by default', async () => {
    const { deps } = interstitialDeps({ policy: () => DEFAULT_AD_POLICY });
    await expect(runInterstitialFlow(ctx, deps)).resolves.toBe(false);
    expect(deps.takeIfReady).not.toHaveBeenCalled();
  });

  it('skips silently when no ad is already loaded (no spinner, no wait)', async () => {
    const { deps } = interstitialDeps({ takeIfReady: jest.fn(async () => null) });
    await expect(runInterstitialFlow(ctx, deps)).resolves.toBe(false);
  });

  it('never at night', async () => {
    const { deps } = interstitialDeps({ now: () => new Date(2026, 9, 9, 22, 0) });
    await expect(runInterstitialFlow(ctx, deps)).resolves.toBe(false);
    expect(deps.takeIfReady).not.toHaveBeenCalled();
  });
});
