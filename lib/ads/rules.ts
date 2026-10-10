/**
 * Pure ad rules — no React, no SDK, no storage. Everything that decides
 * "may an ad happen / is this item open" lives here so it can be unit-tested
 * with plain values and a fixed clock.
 */
import type { AdPolicy } from './policy';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Everything the ads layer persists on-device. */
export type AdsState = {
  /** itemId → expiry timestamp (ms) of a rewarded unlock. */
  unlocks: Record<string, number>;
  /** Device-local day (YYYY-MM-DD) that `rewardedCount` belongs to. */
  rewardedDay: string;
  rewardedCount: number;
  /** First time the ads layer saw this install. */
  installedAt: number;
  sessionsCompleted: number;
  lastInterstitialAt: number | null;
};

export function initialAdsState(now: Date): AdsState {
  return {
    unlocks: {},
    rewardedDay: localDayKey(now),
    rewardedCount: 0,
    installedAt: now.getTime(),
    sessionsCompleted: 0,
    lastInterstitialAt: null,
  };
}

/** YYYY-MM-DD in device-local time — the daily cap resets at local midnight. */
export function localDayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ── Premium = no ads ────────────────────────────────────────────────────────

export type AdsEligibility = {
  isPremium: boolean;
  /** The native SDK is in this binary and an ad unit id is configured. */
  sdkAvailable: boolean;
};

/**
 * The single gate in front of every ad request and every "watch ad" button.
 * Premium short-circuits first, so a premium user never reaches the SDK.
 */
export function canShowAds({ isPremium, sdkAvailable }: AdsEligibility): boolean {
  if (isPremium) return false;
  return sdkAvailable;
}

// ── Temporary (rewarded) unlocks ────────────────────────────────────────────

export function isUnlockActive(state: AdsState, itemId: string, now: Date): boolean {
  const expiresAt = state.unlocks[itemId];
  return expiresAt != null && expiresAt > now.getTime();
}

/** Milliseconds left on an item's unlock; 0 when locked or expired. */
export function unlockRemainingMs(state: AdsState, itemId: string, now: Date): number {
  const expiresAt = state.unlocks[itemId];
  return expiresAt == null ? 0 : Math.max(0, expiresAt - now.getTime());
}

/** Drop expired unlocks so storage doesn't grow forever. */
export function pruneExpiredUnlocks(state: AdsState, now: Date): AdsState {
  const t = now.getTime();
  const live = Object.entries(state.unlocks).filter(([, exp]) => exp > t);
  if (live.length === Object.keys(state.unlocks).length) return state;
  return { ...state, unlocks: Object.fromEntries(live) };
}

/** Rewarded unlocks used today (0 once the local day has rolled over). */
export function rewardedUsedToday(state: AdsState, now: Date): number {
  return state.rewardedDay === localDayKey(now) ? state.rewardedCount : 0;
}

export function rewardedCapReached(state: AdsState, now: Date, cap: number): boolean {
  return rewardedUsedToday(state, now) >= cap;
}

/** Record an earned reward: open `itemId` for `hours` and count it toward today's cap. */
export function grantUnlock(state: AdsState, itemId: string, now: Date, hours: number): AdsState {
  const pruned = pruneExpiredUnlocks(state, now);
  return {
    ...pruned,
    unlocks: { ...pruned.unlocks, [itemId]: now.getTime() + hours * HOUR_MS },
    rewardedDay: localDayKey(now),
    rewardedCount: rewardedUsedToday(state, now) + 1,
  };
}

// ── Interstitials ───────────────────────────────────────────────────────────

/** Where an interstitial is being considered. Only natural breaks qualify. */
export type InterstitialTrigger = 'home_after_session';

export type InterstitialContext = {
  trigger: InterstitialTrigger;
  /** A session ended and the user is now back on Home (set by the caller). */
  naturalBreak: boolean;
  audioPlaying: boolean;
  sleepTimerActive: boolean;
};

export type InterstitialBlock =
  | 'disabled'
  | 'premium'
  | 'not_natural_break'
  | 'audio_playing'
  | 'timer_active'
  | 'quiet_hours'
  | 'too_new'
  | 'too_few_sessions'
  | 'frequency_cap';

/** True when `hour` falls inside a quiet window that may wrap midnight. */
export function isQuietHour(hour: number, start: number, end: number): boolean {
  if (start === end) return false; // empty window
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

/**
 * Why an interstitial may NOT show right now, or null when every rule passes.
 * Checked in order of "cheapest / most important" first; premium is checked
 * before anything that could lead to an SDK call.
 */
export function interstitialBlockReason(input: {
  policy: AdPolicy;
  state: AdsState;
  isPremium: boolean;
  context: InterstitialContext;
  now: Date;
}): InterstitialBlock | null {
  const { policy, state, isPremium, context, now } = input;
  if (!policy.enableInterstitials) return 'disabled';
  if (isPremium) return 'premium';
  if (!context.naturalBreak) return 'not_natural_break';
  if (context.audioPlaying) return 'audio_playing';
  if (context.sleepTimerActive) return 'timer_active';
  if (isQuietHour(now.getHours(), policy.quietStartHour, policy.quietEndHour)) return 'quiet_hours';
  if (now.getTime() - state.installedAt < policy.minDaysSinceInstall * DAY_MS) return 'too_new';
  if (state.sessionsCompleted < policy.minSessions) return 'too_few_sessions';
  if (
    state.lastInterstitialAt != null &&
    now.getTime() - state.lastInterstitialAt < policy.interstitialIntervalHours * HOUR_MS
  ) {
    return 'frequency_cap';
  }
  return null;
}
