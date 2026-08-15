// Builds the 1024×1024 App Store promotional image for the Namflix subscriptions.
//
// Apple rejected the previous one twice under Guideline 2.3.2: it was a raw
// screenshot of the paywall, and it showed prices ($4.99/mo, $39.99/yr). Prices
// vary per storefront and Apple renders them itself, so this artwork carries
// NO price, NO plan name and NO UI chrome — just the mark and what the tier is.
//
//   node store/ios/iap-review/make-promo.js
const sharp = require('sharp');
const path = require('path');

const SIZE = 1024;

// Same warm night palette the app uses (constants/theme.ts).
const VOID = '#0A0503';
const EMBER = '#2A0D06';
const DEEP = '#4A1A0A';
const AMBER = '#E08A4A';
const CREAM = '#F2C9A6';

// A few stars, hand-placed so they read as a sky rather than noise.
const STARS = [
  [140, 180, 2.4], [260, 120, 1.6], [380, 220, 2.0], [820, 160, 2.6],
  [900, 300, 1.8], [700, 110, 1.5], [180, 380, 1.7], [880, 520, 2.1],
  [120, 640, 1.9], [960, 700, 1.6], [300, 830, 1.8], [620, 880, 1.5],
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="sky" cx="50%" cy="38%" r="78%">
      <stop offset="0%"   stop-color="${DEEP}"/>
      <stop offset="52%"  stop-color="${EMBER}"/>
      <stop offset="100%" stop-color="${VOID}"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${AMBER}" stop-opacity="0.30"/>
      <stop offset="70%"  stop-color="${AMBER}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${SIZE}" height="${SIZE}" fill="url(#sky)"/>
  <circle cx="512" cy="430" r="330" fill="url(#halo)"/>
  ${STARS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CREAM}" opacity="0.5"/>`).join('\n  ')}

  <!-- Crescent: a full disc with an offset disc punched out of it. -->
  <path d="M 660 430 A 175 175 0 1 1 470 262 A 138 138 0 0 0 660 430 Z" fill="${AMBER}"/>
  <circle cx="627" cy="300" r="16" fill="${CREAM}" opacity="0.9"/>

  <text x="512" y="742" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="104" fill="${CREAM}">Namflix</text>
  <text x="512" y="812" text-anchor="middle"
        font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif"
        font-size="38" letter-spacing="9" fill="${AMBER}">PREMIUM</text>
  <text x="512" y="884" text-anchor="middle"
        font-family="-apple-system, 'Helvetica Neue', Arial, sans-serif"
        font-size="33" fill="${CREAM}" opacity="0.72">Every sound, tool and program</text>
</svg>`;

const out = path.join(__dirname, 'promo-1024.png');
sharp(Buffer.from(svg))
  .png()
  .toFile(out)
  .then((info) => console.log(`wrote ${out} — ${info.width}x${info.height}, ${info.size} bytes`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
