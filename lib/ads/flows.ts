/**
 * Rewarded / interstitial orchestration as plain functions with injected
 * dependencies (SDK, storage, audio, analytics, clock). AdsContext wires the
 * real ones; tests wire fakes — which is how "premium → zero SDK calls" and
 * the cap / expiry rules are verified without a device.
 */
import type { AnalyticsEventName, AnalyticsEvents } from '@/lib/analytics';
import type { AdPolicy } from './policy';
import {
  canShowAds,
  grantUnlock,
  interstitialBlockReason,
  rewardedCapReached,
  type AdsState,
  type InterstitialContext,
} from './rules';
import type { AdsReadiness, LoadedAd } from './sdk';

export type RewardedOutcome =
  | 'rewarded' // reward earned, item unlocked
  | 'dismissed' // closed before earning the reward
  | 'cap' // daily limit reached
  | 'no_fill' // no ad available / load failed / timed out
  | 'unavailable' // ads off, SDK missing, or consent prevents requests
  | 'premium'; // premium users never see ads

type Track = <E extends AnalyticsEventName>(event: E, props: AnalyticsEvents[E]) => void;

export type AdsFlowDeps = {
  isPremium: () => boolean;
  sdkAvailable: () => boolean;
  policy: () => AdPolicy;
  getState: () => AdsState;
  setState: (next: AdsState) => void;
  prepare: () => Promise<AdsReadiness>;
  /** Hand out a loaded ad (preloaded or fresh); null on no fill / timeout. */
  acquire: (nonPersonalized: boolean) => Promise<LoadedAd | null>;
  /** Pause app audio; returns a function restoring it exactly as it was. */
  suspendAudio: () => () => void;
  track: Track;
  now: () => Date;
};

export async function runRewardedFlow(itemId: string, deps: AdsFlowDeps): Promise<RewardedOutcome> {
  // Premium bypass comes first: no consent prompt, no SDK call, nothing.
  if (deps.isPremium()) return 'premium';
  const policy = deps.policy();
  if (!policy.rewardedEnabled || !canShowAds({ isPremium: false, sdkAvailable: deps.sdkAvailable() })) {
    return 'unavailable';
  }
  if (rewardedCapReached(deps.getState(), deps.now(), policy.rewardedDailyCap)) {
    deps.track('rewarded_daily_cap_hit', { item_id: itemId, cap: policy.rewardedDailyCap });
    return 'cap';
  }

  let restoreAudio: (() => void) | null = null;
  try {
    const ready = await deps.prepare();
    if (!ready.canRequestAds) {
      deps.track('rewarded_failed', { item_id: itemId, reason: 'no_consent' });
      return 'unavailable';
    }
    // The user may have subscribed while the consent form was up.
    if (deps.isPremium()) return 'premium';

    const ad = await deps.acquire(ready.nonPersonalized);
    if (!ad) {
      deps.track('rewarded_failed', { item_id: itemId, reason: 'no_fill' });
      return 'no_fill';
    }
    if (deps.isPremium()) return 'premium';

    deps.track('rewarded_started', { item_id: itemId });
    restoreAudio = deps.suspendAudio();
    const result = await ad.show();
    restoreAudio();
    restoreAudio = null;

    if (!result.shown) {
      deps.track('rewarded_failed', { item_id: itemId, reason: 'show_failed' });
      return 'no_fill';
    }
    if (!result.earned) return 'dismissed';

    const now = deps.now();
    deps.setState(grantUnlock(deps.getState(), itemId, now, policy.unlockHours));
    deps.track('rewarded_completed', { item_id: itemId });
    return 'rewarded';
  } catch {
    restoreAudio?.();
    deps.track('rewarded_failed', { item_id: itemId, reason: 'error' });
    return 'no_fill';
  }
}

export type InterstitialDeps = Omit<AdsFlowDeps, 'acquire'> & {
  /** Return an interstitial ONLY if one is already loaded — never wait. */
  takeIfReady: () => Promise<LoadedAd | null>;
};

/**
 * Show an interstitial only when every rule passes AND one is already loaded,
 * so the user is never left staring at a spinner. Returns whether one showed.
 */
export async function runInterstitialFlow(
  context: InterstitialContext,
  deps: InterstitialDeps,
): Promise<boolean> {
  const block = interstitialBlockReason({
    policy: deps.policy(),
    state: deps.getState(),
    isPremium: deps.isPremium(),
    context,
    now: deps.now(),
  });
  if (block) return false;
  if (!deps.sdkAvailable()) return false;
  try {
    const ad = await deps.takeIfReady();
    if (!ad || deps.isPremium()) return false;
    const restoreAudio = deps.suspendAudio();
    const result = await ad.show();
    restoreAudio();
    if (!result.shown) return false;
    deps.setState({ ...deps.getState(), lastInterstitialAt: deps.now().getTime() });
    deps.track('interstitial_shown', { trigger: context.trigger });
    return true;
  } catch {
    return false;
  }
}
