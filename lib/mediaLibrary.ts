/**
 * The sound library — fully owned or verifiably licensed, hosted on the
 * project's own Supabase Storage (public `sounds` bucket), so availability and
 * rights are entirely under our control. Two kinds of tracks:
 *
 *  1. Originals: ambient beds synthesized in-house with ffmpeg (shaped noise +
 *     phase-aligned modulation) — 100% ours, no third-party rights at all.
 *  2. Field recordings with explicit free licenses, verified on Wikimedia
 *     Commons before inclusion:
 *       - thunder-real: "Thunderstorm after hot summer day" parts 2+3 — Public Domain
 *       - city-rain:    "Urban Street on a Rainy Afternoon" (Extemporalist) — CC0
 *       - cicada-dusk:  "Cicada 20200619" (Shyamal) — CC0
 *
 * Every file is loudness-normalized (−22 LUFS) and loop-processed (tail
 * crossfaded into head, or modulation period aligned to file length) so
 * `player.loop = true` is seamless — which is why durations read "∞".
 */

import type { Lang, Localized } from '@/lib/i18n';

export type MediaCategory = 'rain' | 'water' | 'noise' | 'cozy';
export type SoundArt =
  | 'rain'
  | 'waves'
  | 'fire'
  | 'wind'
  | 'night'
  | 'fan'
  | 'thunder'
  | 'waterfall'
  | 'snow'
  | 'train'
  | 'forest'
  | 'cat'
  | 'birds';

export const CATEGORY_LABEL: Record<MediaCategory, Localized> = {
  rain: { en: 'Rain & thunder', ar: 'المطر والرعد' },
  water: { en: 'Water & waves', ar: 'الماء والأمواج' },
  noise: { en: 'Steady noise', ar: 'ضوضاء ثابتة' },
  cozy: { en: 'Night & nature', ar: 'ليلٌ وطبيعة' },
};

export interface SoundTrack {
  id: string;
  category: MediaCategory;
  art: SoundArt;
  title: Localized;
  subtitle: Localized;
  /** Short, honest "why it helps" line. */
  note: Localized;
  /** Direct, streamable MP3 on our own Supabase Storage. */
  audioUrl: string;
  duration: Localized;
  langs: Lang[];
}

const BOTH: Lang[] = ['en', 'ar'];
const CDN = 'https://eqwkyyrahwvhjflweado.supabase.co/storage/v1/object/public/sounds/';
const LOOP: Localized = { en: '∞ loop', ar: 'تكرار ∞' };

export const SOUND_TRACKS: SoundTrack[] = [
  // ── Rain & water ───────────────────────────────────────────────────────────
  {
    id: 'rain-soft',
    category: 'rain',
    art: 'rain',
    title: { en: 'Soft Rain', ar: 'مطر ناعم' },
    subtitle: { en: 'light, even, endless', ar: 'خفيف متساوٍ بلا نهاية' },
    note: {
      en: 'Rain-shaped broadband sound masks sudden noises that would jolt you awake, smoothing the path into sleep.',
      ar: 'طيف صوتي على هيئة المطر يُخفي الأصوات المفاجئة التي قد توقظك، فيُيسّر الدخول في النوم.',
    },
    audioUrl: `${CDN}rain-soft.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'rain-full',
    category: 'rain',
    art: 'rain',
    title: { en: 'Full Rain', ar: 'مطر غزير' },
    subtitle: { en: 'a fuller, deeper downpour', ar: 'وابل أعمق وأوفر' },
    note: {
      en: 'A denser rain texture for nights that need stronger masking.',
      ar: 'نسيج مطري أكثف لليالٍ تحتاج إخفاءً صوتيًّا أقوى.',
    },
    audioUrl: `${CDN}rain-full.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'city-rain',
    category: 'rain',
    art: 'rain',
    title: { en: 'Rain on a City Street', ar: 'مطر على شارع المدينة' },
    subtitle: { en: 'a real rainy afternoon', ar: 'عصر ماطر حقيقي' },
    note: {
      en: 'A real field recording of an urban downpour — distant, alive, and unthreatening.',
      ar: 'تسجيل ميداني حقيقي لوابل في المدينة — بعيدٌ ونابض وغير مُهدِّد.',
    },
    audioUrl: `${CDN}city-rain.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'thunder-real',
    category: 'rain',
    art: 'thunder',
    title: { en: 'Summer Thunderstorm', ar: 'عاصفة صيف رعدية' },
    subtitle: { en: 'real storm, low rumbles', ar: 'عاصفة حقيقية ودمدمة منخفضة' },
    note: {
      en: 'A real recorded storm after a hot summer day — low, distant rumbles over steady rain feel cozy and safe.',
      ar: 'عاصفة مسجَّلة حقًّا بعد يوم صيف حارّ — دمدمات منخفضة بعيدة فوق مطر ثابت توحي بالدفء والأمان.',
    },
    audioUrl: `${CDN}thunder-real.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'ocean-swell',
    category: 'water',
    art: 'waves',
    title: { en: 'Ocean Swell', ar: 'مدّ المحيط' },
    subtitle: { en: 'slow sixteen-second waves', ar: 'أمواج بطيئة كل ١٦ ثانية' },
    note: {
      en: 'The slow, rhythmic rise and fall of surf is mildly hypnotic — attention loosens with each wave.',
      ar: 'صعود الموج وهبوطه الإيقاعي البطيء مُنوِّم بلطف — يرتخي الانتباه مع كل موجة.',
    },
    audioUrl: `${CDN}ocean-swell.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'stream-glass',
    category: 'water',
    art: 'waterfall',
    title: { en: 'Glass Stream', ar: 'جدول زجاجي' },
    subtitle: { en: 'bright, fine water wash', ar: 'غسيل مائيّ رقيق مشرق' },
    note: {
      en: 'A light, high wash of moving water — a natural-feeling mask without any sudden changes.',
      ar: 'انسياب مائيّ خفيف رقيق — قناع صوتيّ طبيعيّ الطابع دون أيّ تغيّرات مفاجئة.',
    },
    audioUrl: `${CDN}stream-glass.mp3`,
    duration: LOOP,
    langs: BOTH,
  },

  // ── Steady noise ───────────────────────────────────────────────────────────
  {
    id: 'brown-deep',
    category: 'noise',
    art: 'wind',
    title: { en: 'Deep Brown Noise', ar: 'ضوضاء بنيّة عميقة' },
    subtitle: { en: 'warm, low, gapless', ar: 'دافئة منخفضة بلا فواصل' },
    note: {
      en: 'Low-frequency brown noise gives attention a featureless, predictable wall of sound to settle against.',
      ar: 'الضوضاء البنيّة منخفضة التردّد تمنح الانتباه جدارًا صوتيًّا متجانسًا متوقَّعًا يستقرّ إليه.',
    },
    audioUrl: `${CDN}brown-deep.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'pink-soft',
    category: 'noise',
    art: 'wind',
    title: { en: 'Soft Pink Noise', ar: 'ضوضاء ورديّة ناعمة' },
    subtitle: { en: 'balanced, gentle spectrum', ar: 'طيف متوازن لطيف' },
    note: {
      en: 'Pink noise balances energy across frequencies — some studies link it to steadier sleep, evidence is still early.',
      ar: 'الضوضاء الورديّة توازن الطاقة عبر التردّدات — تربطها بعض الدراسات بنوم أكثر استقرارًا، والأدلة ما تزال مبكّرة.',
    },
    audioUrl: `${CDN}pink-soft.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'white-veil',
    category: 'noise',
    art: 'snow',
    title: { en: 'White Veil', ar: 'ستار أبيض' },
    subtitle: { en: 'classic softened white noise', ar: 'ضوضاء بيضاء كلاسيكية مُليَّنة' },
    note: {
      en: 'The classic sound mask, softened at the top so it shields without hissing.',
      ar: 'القناع الصوتي الكلاسيكي، مُليَّن في تردّداته العليا ليحجب دون صفير.',
    },
    audioUrl: `${CDN}white-veil.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'wind-steppe',
    category: 'noise',
    art: 'wind',
    title: { en: 'Steppe Wind', ar: 'ريح السهوب' },
    subtitle: { en: 'steady wind, slow breaths', ar: 'ريح ثابتة بأنفاس بطيئة' },
    note: {
      en: 'A continuous, enveloping wind bed — natural-feeling noise with a gentle four-second sway.',
      ar: 'مهاد ريحيّ مستمرّ يغمر السمع — ضوضاء طبيعية الطابع بتمايل لطيف كل أربع ثوانٍ.',
    },
    audioUrl: `${CDN}wind-steppe.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'fan-turn',
    category: 'noise',
    art: 'fan',
    title: { en: 'Turning Fan', ar: 'مروحة دوّارة' },
    subtitle: { en: 'steady, familiar hum', ar: 'أزيز ثابت مألوف' },
    note: {
      en: 'A steady fan hum is a classic sound mask — familiar, even, and endlessly predictable.',
      ar: 'أزيز المروحة الثابت قناعٌ صوتيّ كلاسيكيّ — مألوف ومتساوٍ ومتوقَّع بلا نهاية.',
    },
    audioUrl: `${CDN}fan-turn.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'heater-purr',
    category: 'noise',
    art: 'fan',
    title: { en: 'Heater Purr', ar: 'هسهسة المدفأة' },
    subtitle: { en: 'low, warm machine hush', ar: 'همس آلي دافئ منخفض' },
    note: {
      en: 'The soft purr of a running heater — a low, warm hush many sleepers grew up with.',
      ar: 'هسهسة مدفأة تعمل بهدوء — همسٌ دافئ منخفض نشأ عليه كثير من النائمين.',
    },
    audioUrl: `${CDN}heater-purr.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'train-rails',
    category: 'noise',
    art: 'train',
    title: { en: 'Night Rails', ar: 'قضبان الليل' },
    subtitle: { en: 'rocking rumble, no horns', ar: 'دمدمة متمايلة بلا أبواق' },
    note: {
      en: 'A steady, rocking rumble like a night train — motion your body reads as being carried.',
      ar: 'دمدمة ثابتة متمايلة كقطار ليليّ — حركة يقرؤها جسدك كأنه محمول.',
    },
    audioUrl: `${CDN}train-rails.mp3`,
    duration: LOOP,
    langs: BOTH,
  },

  // ── Night & stillness ──────────────────────────────────────────────────────
  {
    id: 'night-hush',
    category: 'cozy',
    art: 'night',
    title: { en: 'Night Hush', ar: 'سكون الليل' },
    subtitle: { en: 'the deepest, darkest bed', ar: 'أعمق مهاد وأكثره عتمة' },
    note: {
      en: 'Only the lowest frequencies remain — a felt-more-than-heard hush, like a quiet room inside a quiet house.',
      ar: 'لم يبقَ إلا أخفض التردّدات — سكونٌ يُحَسّ أكثر مما يُسمَع، كغرفة هادئة داخل بيت هادئ.',
    },
    audioUrl: `${CDN}night-hush.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'cabin-hum',
    category: 'cozy',
    art: 'fan',
    title: { en: 'Cabin Hum', ar: 'همس المقصورة' },
    subtitle: { en: 'like a long night flight', ar: 'كأنك في رحلة ليلية طويلة' },
    note: {
      en: 'The enveloping hum of a travelling cabin — a steady drone many people fall asleep to instantly.',
      ar: 'همهمة مقصورة مسافرة تغمر السمع — طنين ثابت ينام عليه كثيرون فورًا.',
    },
    audioUrl: `${CDN}cabin-hum.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  {
    id: 'cicada-dusk',
    category: 'cozy',
    art: 'forest',
    title: { en: 'Cicadas at Dusk', ar: 'زيز عند الغسق' },
    subtitle: { en: 'a real summer evening', ar: 'مساء صيف حقيقي' },
    note: {
      en: 'A real cicada chorus, recorded in the field — the steady drone of a warm evening outdoors.',
      ar: 'جوقة زيز حقيقية مسجَّلة ميدانيًّا — طنين ثابت لمساءٍ دافئ في العراء.',
    },
    audioUrl: `${CDN}cicada-dusk.mp3`,
    duration: LOOP,
    langs: BOTH,
  },
  // ── Batch 2: real CC0 field recordings (Freesound via Openverse) ──────────
  {
    id: 'rain-meadow', category: 'rain', art: 'rain',
    title: { en: 'Light Rain Outside', ar: 'مطر خفيف في الخارج' },
    subtitle: { en: 'a real, gentle shower', ar: 'زخّة حقيقية هادئة' },
    note: { en: 'A real recording of light rain falling in the open — soft, even, and familiar.', ar: 'تسجيل حقيقي لمطر خفيف يهطل في العراء — ناعم متساوٍ مألوف.' },
    audioUrl: `${CDN}rain-meadow.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'rain-tent', category: 'rain', art: 'rain',
    title: { en: 'Rain on the Tent', ar: 'مطر على الخيمة' },
    subtitle: { en: 'sheltered under canvas', ar: 'في مأمن تحت القماش' },
    note: { en: 'Rain drumming on canvas overhead — the sound of being warm and dry while it pours.', ar: 'مطر يقرع قماش الخيمة فوقك — صوت أن تكون دافئًا جافًّا بينما الدنيا تُمطر.' },
    audioUrl: `${CDN}rain-tent.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'rain-window', category: 'rain', art: 'rain',
    title: { en: 'Rain at the Window', ar: 'مطر خلف النافذة' },
    subtitle: { en: 'heard from a warm room', ar: 'تسمعه من غرفة دافئة' },
    note: { en: 'A downpour heard from inside — muffled, distant, and deeply safe.', ar: 'وابل تسمعه من الداخل — مكتوم بعيد يفيض أمانًا.' },
    audioUrl: `${CDN}rain-window.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'rain-birds', category: 'rain', art: 'forest',
    title: { en: 'Rain & Forest Birds', ar: 'مطر وطيور الغابة' },
    subtitle: { en: 'a living, drizzling wood', ar: 'غابة تُرذّ وتغنّي' },
    note: { en: 'Light rain through leaves with soft birdsong — a forest that has not noticed you.', ar: 'مطر خفيف يتخلّل الأوراق مع غناء طيور خافت — غابة لم تنتبه لوجودك.' },
    audioUrl: `${CDN}rain-birds.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'thunder-distant', category: 'rain', art: 'thunder',
    title: { en: 'Distant Thunder', ar: 'رعد بعيد' },
    subtitle: { en: 'rolling far away, no rain', ar: 'يتدحرج بعيدًا بلا مطر' },
    note: { en: 'Real thunder rolling on a far horizon — low, slow, and never startling.', ar: 'رعد حقيقي يتدحرج في أفق بعيد — منخفض بطيء لا يُجفِل أبدًا.' },
    audioUrl: `${CDN}thunder-distant.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'waves-real', category: 'water', art: 'waves',
    title: { en: 'Gentle Shore', ar: 'شاطئ وديع' },
    subtitle: { en: 'real waves, real sand', ar: 'أمواج حقيقية على رمل حقيقي' },
    note: { en: 'A real shoreline recording — each wave arrives, spreads, and withdraws on its own time.', ar: 'تسجيل حقيقي لشاطئ — كل موجة تصل وتنبسط وتنسحب في وقتها الخاص.' },
    audioUrl: `${CDN}waves-real.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'brook-real', category: 'water', art: 'waterfall',
    title: { en: 'Woodland Brook', ar: 'غدير الغابة' },
    subtitle: { en: 'a small, busy stream', ar: 'جدول صغير دؤوب' },
    note: { en: 'A real brook bubbling over stones — continuous, bright, and endlessly patient.', ar: 'غدير حقيقي يخرّ فوق الحصى — مستمرّ رقراق لا ينفد صبره.' },
    audioUrl: `${CDN}brook-real.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'waterfall-real', category: 'water', art: 'waterfall',
    title: { en: 'Waterfall', ar: 'شلال' },
    subtitle: { en: 'a real, steady cascade', ar: 'مسقط حقيقي ثابت' },
    note: { en: 'A real waterfall — a full, unbroken curtain of moving water.', ar: 'شلال حقيقي — ستارة ماء متحرّكة كاملة لا تنقطع.' },
    audioUrl: `${CDN}waterfall-real.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'fire-camp', category: 'cozy', art: 'fire',
    title: { en: 'Campfire', ar: 'نار المخيّم' },
    subtitle: { en: 'real wood, real crackle', ar: 'حطب حقيقي وطقطقة حقيقية' },
    note: { en: 'A real campfire — the soft, irregular crackle of burning wood asks nothing of you.', ar: 'نار مخيّم حقيقية — طقطقة الحطب الناعمة غير المنتظمة لا تطلب منك شيئًا.' },
    audioUrl: `${CDN}fire-camp.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'fire-crackle', category: 'cozy', art: 'fire',
    title: { en: 'Crackling Hearth', ar: 'موقد يتقطقط' },
    subtitle: { en: 'closer, warmer flames', ar: 'لهبٌ أقرب وأدفأ' },
    note: { en: 'A closer fire with a denser crackle — warmth you can almost feel.', ar: 'نار أقرب بطقطقة أكثف — دفء تكاد تلمسه.' },
    audioUrl: `${CDN}fire-crackle.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'crickets-night', category: 'cozy', art: 'forest',
    title: { en: 'Cricket Night', ar: 'ليل الصراصير' },
    subtitle: { en: 'a real, calm chorus', ar: 'جوقة حقيقية هادئة' },
    note: { en: 'A real night field of crickets — steady, low-stakes, the sound of a safe dark.', ar: 'حقل ليلي حقيقي من الصراصير — ثابت وبلا رهانات، صوت ظلامٍ آمن.' },
    audioUrl: `${CDN}crickets-night.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'crickets-pine', category: 'cozy', art: 'forest',
    title: { en: 'Pine Forest Night', ar: 'ليل غابة الصنوبر' },
    subtitle: { en: 'crickets in mountain pines', ar: 'صراصير بين صنوبر الجبال' },
    note: { en: 'Crickets recorded in a Lebanese pine forest — a night from our part of the world.', ar: 'صراصير سُجّلت في غابة صنوبر لبنانية — ليلٌ من ديارنا.' },
    audioUrl: `${CDN}crickets-pine.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'jungle-night', category: 'cozy', art: 'forest',
    title: { en: 'Jungle Night', ar: 'ليل الأدغال' },
    subtitle: { en: 'insects of a deep forest', ar: 'حشرات غابة عميقة' },
    note: { en: 'A real tropical forest after dark — dense, layered insect song from Sian Ka’an.', ar: 'غابة استوائية حقيقية بعد الغروب — غناء حشرات كثيف متعدّد الطبقات.' },
    audioUrl: `${CDN}jungle-night.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'birds-spring', category: 'cozy', art: 'birds',
    title: { en: 'Spring Dawn', ar: 'فجر الربيع' },
    subtitle: { en: 'Scottish morning birdsong', ar: 'غناء طيور صباح اسكتلندي' },
    note: { en: 'Real spring birdsong — for naps, gentle mornings, and easing awake.', ar: 'غناء طيور ربيعي حقيقي — للقيلولة والصباحات الرقيقة والاستيقاظ الهادئ.' },
    audioUrl: `${CDN}birds-spring.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'cat-purr', category: 'cozy', art: 'cat',
    title: { en: 'Sleeping Cat', ar: 'قطة نائمة' },
    subtitle: { en: 'a real, deep purr', ar: 'خرخرة حقيقية عميقة' },
    note: { en: 'A real cat’s purr — a low, rhythmic vibration many find instantly soothing.', ar: 'خرخرة قطة حقيقية — اهتزاز منخفض منتظم يجده كثيرون مهدّئًا فورًا.' },
    audioUrl: `${CDN}cat-purr.mp3`, duration: LOOP, langs: BOTH,
  },
  // ── Batch 3: more CC0 field recordings ─────────────────────────────────────
  {
    id: 'rain-roof', category: 'rain', art: 'rain',
    title: { en: 'Rain on a Metal Roof', ar: 'مطر على سطح معدني' },
    subtitle: { en: 'ringing, cozy drumming', ar: 'قرعٌ رنّان دافئ' },
    note: { en: 'Rain striking a tin roof — the classic sound of being safely indoors.', ar: 'مطر يقرع سطحًا معدنيًّا — الصوت الكلاسيكي للأمان داخل البيت.' },
    audioUrl: `${CDN}rain-roof.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'fountain', category: 'water', art: 'waterfall',
    title: { en: 'Courtyard Fountain', ar: 'نافورة الفناء' },
    subtitle: { en: 'a garden fountain, real', ar: 'نافورة حديقة حقيقية' },
    note: { en: 'The rounded, even splash of a stone fountain in a quiet courtyard.', ar: 'رشّاش نافورة حجرية متساوٍ في فناء هادئ.' },
    audioUrl: `${CDN}fountain.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'harbor', category: 'water', art: 'waves',
    title: { en: 'Sleepy Harbor', ar: 'مرفأ نائم' },
    subtitle: { en: 'water lapping at the quay', ar: 'ماء يرتطم بالرصيف' },
    note: { en: 'Small waves lapping against a harbor wall — gentle, irregular, endless.', ar: 'موجات صغيرة تلامس جدار المرفأ — لطيفة متقطّعة بلا نهاية.' },
    audioUrl: `${CDN}harbor.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'marina-wind', category: 'noise', art: 'wind',
    title: { en: 'Marina Masts', ar: 'صواري المارينا' },
    subtitle: { en: 'wind in rigging and ropes', ar: 'ريح في الحبال والصواري' },
    note: { en: 'A calm wind rattling sailboat rigging — a soft, metallic lullaby of the docks.', ar: 'ريح هادئة تُقرقع حبال المراكب — تهويدة معدنية ناعمة من الأرصفة.' },
    audioUrl: `${CDN}marina-wind.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'deep-sea', category: 'noise', art: 'waves',
    title: { en: 'Deep Sea', ar: 'أعماق البحر' },
    subtitle: { en: 'a submerged, muffled world', ar: 'عالم مغمور مكتوم' },
    note: { en: 'The pressurized hush of deep water — everything above feels far away.', ar: 'سكون الماء العميق المضغوط — كل ما فوقه يبدو بعيدًا.' },
    audioUrl: `${CDN}deep-sea.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'whales', category: 'cozy', art: 'waves',
    title: { en: 'Whale Song', ar: 'غناء الحيتان' },
    subtitle: { en: 'real whales, deep water', ar: 'حيتان حقيقية في ماء عميق' },
    note: { en: 'Recorded while diving with whales — slow calls across a vast quiet.', ar: 'سُجّل أثناء الغوص مع الحيتان — نداءات بطيئة عبر اتساع هادئ.' },
    audioUrl: `${CDN}whales.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'owls-night', category: 'cozy', art: 'forest',
    title: { en: 'Owls & Crickets', ar: 'بوم وصراصير' },
    subtitle: { en: 'a tawny owl over the field', ar: 'بومة تسهر فوق الحقل' },
    note: { en: 'A night field of crickets with a tawny owl calling now and then.', ar: 'حقل ليلي من الصراصير تقطعه بومة تنادي بين الحين والآخر.' },
    audioUrl: `${CDN}owls-night.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'pond-frogs', category: 'cozy', art: 'forest',
    title: { en: 'Frog Pond', ar: 'بركة الضفادع' },
    subtitle: { en: 'a spring night chorus', ar: 'جوقة ليلة ربيعية' },
    note: { en: 'Frogs and toads singing over a still pond — dense, warm, alive.', ar: 'ضفادع تغنّي فوق بركة ساكنة — كثيفة دافئة نابضة.' },
    audioUrl: `${CDN}pond-frogs.mp3`, duration: LOOP, langs: BOTH,
  },
  {
    id: 'desert-night', category: 'cozy', art: 'night',
    title: { en: 'Desert Night', ar: 'ليل الصحراء' },
    subtitle: { en: 'crickets under open sky', ar: 'صراصير تحت سماء مفتوحة' },
    note: { en: 'A wide, open desert night — sparse crickets in an enormous silence.', ar: 'ليل صحراويّ مفتوح — صراصير متفرقة في صمت هائل.' },
    audioUrl: `${CDN}desert-night.mp3`, duration: LOOP, langs: BOTH,
  },
];

export const MEDIA_ORDER: MediaCategory[] = ['rain', 'water', 'noise', 'cozy'];

export function tracksForLang(lang: Lang): SoundTrack[] {
  return SOUND_TRACKS.filter((t) => t.langs.includes(lang));
}

export function tracksByCategory(lang: Lang, category: MediaCategory): SoundTrack[] {
  return tracksForLang(lang).filter((t) => t.category === category);
}

export function trackById(id: string): SoundTrack | undefined {
  return SOUND_TRACKS.find((t) => t.id === id);
}

/** A random playable track — used by the "play something for me" shortcut. */
export function randomTrack(lang: Lang): SoundTrack {
  const pool = tracksForLang(lang);
  return pool[Math.floor(Math.random() * pool.length)];
}
