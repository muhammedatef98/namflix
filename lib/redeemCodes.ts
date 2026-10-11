/**
 * Offline lifetime redemption codes.
 *
 * WHY THIS EXISTS: Apple has no mechanism that grants a lifetime unlock from a
 * code. Offer Codes apply only to auto-renewable subscriptions and cap at one
 * year; `namflix.premium.lifetime` is a non-consumable, and Apple retired
 * in-app-purchase promo codes. So a genuine "this code unlocks Namflix forever"
 * has to be validated by the app itself.
 *
 * WHY IT IS OFFLINE: the app has no accounts and no server-side user data — a
 * promise `app/privacy.tsx` and the deployed `support` function both make in
 * writing. Validating a code against a backend would break that promise, so
 * validation happens entirely on device against the digests below.
 *
 * WHAT THIS IS NOT: these digests are obfuscation, not cryptography. FNV-1a is
 * fast and non-reversible in the trivial sense — `strings` over the bundle
 * yields nothing usable — but anyone determined enough to read the bundle and
 * brute-force the space can mint a code. That is an acceptable trade for a
 * giveaway: the downside of a leaked code is one free user, and REDEEM_CODES
 * can be emptied in the next release. Never guard anything that costs real
 * money this way.
 *
 * ROTATING CODES: run the generator in `scripts/hash-code.mjs` over the new
 * plaintext and replace the list. Plaintext codes must never appear in this
 * file — that is the entire point of hashing them.
 */

/** FNV-1a, one pass with a given offset basis. */
function fnv1a(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

/**
 * Two independent FNV passes concatenated into 64 bits of hex. One 32-bit pass
 * would collide often enough to hand out accidental valid codes.
 */
function digest(normalized: string): string {
  const a = fnv1a(normalized, 2166136261).toString(16).padStart(8, '0');
  const b = fnv1a(normalized, 1099511628).toString(16).padStart(8, '0');
  return a + b;
}

/**
 * Fold what the user typed into the canonical form the digests were built from.
 * Case, spaces and dashes are all forgiven, so "namflix life 2026" and
 * "NAMFLIX-LIFE-2026" are the same code — people retype these off a screenshot.
 */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Digests of the live lifetime codes. Plaintext lives outside the repo. */
const REDEEM_CODES: readonly string[] = [
  'e16a251c66ec377f',
  'ee3d2362af9a6ad1',
  '44c81a67efcfc794',
  '45c81bfaf2cfcc4d',
  '46c81d8df1cfcaba',
  '279c6c35939d1066',
  '838a7ad747264620',
  '848a7c6a4a264ad9',
  'f9197409f4e8d38a',
  '0765f461a0d62a4a',
  '2d288d922151f045',
  '52aa0b6e1ceec159',
  '925a08849602ef53',
  'ff572925572e9c0a',
  '7f04341b96c52710',
];

/** Shortest real code, used to reject obvious noise before hashing. */
const MIN_CODE_LENGTH = 6;

/** Does this input match a live lifetime code? */
export function isValidLifetimeCode(raw: string): boolean {
  const normalized = normalizeCode(raw);
  if (normalized.length < MIN_CODE_LENGTH) return false;
  return REDEEM_CODES.includes(digest(normalized));
}
