/**
 * Lockable items. Premium gating in Namflix is per screen (every gated entry
 * point calls `useFeatureGate().open(route)`), so a rewarded unlock opens
 * exactly the screen the user tapped: one sound (`/player/rain-tent`), the
 * mixer, or one tool / method (`/breathe`). The item id is derived from the
 * route so unlocks stay stable across app versions.
 */

/** Stable item id for a gated route, e.g. '/player/rain-tent' → 'sound:rain-tent'. */
export function itemIdForRoute(route: string): string {
  const path = route.split('?')[0].replace(/\/+$/, '');
  const player = /^\/player\/([^/]+)$/.exec(path);
  if (player) return `sound:${decodeURIComponent(player[1])}`;
  return `tool:${path.replace(/^\/+/, '')}`;
}
