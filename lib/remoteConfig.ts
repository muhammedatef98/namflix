/**
 * Admin-controlled remote config, edited from the Supabase dashboard
 * (public.app_config, a single row). The app reads it once at launch to decide
 * how the Lifetime offer behaves. Prices are NEVER carried here — the
 * paywall reads every price from StoreKit/Play, so it can never show an amount
 * the store would not actually charge.
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
 * Every fetch falls back to DEFAULT_CONFIG. That fallback is deliberately the
 * stingy one: an unreachable config must never hand out a free Lifetime. The
 * giveaway is opt-in from the dashboard, never the consequence of a failure.
 */
import { supabase } from './supabase';
import { DEMO_MODE } from './config';

export type LifetimeMode = 'free' | 'paid' | 'off';

export type AppConfig = {
  lifetimeMode: LifetimeMode;
  /**
   * Deadline for the free Lifetime launch offer (ISO instant). While `now` is
   * before it, Lifetime is claimable free with a countdown; once it passes the
   * card flips to paid. `null` means no deadline — the offer stays free (also
   * the safe fallback on network failure / DEMO_MODE). Extend it from the
   * Supabase dashboard (app_config.free_until) — no build needed.
   */
  freeUntil: string | null;
};

export const DEFAULT_CONFIG: AppConfig = {
  lifetimeMode: 'off',
  freeUntil: null,
};

// Only an explicit 'free' from the dashboard opens the giveaway. Anything else —
// a typo, a null column, a renamed value — lands on 'off'.
function normaliseMode(value: unknown): LifetimeMode {
  return value === 'free' || value === 'paid' ? value : 'off';
}

function normaliseInstant(value: unknown): string | null {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null;
}

export async function fetchAppConfig(): Promise<AppConfig> {
  if (DEMO_MODE) return DEFAULT_CONFIG;
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('lifetime_mode, free_until')
      .eq('id', 1)
      .single();

    if (error || !data) return DEFAULT_CONFIG;

    return {
      lifetimeMode: normaliseMode(data.lifetime_mode),
      freeUntil: normaliseInstant(data.free_until),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
