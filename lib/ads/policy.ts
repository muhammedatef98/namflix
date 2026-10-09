/**
 * Ad policy — every knob that decides when an ad may appear. Defaults live
 * here; the Supabase `app_config` row can override any of them (see
 * supabase/app_config_ads.sql) so they can be tuned without a release.
 *
 * Hard rule baked into the design, not a knob: there are NO app-open ads and
 * NO interstitials on launch. People open Namflix in bed, in the dark.
 */

/**
 * Master switch for interstitials. OFF by default: rewarded ads (opt-in, on a
 * lock) are the only format unless this is turned on — here or remotely via
 * `ads_enable_interstitials`.
 */
export const ENABLE_INTERSTITIALS = false;

export type AdPolicy = {
  /** Kill switch for the "watch an ad to unlock" option. */
  rewardedEnabled: boolean;
  /** Rewarded unlocks allowed per device-local calendar day. */
  rewardedDailyCap: number;
  /** How long one rewarded unlock keeps an item open. */
  unlockHours: number;

  enableInterstitials: boolean;
  /** Quiet window (device-local hours) — no interstitials from start until end. */
  quietStartHour: number;
  quietEndHour: number;
  /** No interstitials during the user's first N days … */
  minDaysSinceInstall: number;
  /** … or before N completed sessions. */
  minSessions: number;
  /** At most one interstitial per this many hours. */
  interstitialIntervalHours: number;
};

export const DEFAULT_AD_POLICY: AdPolicy = {
  rewardedEnabled: true,
  rewardedDailyCap: 3,
  unlockHours: 24,
  enableInterstitials: ENABLE_INTERSTITIALS,
  quietStartHour: 20,
  quietEndHour: 7,
  minDaysSinceInstall: 3,
  minSessions: 5,
  interstitialIntervalHours: 4,
};

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function int(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'string' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Read ad policy overrides from a remote config row. Unknown, missing or
 * out-of-range values fall back to the defaults, so a half-configured row can
 * never produce a hostile policy.
 */
export function parseAdPolicy(row: Record<string, unknown> | null | undefined): AdPolicy {
  const r = row ?? {};
  const d = DEFAULT_AD_POLICY;
  return {
    rewardedEnabled: bool(r.ads_rewarded_enabled, d.rewardedEnabled),
    rewardedDailyCap: int(r.ads_rewarded_daily_cap, d.rewardedDailyCap, 0, 20),
    unlockHours: int(r.ads_unlock_hours, d.unlockHours, 1, 72),
    enableInterstitials: bool(r.ads_enable_interstitials, d.enableInterstitials),
    quietStartHour: int(r.ads_quiet_start_hour, d.quietStartHour, 0, 23),
    quietEndHour: int(r.ads_quiet_end_hour, d.quietEndHour, 0, 23),
    minDaysSinceInstall: int(r.ads_min_days_since_install, d.minDaysSinceInstall, 0, 365),
    minSessions: int(r.ads_min_sessions, d.minSessions, 0, 1000),
    interstitialIntervalHours: int(r.ads_interstitial_interval_hours, d.interstitialIntervalHours, 1, 168),
  };
}
