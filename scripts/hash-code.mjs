/**
 * Turn plaintext lifetime codes into the digests `lib/redeemCodes.ts` ships.
 *
 * Usage:  node scripts/hash-code.mjs NAMFLIX-LIFE-2027 NAMFLIX-PRESS-2027
 *
 * Paste the output into REDEEM_CODES. Keep the plaintext somewhere outside the
 * repo — once it is committed, hashing it bought you nothing.
 */

const fnv1a = (input, seed) => {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
};

const normalize = (raw) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

const digest = (normalized) =>
  fnv1a(normalized, 2166136261).toString(16).padStart(8, '0') +
  fnv1a(normalized, 1099511628).toString(16).padStart(8, '0');

const codes = process.argv.slice(2);
if (codes.length === 0) {
  console.error('Pass one or more codes, e.g. node scripts/hash-code.mjs NAMFLIX-LIFE-2027');
  process.exit(1);
}

const seen = new Map();
for (const code of codes) {
  const normalized = normalize(code);
  if (normalized.length < 6) {
    console.error(`Too short after normalising: ${code}`);
    process.exit(1);
  }
  const hashed = digest(normalized);
  if (seen.has(hashed)) {
    console.error(`Collision between ${seen.get(hashed)} and ${code} — pick a different code.`);
    process.exit(1);
  }
  seen.set(hashed, code);
  console.log(`  '${hashed}',`);
}
