/**
 * The permanently free tier.
 *
 * A sleep app that shows a padlock on every single thing earns one-star reviews
 * and no word of mouth. These entries stay open to everyone, forever, with no
 * account and no trial: enough to actually get someone through a bad night, so
 * the paywall is an upgrade rather than a toll gate.
 *
 * Everything not listed here is premium. This module is the single source of
 * truth — `useFeatureGate()` reads it, so every surface (home, tools, methods,
 * the boring hub, sound cards) locks and unlocks consistently.
 */

/** Full-screen experiences that never lock. */
const FREE_ROUTES: readonly string[] = [
  '/breathe', // 4·7·8 breathing — the thing people come for first
  '/shuffle', // cognitive shuffle — the signature technique
  '/rescue', // 3 a.m. Night Rescue — the moment we most want to be there for
  '/boring', // the hub itself; its individual activities follow this policy
];

/** Sounds that never lock — one from each family so the library reads as real. */
const FREE_TRACK_IDS: readonly string[] = [
  'rain-soft',
  'waves-real',
  'fire-camp',
  'brown-deep',
  'crickets-night',
  'fan-turn',
];

const PLAYER_PREFIX = '/player/';

/** Is this sound playable without premium? */
export function isFreeTrack(trackId: string): boolean {
  return FREE_TRACK_IDS.includes(trackId);
}

/** Is this route open to everyone? Accepts player routes too. */
export function isFreeRoute(route: string): boolean {
  const path = route.split('?')[0];
  if (path.startsWith(PLAYER_PREFIX)) return isFreeTrack(path.slice(PLAYER_PREFIX.length));
  return FREE_ROUTES.includes(path);
}
