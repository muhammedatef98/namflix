/**
 * Namflix — Apple App Store screenshots generator.
 * Uses the native iOS captures (status bar + Dynamic Island kept) inside a
 * clean iPhone frame, on the brand gradient with a Tajawal headline.
 * Output 1290x2796 (accepted for 6.5" / 6.7" / 6.9" iPhone slots). EN + AR.
 */
const sharp = require('sharp');
const fs = require('fs');

const RAW = '/Users/mohamed/Desktop/namflix/namflix-app/store/screens-raw';
const OUTBASE = '/Users/mohamed/Desktop/namflix/namflix-app/store/ios/screenshots/iphone';
const W = 1290, H = 2796;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function stars(n) {
  let s = '', seed = 11;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * W), y = Math.round(rnd() * H * 0.68);
    const r = (rnd() * 1.8 + 0.5).toFixed(1), o = (rnd() * 0.32 + 0.08).toFixed(2);
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#F2C9A6" opacity="${o}"/>`;
  }
  return s;
}

function bgSvg(headline, sub, rtl) {
  const dir = rtl ? ' direction="rtl"' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="#241109"/><stop offset="0.5" stop-color="#140a05"/><stop offset="1" stop-color="#070301"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="60%" r="55%">
        <stop offset="0" stop-color="#C24E1A" stop-opacity="0.30"/><stop offset="1" stop-color="#C24E1A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${stars(110)}
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <text x="${W / 2}" y="300" text-anchor="middle"${dir} font-family="Tajawal" font-weight="700" font-size="98" fill="#F5E9DC" letter-spacing="0.4">${esc(headline)}</text>
    <text x="${W / 2}" y="400" text-anchor="middle"${dir} font-family="Tajawal" font-weight="500" font-size="48" fill="#E0A06A" opacity="0.95">${esc(sub)}</text>
  </svg>`;
}

const roundMask = (w, h, r) => Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);

async function makeSlide({ raw, headline, sub, rtl, out }) {
  const meta = await sharp(raw).metadata();
  const devW = 1004;
  const devH = Math.round(devW * (meta.height / meta.width));
  const screenR = 92; // iPhone-like corner rounding on the capture

  const screen = await sharp(raw)
    .resize(devW, devH)
    .composite([{ input: roundMask(devW, devH, screenR), blend: 'dest-in' }])
    .png().toBuffer();

  // clean iPhone frame: thin near-black bezel, no camera cutout (Dynamic Island is in the capture)
  const bez = 16;
  const fw = devW + bez * 2, fh = devH + bez * 2, fr = screenR + bez;
  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${fh}">
       <rect width="${fw}" height="${fh}" rx="${fr}" ry="${fr}" fill="#0a0a0c"/>
       <rect x="1.5" y="1.5" width="${fw - 3}" height="${fh - 3}" rx="${fr - 1}" ry="${fr - 1}"
             fill="none" stroke="#2a2a2e" stroke-width="1.5"/>
     </svg>`);

  const fx = Math.round((W - fw) / 2), fyTop = 560;
  await sharp(Buffer.from(bgSvg(headline, sub, rtl)))
    .composite([
      { input: frame, left: fx, top: fyTop },
      { input: screen, left: fx + bez, top: fyTop + bez },
    ])
    .png().toFile(out);
}

const DECKS = {
  en: [
    { raw: 'en-01-home.png',    headline: 'Your journey to sleep',      sub: 'Built to calm you, not grab you', rtl: false },
    { raw: 'en-02-methods.png', headline: 'Beat insomnia with evidence', sub: 'Clinically-proven sleep methods', rtl: false },
    { raw: 'en-03-sounds.png',  headline: 'Sounds that melt insomnia',   sub: 'Rain, waves, endless calm', rtl: false },
    { raw: 'en-04-mixer.png',   headline: 'Mix your perfect night',      sub: 'Up to 3 sounds, your levels', rtl: false },
  ],
  ar: [
    { raw: '01-home.png',    headline: 'رحلتك إلى النوم',     sub: 'مصمَّمة لتهدّيك، لا لتشدّك', rtl: true },
    { raw: '02-methods.png', headline: 'علاج الأرق بالأدلّة',  sub: 'أساليب نوم مثبتة علميًا', rtl: true },
    { raw: '03-sounds.png',  headline: 'أصوات تُذيب الأرق',    sub: 'مطر وأمواج وسكون بلا نهاية', rtl: true },
    { raw: '04-mixer.png',   headline: 'امزج ليلتك المثالية', sub: 'حتى ٣ أصوات، بمستواك الخاص', rtl: true },
  ],
};

(async () => {
  for (const [locale, slides] of Object.entries(DECKS)) {
    const dir = `${OUTBASE}/${locale}`;
    fs.mkdirSync(dir, { recursive: true });
    let i = 1;
    for (const s of slides) {
      await makeSlide({ ...s, raw: `${RAW}/${s.raw}`, out: `${dir}/${String(i).padStart(2, '0')}.png` });
      console.log('wrote', locale, String(i).padStart(2, '0'));
      i++;
    }
  }
  console.log('done →', OUTBASE);
})();
