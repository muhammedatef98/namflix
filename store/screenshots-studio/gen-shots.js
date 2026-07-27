/**
 * Namflix — Google Play phone screenshots generator.
 * Brand-styled "ad" screenshots: warm dark gradient + Tajawal Arabic headline
 * + the real app screen inside a rounded device card. Output 1080x1920 (9:16).
 */
const sharp = require('sharp');
const path = require('path');

const RAW = '/Users/mohamed/Desktop/namflix/namflix-app/store/screens-raw';
const OUT = '/Users/mohamed/Desktop/namflix/namflix-app/store/android/screenshots/phone';
const W = 1080, H = 1920;

// escape XML for text
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// deterministic-ish scattered stars
function stars(n) {
  let s = '';
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * W);
    const y = Math.round(rnd() * H * 0.72);
    const r = rnd() * 1.6 + 0.4;
    const o = rnd() * 0.35 + 0.08;
    s += `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="#F2C9A6" opacity="${o.toFixed(2)}"/>`;
  }
  return s;
}

function bgSvg(headline, sub) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="#241109"/>
        <stop offset="0.5" stop-color="#140a05"/>
        <stop offset="1" stop-color="#070301"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="60%" r="55%">
        <stop offset="0" stop-color="#C24E1A" stop-opacity="0.30"/>
        <stop offset="1" stop-color="#C24E1A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${stars(90)}
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <text x="${W / 2}" y="235" text-anchor="middle" direction="rtl"
      font-family="Tajawal" font-weight="700" font-size="82" fill="#F5E9DC"
      letter-spacing="0.5">${esc(headline)}</text>
    <text x="${W / 2}" y="320" text-anchor="middle" direction="rtl"
      font-family="Tajawal" font-weight="500" font-size="40" fill="#E0A06A"
      opacity="0.95">${esc(sub)}</text>
  </svg>`;
}

// rounded-corner mask for the device screen
function roundedMask(w, h, r) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  );
}

async function makeSlide({ raw, headline, sub, out }) {
  const bg = Buffer.from(bgSvg(headline, sub));

  // device screen: fixed display width, bleeds off the bottom
  const devW = 792;
  const meta = await sharp(raw).metadata();
  const devH = Math.round(devW * (meta.height / meta.width));
  const radius = 56;

  const screen = await sharp(raw)
    .resize(devW, devH)
    .composite([{ input: roundedMask(devW, devH, radius), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // bezel: slightly larger dark rounded rect behind the screen
  const bezelPad = 12;
  const bezW = devW + bezelPad * 2, bezH = devH + bezelPad * 2;
  const bezel = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bezW}" height="${bezH}">
       <rect x="0" y="0" width="${bezW}" height="${bezH}" rx="${radius + bezelPad}" ry="${radius + bezelPad}"
         fill="#050302" stroke="#3a2416" stroke-width="2"/>
     </svg>`
  );

  const devX = Math.round((W - devW) / 2);
  const devTop = 430; // below the headline block

  await sharp(bg)
    .composite([
      { input: bezel, left: devX - bezelPad, top: devTop - bezelPad },
      { input: screen, left: devX, top: devTop },
    ])
    .png()
    .toFile(out);
  console.log('wrote', path.basename(out));
}

const SLIDES = [
  { raw: `${RAW}/01-home.png`,    headline: 'رحلتك إلى النوم',      sub: 'مصمَّمة لتهدّيك، لا لتشدّك' },
  { raw: `${RAW}/02-methods.png`, headline: 'علاج الأرق بالأدلّة',   sub: 'أساليب نوم مثبتة علميًا' },
  { raw: `${RAW}/03-sounds.png`,  headline: 'أصوات تُذيب الأرق',     sub: 'مطر وأمواج وسكون بلا نهاية' },
  { raw: `${RAW}/04-mixer.png`,   headline: 'امزج ليلتك المثالية',  sub: 'حتى ٣ أصوات، بمستواك الخاص' },
];

(async () => {
  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });
  let i = 1;
  for (const s of SLIDES) {
    await makeSlide({ ...s, out: `${OUT}/${String(i).padStart(2, '0')}.png` });
    i++;
  }
  console.log('done →', OUT);
})();
