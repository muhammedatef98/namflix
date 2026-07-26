/**
 * Admin-controlled remote config, edited from the Supabase dashboard
 * (public.app_config, a single row). The app reads it once at launch to decide
 * how the Lifetime offer behaves and which display prices the paywall shows.
 *
 * There are no client write policies on the table, so only the dashboard
 * (service role) can change these values — that's the admin control. Flipping
 * `lifetime_mode` from 'free' to 'paid' or 'off' takes effect on the next
 * launch, no app build or OTA update required.
 *
 *   free  → Lifetime is granted for free (launch offer)
 *   paid  → Lifetime routes to App Store purchase (needs the IAP build)
 *   off   → the Lifetime card is hidden entirely
 *
 * Every fetch falls back to DEFAULT_CONFIG, so a network failure or DEMO_MODE
 * always leaves the free Lifetime offer working.
 */
import { supabase } from './supabase';
import { DEMO_MODE } from './config';

export type LifetimeMode = 'free' | 'paid' | 'off';

export type AppConfig = {
  lifetimeMode: LifetimeMode;
  monthlyPrice: string;
  yearlyPrice: string;
};

export const DEFAULT_CONFIG: AppConfig = {
  lifetimeMode: 'free',
  monthlyPrice: '$4.99',
  yearlyPrice: '$39.99',
};

function normaliseMode(value: unknown): LifetimeMode {
  return value === 'paid' || value === 'off' ? value : 'free';
}

export async function fetchAppConfig(): Promise<AppConfig> {
  if (DEMO_MODE) return DEFAULT_CONFIG;
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('lifetime_mode, monthly_price, yearly_price')
      .eq('id', 1)
      .single();

    if (error || !data) return DEFAULT_CONFIG;

    return {
      lifetimeMode: normaliseMode(data.lifetime_mode),
      monthlyPrice: data.monthly_price ?? DEFAULT_CONFIG.monthlyPrice,
      yearlyPrice: data.yearly_price ?? DEFAULT_CONFIG.yearlyPrice,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
