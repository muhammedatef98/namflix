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
  'c71eda6722b87d50',
  'f822f83bb4b87a6c',
  'b2f423c1aa33dd92',
  '3a9f91493658610e',
  'f7cf875eb6a65859',
  '9a2df86c621be287',
  '9acc4d6855e95d17',
  '77c2cd734c661a64',
  '7aadfdf20fb65155',
  '6accaddd7926f2ee',
  '9dae3fa2a365a475',
  'e05ed16e56135ddd',
  'c4c29a5e325572a9',
  '2dc23e0218345b59',
  'c2b10f2a91f5b1e9',
  'ba4cbfa1c0be37f2',
  'c6c4e1329cf27a8d',
  '081e89d88b41c06b',
  '57bd146e2d5fb3d1',
  'c94bbc7d4424e70a',
  '79073792b47da239',
  '7235232e1e672069',
  '8ade52e49ea7adb7',
  'a845dd8ca07ccb07',
  '08da2d65aaf9b7e6',
  '28a35eb7762cbc1c',
  '6c1c2dc816f4769b',
  '6fd8997cbf66b6df',
  'c18e98926016c8c9',
  '89fbae4ac1ecda11',
  '38298b29516f296a',
  '0ca3983a2cd035d5',
  'cee0d743eb751688',
  'e1f111911d36289a',
  '5ae21847e99a8a00',
  'a3b433915ede5266',
  '9a7a942280ea3fa5',
  '05f4969fe5bb3d80',
  '4daf2b94d9e1f72f',
  'd907b8fa8f0eaefd',
  'fdf552c292a32bad',
  'c33323d40d2ad9a7',
  '6a3f609f4ae36440',
  'bf3b3172a582fc8d',
  '0ded781f6d67f700',
  '1471a386c0a85e35',
  '581b6f5a00e42ee9',
  '31edb389fa135f72',
  '099007956618f7a6',
  'cdbcb22df758ff22',
];

/** Shortest real code, used to reject obvious noise before hashing. */
const MIN_CODE_LENGTH = 6;

/** Does this input match a live lifetime code? */
export function isValidLifetimeCode(raw: string): boolean {
  const normalized = normalizeCode(raw);
  if (normalized.length < MIN_CODE_LENGTH) return false;
  return REDEEM_CODES.includes(digest(normalized));
}
