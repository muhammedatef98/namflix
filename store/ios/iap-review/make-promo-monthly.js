// Builds the 1024×1024 App Store promotional image for the MONTHLY subscription.
//
// Apple rejected 1.0 (14) under Guideline 2.3.2 because Monthly and Lifetime
// carried the *same* image file (promo-1024.png). Each promoted product needs a
// unique image that represents that product. This one is deliberately different
// from make-promo.js in composition, palette weight and wording:
//
//   make-promo.js         centred crescent, halo, "PREMIUM"      → Lifetime
//   make-promo-monthly.js low horizon, arc of nights, "MONTHLY"  → Monthly
//
// As before: NO price (Apple renders those per storefront), no UI screenshot.
//
//   node store/ios/iap-review/make-promo-monthly.js
const sharp = require('sharp');
const path = require('path');

const SIZE = 1024;

// constants/theme.ts — the same warm night palette, weighted differently here.
const VOID = '#0A0503';
const EMBER = '#2A0D06';
const DEEP = '#4A1A0A';
const AMBER = '#E08A4A';
const CREAM = '#F2C9A6';

// Thirty dots on an arc: one month of nights, the current one lit.
const NIGHTS = 30;
const ARC_CX = 512;
const ARC_CY = 560;
const ARC_R = 300;
const ARC_FROM = Math.PI * 1.18;
const ARC_TO = Math.PI * 1.82;

const nights = Array.from({ length: NIGHTS }, (_, i) => {
  const t = i / (NIGHTS - 1);
  const a = ARC_FROM + (ARC_TO - ARC_FROM) * t;
  const x = (ARC_CX + Math.cos(a) * ARC_R).toFixed(1);
  const y = (ARC_CY + Math.sin(a) * ARC_R).toFixed(1);
  const lit = i === NIGHTS - 8;
  return lit
    ? `<circle cx="${x}" cy="${y}" r="11" fill="${AMBER}"/>`
    : `<circle cx="${x}" cy="${y}" r="5" fill="${CREAM}" opacity="0.30"/>`;
}).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${VOID}"/>
      <stop offset="58%"  stop-color="${EMBER}"/>
      <stop offset="100%" stop-color="${DEEP}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%"   stop-color="${AMBER}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${SIZE}" height="${SIZE}" fill="url(#sky)"/>
  <rect y="620" width="${SIZE}" height="404" fill="url(#glow)"/>

  ${nights}

  <text x="512" y="330" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="${CREAM}">Namflix</text>
  <text x="512" y="396" text-anchor="middle"
        font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif"
        font-size="34" letter-spacing="10" fill="${AMBER}">MONTHLY</text>
  <text x="512" y="700" text-anchor="middle"
        font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif"
        font-size="33" fill="${CREAM}" opacity="0.72">A month of better nights, renewed</text>
</svg>`;

const out = path.join(__dirname, 'promo-monthly-1024.png');
sharp(Buffer.from(svg))
  .png()
  .toFile(out)
  .then((info) => console.log(`wrote ${out} — ${info.width}x${info.height}, ${info.size} bytes`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
