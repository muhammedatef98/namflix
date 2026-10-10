/**
 * Minimal, typed analytics wrapper. Namflix had no analytics, so this ships
 * with NO network sink: events are only logged in development. Plug a real
 * provider in one place with `setAnalyticsSink()` (and update the privacy
 * policy / store data-safety forms when you do).
 *
 * These events exist to compare ad revenue against subscription conversion.
 */

export type PurchaseSource = 'lock_screen' | 'paywall' | 'cap_message';

export type AnalyticsEvents = {
  rewarded_offer_shown: { item_id: string };
  rewarded_started: { item_id: string };
  rewarded_completed: { item_id: string };
  rewarded_failed: { item_id: string; reason: string };
  rewarded_daily_cap_hit: { item_id: string; cap: number };
  interstitial_shown: { trigger: string };
  paywall_opened_from_lock: { item_id: string; source: PurchaseSource };
  purchase_completed: { plan: string; source: PurchaseSource };
};

export type AnalyticsEventName = keyof AnalyticsEvents;
export type AnalyticsSink = (event: string, props: Record<string, unknown>) => void;

const devSink: AnalyticsSink = (event, props) => {
  if (__DEV__) console.log(`[analytics] ${event}`, props);
};

let sink: AnalyticsSink = devSink;

export function setAnalyticsSink(next: AnalyticsSink | null): void {
  sink = next ?? devSink;
}

export function track<E extends AnalyticsEventName>(event: E, props: AnalyticsEvents[E]): void {
  try {
    sink(event, props);
  } catch {
    // Analytics must never break the app.
  }
}
