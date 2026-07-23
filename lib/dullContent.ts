/**
 * "Boring on Purpose" — the evidence-based wind-down activities.
 *
 * The cognitive model of insomnia (Espie, Harvey) says people stay awake
 * because their mind stays *engaged*. Each activity works the opposite way:
 * it gives attention something so low-stakes and monotonous that arousal has
 * nowhere to feed. Bilingual (Modern Standard Arabic); each item states its
 * evidence basis honestly — mechanism named, strength never oversold.
 *
 * Real online audio/video lives in `mediaLibrary.ts`.
 */

import type { Lang, Localized } from '@/lib/i18n';

export type DullRoute = '/shuffle' | '/count' | '/imagery' | '/paradox' | '/breathe' | '/worry';

export interface DullActivity {
  id: string;
  route: DullRoute;
  title: Localized;
  subtitle: Localized;
  science: Localized;
  basis: Localized;
}

const L = (en: string, ar: string): Localized => ({ en, ar });

export const DULL_ACTIVITIES: DullActivity[] = [
  {
    id: 'act-shuffle',
    route: '/shuffle',
    title: L('The Cognitive Shuffle', 'الخلط الذهني'),
    subtitle: L(
      'picture a stream of random, unconnected things',
      'تخيّل تيّارًا من أشياء عشوائية غير مترابطة',
    ),
    science: L(
      'You picture a slow parade of random, unrelated objects and let each one go. Because the images never connect into a story, your mind cannot build the coherent, alert thinking that keeps you awake — it drifts toward the scattered imagery of natural sleep onset.',
      'تتخيّل موكبًا بطيئًا من أشياء عشوائية غير مترابطة، وتدَع كلًّا منها يمضي. ولأن الصور لا تنتظم في قصة، لا يستطيع ذهنك أن يبني التفكير المتماسك اليقظ الذي يُبقيك مستيقظًا — بل ينجرف نحو الصور المبعثرة لبدء النوم الطبيعي.',
    ),
    basis: L(
      'Serial diversification / the "cognitive shuffle," developed by cognitive scientist Luc Beaudoin. Early experimental support is promising; low-risk to try.',
      'التنويع المتسلسل / «الخلط الذهني»، طوّره العالِم المعرفي لوك بودوان. الدعم التجريبي المبكر واعد، وتجربته منخفضة المخاطر.',
    ),
  },
  {
    id: 'act-imagery',
    route: '/imagery',
    title: L('Imagery Distraction', 'التشتيت بالتخيّل'),
    subtitle: L(
      'wander through one calm, unremarkable place',
      'تجوَّل في مكان واحد هادئ عاديّ',
    ),
    science: L(
      'You slowly explore a single pleasant, low-stakes scene in gentle detail. Occupying the mind with engaging-but-neutral imagery crowds out the worries and planning that keep you awake — and it works better than plain distraction or counting.',
      'تستكشف ببطء مشهدًا واحدًا لطيفًا بلا رهانات بتفاصيله الهادئة. فشغلُ الذهن بصور جاذبة لكنها محايدة يُزاحم القلقَ والتخطيط اللذين يُبقيانك مستيقظًا — وهو أنجع من التشتيت المجرّد أو العدّ.',
    ),
    basis: L(
      'Imagery distraction, tested in a controlled study by Harvey & Payne (2002): an absorbing, pleasant scene beat plain distraction. One of the better-evidenced techniques here.',
      'التشتيت بالتخيّل، اختُبر في دراسة محكَّمة (هارفي وباين، ٢٠٠٢): تفوّق المشهدُ الجاذبُ اللطيفُ على التشتيت المجرّد. وهو من أقوى الأساليب هنا دليلًا.',
    ),
  },
  {
    id: 'act-paradox',
    route: '/paradox',
    title: L('Try to Stay Awake', 'حاوِل أن تبقى مستيقظًا'),
    subtitle: L(
      'the paradox that lowers the pressure to perform',
      'المفارقة التي تُزيل ضغط النجاح في النوم',
    ),
    science: L(
      'Lying there gently trying to stay awake removes the effort and anxiety of trying to fall asleep. When you stop chasing sleep, the performance pressure that keeps you alert fades — and sleep tends to arrive on its own.',
      'أن تستلقي محاولًا بلطف أن تبقى مستيقظًا يُزيل جهدَ وقلقَ محاولة النوم. وحين تكفّ عن السعي خلف النوم، يتلاشى ضغطُ النجاح الذي يُبقيك متنبّهًا — فيأتي النوم من تلقاء نفسه.',
    ),
    basis: L(
      'Paradoxical intention, a recognised CBT-I technique with randomised-trial support for reducing sleep-effort and bedtime anxiety.',
      'النية المتناقضة، أسلوب معترف به في العلاج المعرفي السلوكي للأرق، وله دعم من تجارب عشوائية في تقليل جهد النوم وقلق ما قبل النوم.',
    ),
  },
  {
    id: 'act-count',
    route: '/count',
    title: L('The Descending Count', 'العدّ التنازلي'),
    subtitle: L('one slow, monotone number at a time', 'رقمٌ بطيء رتيب واحد في كل مرة'),
    science: L(
      'A slow count starves the mind of the stimulating, narrative thoughts that drive arousal. It is deliberately dull — that is the point. When it bores you, it is working.',
      'العدّ البطيء يُجوّع العقل من الأفكار المثيرة التي تُذكي الاستثارة. وهو مملّ عن قصد — وهذا هو المراد. وحين يُملّك، فهو يعمل.',
    ),
    basis: L(
      'Monotony technique. Honest caveat: in one Oxford study (Harvey & Payne, 2002) counting underperformed vivid imagery — treat it as a simple backup.',
      'أسلوب رتابة. وبأمانة: في دراسة من أكسفورد (هارفي وباين، ٢٠٠٢) كان العدّ أقل فاعلية من التخيّل الحيّ — فاعتبره خيارًا احتياطيًّا بسيطًا.',
    ),
  },
  {
    id: 'act-breathe',
    route: '/breathe',
    title: L('4 · 7 · 8 Breathing', 'تنفّس ٤ · ٧ · ٨'),
    subtitle: L('trace the constellation, slow the body', 'تتبَّع البُرج، وأبطئ جسدك'),
    science: L(
      'A long, slow exhale nudges the parasympathetic ("rest and digest") nervous system, lowering heart rate and the physical arousal that resists sleep.',
      'الزفيرُ الطويل البطيء يُنبّه الجهاز العصبي نظير الوَدّي («الراحة والهضم»)، فيخفض معدّل ضربات القلب والاستثارة الجسدية التي تقاوم النوم.',
    ),
    basis: L(
      'Slow-paced breathing (4-7-8, popularised by Dr. Andrew Weil). Slow breathing has solid evidence for calming physiological arousal.',
      'التنفّس البطيء (٤-٧-٨، الذي نشره د. أندرو وايل). وللتنفّس البطيء أدلة قوية في تهدئة الاستثارة الفسيولوجية.',
    ),
  },
  {
    id: 'act-worry',
    route: '/worry',
    title: L('Constructive Worry', 'القلق البنّاء'),
    subtitle: L('burn the thought before it circles', 'أحرِق الفكرة قبل أن تدور'),
    science: L(
      'Naming a worry and a next step earlier in the wind-down "closes the loop," so the thought is less likely to resurface and spiral once the lights are off.',
      'أن تسمّي القلق وتحدّد خطوة تالية مبكرًا في الاسترخاء «يُغلق الحلقة»، فتقلّ احتمالية أن تعود الفكرة وتدور بعد إطفاء الضوء.',
    ),
    basis: L(
      'Constructive / scheduled worry, a standard CBT-I technique with good clinical support for reducing bedtime rumination.',
      'القلق البنّاء / المجدوَل، أسلوب معتمد في العلاج المعرفي السلوكي للأرق، وله دعم سريري جيّد في تقليل الاجترار قبل النوم.',
    ),
  },
];

// ── Cognitive Shuffle word banks ────────────────────────────────────────────
// Concrete, emotionally-neutral, unrelated nouns. Neutral is the whole point:
// nothing strong to hold onto, no thread to follow back to alert thinking.

const SHUFFLE_WORDS_EN: string[] = [
  'kettle', 'ladder', 'pebble', 'envelope', 'mitten', 'lantern', 'walnut', 'saddle',
  'thimble', 'anchor', 'pillow', 'compass', 'acorn', 'teacup', 'blanket', 'raincoat',
  'button', 'marble', 'basket', 'candle', 'feather', 'pencil', 'window', 'sandal',
  'umbrella', 'napkin', 'clover', 'domino', 'harbor', 'meadow', 'trolley', 'whistle',
  'cushion', 'ribbon', 'paddle', 'shovel', 'bucket', 'stamp', 'lemon', 'olive',
  'pinecone', 'seashell', 'driftwood', 'wheelbarrow', 'birdhouse', 'gate', 'fence',
  'hammock', 'awning', 'chimney', 'doorknob', 'keyhole', 'coaster', 'ladle', 'apron',
  'clothespin', 'mailbox', 'bench', 'fountain', 'archway', 'cottage', 'barn', 'canoe',
  'buoy', 'pier', 'lighthouse', 'dune', 'cactus', 'telescope', 'globe', 'atlas',
  'quill', 'scroll', 'satchel', 'locket', 'slipper', 'quilt', 'wardrobe', 'mirror',
  'vase', 'planter', 'trowel', 'flowerpot', 'sundial', 'willow', 'reed', 'snail',
  'ladybug', 'dewdrop', 'puddle', 'lily pad',
];

const SHUFFLE_WORDS_AR: string[] = [
  'إبريق', 'سُلَّم', 'حصاة', 'ظرف', 'قُفّاز', 'فانوس', 'جوزة', 'سَرْج', 'كشتبان', 'مرساة',
  'وسادة', 'بوصلة', 'بلّوطة', 'فنجان', 'بطّانية', 'معطف', 'زِرّ', 'كُرة زجاجية', 'سلّة', 'شمعة',
  'ريشة', 'قلم', 'نافذة', 'صندل', 'مِظلّة', 'منديل', 'نَفَل', 'أحجار الدومينو', 'ميناء', 'مَرْج',
  'عربة', 'صفّارة', 'مِخدّة', 'شريط', 'مجداف', 'مِجرفة', 'دَلو', 'طابَع', 'ليمونة', 'زيتونة',
  'كوز صنوبر', 'صَدَفة', 'خشبة طافية', 'عربة يد', 'عُشّ طيور', 'بوّابة', 'سياج', 'أرجوحة', 'مِظلّة سقف', 'مدخنة',
  'مقبض باب', 'ثقب مفتاح', 'قاعدة كوب', 'مِغرفة', 'مِئزر', 'مِشبك غسيل', 'صندوق بريد', 'مقعد', 'نافورة', 'قوس',
  'كوخ', 'حظيرة', 'زورق', 'عوّامة', 'رصيف', 'منارة', 'كثيب', 'صبّار', 'مِنظار', 'كرة أرضية',
  'قلم ريشة', 'لَفيفة', 'حقيبة كتف', 'قِلادة', 'خُفّ', 'لِحاف', 'خِزانة', 'مرآة',
  'مِزهرية', 'أصيص', 'مِسطرين', 'أصيص زهور', 'مِزولة', 'صفصافة', 'قصبة', 'حلزون',
  'خُنفساء', 'قطرة ندى', 'بِركة', 'ورقة لوتس',
];

export function shuffleWords(lang: Lang): string[] {
  return lang === 'ar' ? SHUFFLE_WORDS_AR : SHUFFLE_WORDS_EN;
}

/** Pick a random word for the shuffle, never repeating the previous one. */
export function nextShuffleWord(lang: Lang, previous: string | null): string {
  const bank = shuffleWords(lang);
  const pool = previous ? bank.filter((w) => w !== previous) : bank;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Imagery Distraction scene ───────────────────────────────────────────────
// One calm, unremarkable place — a quiet shore at dusk — explored slowly.

const IMAGERY_SCENE_EN: string[] = [
  'You are walking down to a quiet shore at dusk.',
  'The sand is cool and firm beneath your feet.',
  'The tide is far out. The water lies flat and grey.',
  'A soft, warm wind moves past your face, and is gone.',
  'Far off, a single gull calls, then falls silent.',
  'You sit on a smooth, worn piece of driftwood.',
  'The light is low and orange, sinking slowly.',
  'Small waves fold over, one after another, unhurried.',
  'You trace a line in the sand with one finger.',
  'The line fills, softens, and disappears.',
  'The air smells faintly of salt and cold stone.',
  'A boat sits still on the horizon, going nowhere.',
  'You watch the light dim, shade by shade.',
  'Nothing here needs you. Nothing here changes.',
  'The dark gathers gently at the edges of the water.',
  'You let your eyes rest on the last of the light.',
];

const IMAGERY_SCENE_AR: string[] = [
  'تنزل إلى شاطئ هادئ عند الغسق.',
  'الرمل بارد وصلب تحت قدميك.',
  'الجَزْر بعيد. والماء ساكن رماديّ.',
  'نسمة دافئة خفيفة تمرّ على وجهك، ثم تمضي.',
  'من بعيد، ينادي نورس واحد، ثم يصمت.',
  'تجلس على خشبة ملساء عتيقة.',
  'الضوء خافت برتقاليّ، يغيب على مهل.',
  'أمواج صغيرة تنكسر، واحدة تلو الأخرى، بلا عجلة.',
  'ترسم خطًّا في الرمل بإصبع واحد.',
  'يمتلئ الخطّ، يلين، ثم يختفي.',
  'في الهواء رائحة خفيفة من مِلح وحَجَر بارد.',
  'قارب واقف ساكن في الأفق، لا يقصد مكانًا.',
  'تراقب الضوء يخفت، دَرجةً دَرجة.',
  'لا شيء هنا يحتاجك. ولا شيء هنا يتغيّر.',
  'يتجمّع الظلام برفق على حواف الماء.',
  'تُريح عينيك على آخر ما تبقّى من الضوء.',
];

export function imageryScene(lang: Lang): string[] {
  return lang === 'ar' ? IMAGERY_SCENE_AR : IMAGERY_SCENE_EN;
}
