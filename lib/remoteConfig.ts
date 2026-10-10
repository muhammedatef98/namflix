/**
 * Admin-controlled remote config, edited from the Supabase dashboard
 * (public.app_config, a single row). The app reads it once at launch to decide
 * whether the Lifetime purchase is offered and which display prices the paywall shows.
 *
 * There are no client write policies on the table, so only the dashboard
 * (service role) can change these values — that's the admin control. Flipping
 * `lifetime_mode` from 'free' to 'paid' or 'off' takes effect on the next
 * launch, no app build or OTA update required.
 *
 *   paid  → Lifetime is a one-time store purchase (the default)
 *   off   → the Lifetime option is hidden entirely
 *   free  → legacy launch-offer value; no longer grants anything — treated as 'paid'.
 *           Users who claimed the free launch Lifetime keep it (stored on-device,
 *           see PremiumContext).
 *
 * Every fetch falls back to DEFAULT_CONFIG, so a network failure or DEMO_MODE
 * never makes anything free: the fallback is always 'paid'.
 *
 * The same row carries optional `ads_*` columns (supabase/app_config_ads.sql)
 * that tune the ad policy — rewarded cap, interstitial flag, quiet hours, etc.
 * The row is read with `select('*')` so a database without those columns
 * still loads the lifetime/price fields and just uses DEFAULT_AD_POLICY.
 */
import { supabase } from './supabase';
import { DEMO_MODE } from './config';
import { DEFAULT_AD_POLICY, parseAdPolicy, type AdPolicy } from './ads/policy';

export type LifetimeMode = 'paid' | 'off';

export type AppConfig = {
  lifetimeMode: LifetimeMode;
  monthlyPrice: string;
  yearlyPrice: string;
  ads: AdPolicy;
};

export const DEFAULT_CONFIG: AppConfig = {
  lifetimeMode: 'paid',
  monthlyPrice: '$4.99',
  yearlyPrice: '$39.99',
  ads: DEFAULT_AD_POLICY,
};

/** Only an explicit 'off' hides Lifetime; anything else (incl. legacy 'free') is paid. */
export function normaliseMode(value: unknown): LifetimeMode {
  return value === 'off' ? 'off' : 'paid';
}

export async function fetchAppConfig(): Promise<AppConfig> {
  if (DEMO_MODE) return DEFAULT_CONFIG;
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) return DEFAULT_CONFIG;

    return {
      lifetimeMode: normaliseMode(data.lifetime_mode),
      monthlyPrice: data.monthly_price ?? DEFAULT_CONFIG.monthlyPrice,
      yearlyPrice: data.yearly_price ?? DEFAULT_CONFIG.yearlyPrice,
      ads: parseAdPolicy(data as Record<string, unknown>),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
