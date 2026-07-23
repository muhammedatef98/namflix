/**
 * The evidence library — every practical, research-backed method known to help
 * people fall asleep or treat insomnia. Each entry is bilingual (Modern
 * Standard Arabic) and carries a short summary, how-to, and an honest evidence
 * note naming the study / researcher / guideline behind it.
 *
 * Interactive methods link to their in-app tool via `route`; the rest are
 * informational. Nothing here is medical advice — persistent insomnia warrants
 * clinician-guided CBT-I.
 */

import type { Localized } from '@/lib/i18n';

export type MethodCategory = 'cbti' | 'relaxation' | 'cognitive' | 'environment' | 'lifestyle' | 'info';

const L = (en: string, ar: string): Localized => ({ en, ar });

export const CATEGORY_META: Record<MethodCategory, { label: Localized; blurb: Localized }> = {
  cbti: {
    label: L('CBT-I — first-line therapy', 'العلاج المعرفي السلوكي للأرق — الخط الأول'),
    blurb: L(
      'The strongest evidence base for chronic insomnia — recommended before sleeping pills.',
      'أقوى الأدلة لعلاج الأرق المزمن، ويُوصى به قبل الحبوب المنوّمة.',
    ),
  },
  relaxation: {
    label: L('Relaxation & lowering arousal', 'الاسترخاء وخفض الاستثارة'),
    blurb: L(
      'Techniques that calm the body’s stress response so sleep can arrive.',
      'أساليب تهدّئ استجابة التوتّر في الجسد حتى يأتي النوم.',
    ),
  },
  cognitive: {
    label: L('Quieting a busy mind', 'تهدئة العقل المشغول'),
    blurb: L(
      'Ways to occupy or de-fuse the racing, wakeful thinking that blocks sleep.',
      'طرائق لشغل أو تفكيك التفكير المتسارع اليقظ الذي يمنع النوم.',
    ),
  },
  environment: {
    label: L('Body, light & environment', 'الجسد والضوء والبيئة'),
    blurb: L(
      'Temperature, light, sound and touch that shape how easily you fall asleep.',
      'الحرارة والضوء والصوت واللمس التي تحدّد سهولة نومك.',
    ),
  },
  lifestyle: {
    label: L('Daily rhythm & habits', 'الإيقاع اليومي والعادات'),
    blurb: L(
      'What you do across the day sets up the night — timing, caffeine, movement.',
      'ما تفعله خلال النهار يهيّئ الليل — التوقيت والكافيين والحركة.',
    ),
  },
  info: {
    label: L('Good to know', 'معلومات مفيدة'),
    blurb: L('Evidence-informed context — not a prescription.', 'سياق قائم على الأدلة — وليس وصفة علاجية.'),
  },
};

export interface SleepMethod {
  id: string;
  category: MethodCategory;
  name: Localized;
  /** A one-line brief. */
  summary: Localized;
  /** How to actually do it. */
  how: Localized;
  /** The scientific proof: study / researcher / finding. */
  evidence: Localized;
  /** Interactive in-app tool, if any. */
  route?: string;
}

export const SLEEP_METHODS: SleepMethod[] = [
  // ── CBT-I ────────────────────────────────────────────────────────────────
  {
    id: 'stimulus-control',
    category: 'cbti',
    name: L('Stimulus Control', 'التحكّم بالمثيرات'),
    summary: L(
      'Retrain your brain to link the bed with sleep — and nothing else.',
      'أعِد تدريب دماغك على ربط السرير بالنوم فقط لا غير.',
    ),
    how: L(
      'Use the bed only for sleep. Go to bed only when sleepy. If you’re awake after ~20 minutes, get up, do something dull in dim light, and return only when drowsy. Keep one fixed wake time.',
      'استخدم السرير للنوم فقط. لا تذهب إليه إلا عند الشعور بالنعاس. إن بقيت مستيقظًا نحو ٢٠ دقيقة، فانهض وافعل شيئًا مملًّا في ضوء خافت، ولا تعُد إلا مع النعاس. والتزم بموعد استيقاظ ثابت.',
    ),
    evidence: L(
      'Developed by Richard Bootzin (1972). Classed as a "standard" treatment by the American Academy of Sleep Medicine; meta-analyses show large, durable improvements in sleep onset.',
      'طوّره ريتشارد بوتزين (١٩٧٢). تصنّفه الأكاديمية الأمريكية لطب النوم علاجًا «قياسيًا»، وتُظهر التحليلات البَعدية تحسّنًا كبيرًا ودائمًا في بدء النوم.',
    ),
  },
  {
    id: 'sleep-restriction',
    category: 'cbti',
    name: L('Sleep Restriction', 'تقييد النوم'),
    summary: L(
      'Briefly shrink time in bed to rebuild deep, solid sleep.',
      'قلّل وقت البقاء في السرير مؤقتًا لإعادة بناء نوم عميق ومتماسك.',
    ),
    how: L(
      'Limit time in bed to the hours you actually sleep (never below ~5h). The mild sleep debt consolidates sleep and cuts night-time waking; widen the window as efficiency improves. Best done with guidance.',
      'اقصر وقتك في السرير على عدد ساعات نومك الفعلية (دون النزول عن ٥ ساعات تقريبًا). يدفع الحرمان الخفيف إلى تماسك النوم وتقليل الاستيقاظ الليلي، ثم وسّع النافذة كلما تحسّنت الكفاءة. ويُفضَّل تطبيقه بإشراف.',
    ),
    evidence: L(
      'Introduced by Arthur Spielman (1987). A core, well-validated component of CBT-I, shown in randomized trials to improve sleep efficiency.',
      'قدّمه آرثر سبيلمان (١٩٨٧). مكوّن أساسي مُثبَت في العلاج المعرفي السلوكي للأرق، أظهرت التجارب العشوائية أنه يحسّن كفاءة النوم.',
    ),
  },
  {
    id: 'cognitive-restructuring',
    category: 'cbti',
    name: L('Cognitive Restructuring', 'إعادة البناء المعرفي'),
    summary: L(
      'Challenge the anxious beliefs that make sleeplessness worse.',
      'واجِه المعتقدات القلقة التي تزيد الأرق سوءًا.',
    ),
    how: L(
      'Catch catastrophic thoughts ("if I don’t sleep I’ll ruin tomorrow") and replace them with balanced ones ("I’ve coped on little sleep before"). Reducing the fear of not sleeping lowers the arousal that blocks sleep.',
      'التقط الأفكار الكارثية («إن لم أنم سأُفسد يومي غدًا») واستبدلها بأخرى متوازنة («لقد تدبّرت أمري بنوم قليل من قبل»). فتقليل الخوف من عدم النوم يخفّض الاستثارة التي تمنعه.',
    ),
    evidence: L(
      'A pillar of CBT-I (Morin, Harvey). The American College of Physicians (2016) recommends CBT-I as the first-line treatment for chronic insomnia.',
      'ركيزة في العلاج المعرفي السلوكي للأرق (مورين، هارفي). وتوصي الكلية الأمريكية للأطباء (٢٠١٦) به بوصفه العلاج الأول للأرق المزمن.',
    ),
  },
  {
    id: 'constructive-worry',
    category: 'cbti',
    name: L('Constructive Worry', 'القلق البنّاء'),
    summary: L('Empty the worried mind onto paper before bed.', 'أفرِغ العقل القلق على الورق قبل النوم.'),
    how: L(
      'Earlier in the evening, list what’s worrying you and one next step for each, then set it aside. This "closes the loop" so worries are less likely to spiral at lights-out.',
      'في وقت مبكر من المساء، اكتب ما يقلقك وخطوة تالية لكل بند، ثم اتركه جانبًا. هذا «يُغلق الحلقة» فتقلّ احتمالية دوران القلق عند إطفاء الضوء.',
    ),
    evidence: L(
      'A standard CBT-I technique with good clinical support for reducing pre-sleep cognitive arousal and rumination.',
      'أسلوب معتمد في العلاج المعرفي السلوكي للأرق، وله دعم سريري جيّد في تقليل الاستثارة الذهنية والاجترار قبل النوم.',
    ),
    route: '/worry',
  },
  {
    id: 'paradoxical-intention',
    category: 'cbti',
    name: L('Paradoxical Intention', 'النية المتناقضة'),
    summary: L('Gently try to stay awake — and stop fighting for sleep.', 'حاوِل بلطف أن تبقى مستيقظًا، وكُفّ عن مصارعة النوم.'),
    how: L(
      'Lie comfortably and gently try to remain awake, without effort. Removing the pressure to fall asleep dissolves the performance anxiety that keeps you alert.',
      'استلقِ مرتاحًا وحاوِل بلطف أن تبقى مستيقظًا دون بذل جهد. فرفعُ الضغط عن نفسك للنوم يذيب قلق الأداء الذي يُبقيك متنبّهًا.',
    ),
    evidence: L(
      'Studied by Colin Espie and others; recognised in AASM practice parameters as an effective, evidence-based technique for sleep-onset insomnia.',
      'درسه كولين إسبي وآخرون، وتعترف به معايير الأكاديمية الأمريكية لطب النوم أسلوبًا فعّالًا قائمًا على الأدلة لأرق بدء النوم.',
    ),
    route: '/paradox',
  },
  {
    id: 'sleep-hygiene',
    category: 'cbti',
    name: L('Sleep Hygiene', 'نظافة النوم'),
    summary: L('The baseline habits that protect good sleep.', 'العادات الأساسية التي تحمي نومًا جيّدًا.'),
    how: L(
      'Keep a regular schedule; a dark, cool, quiet room; no caffeine late; limited alcohol and heavy meals near bed; wind down before lights-out. Hygiene alone rarely cures insomnia but supports every other method.',
      'حافظ على جدول منتظم، وغرفة مظلمة باردة هادئة، وتجنّب الكافيين متأخرًا، وقلّل الكحول والوجبات الثقيلة قرب النوم، واسترخِ قبل إطفاء الضوء. النظافة وحدها نادرًا ما تشفي الأرق، لكنها تدعم كل أسلوب آخر.',
    ),
    evidence: L(
      'Endorsed across sleep-medicine guidelines as a supportive foundation; most effective when combined with CBT-I components rather than used alone.',
      'معتمدة في إرشادات طب النوم أساسًا داعمًا، وتكون أنجع حين تُدمج مع مكوّنات العلاج المعرفي السلوكي بدل استخدامها منفردة.',
    ),
  },

  // ── Relaxation ─────────────────────────────────────────────────────────────
  {
    id: 'pmr',
    category: 'relaxation',
    name: L('Progressive Muscle Relaxation', 'الاسترخاء العضلي التدريجي'),
    summary: L('Tense and release each muscle group to melt body tension.', 'شُدّ ثم أرخِ كل مجموعة عضلية لإذابة توتّر الجسد.'),
    how: L(
      'From feet to face, tense each muscle group for ~5 seconds, then release and notice the softening. The contrast teaches the body what "let go" feels like.',
      'من القدمين إلى الوجه، شُدّ كل مجموعة عضلية نحو ٥ ثوانٍ ثم أرخِها ولاحِظ الليونة. يعلّم هذا التباينُ الجسدَ معنى «الاسترخاء».',
    ),
    evidence: L(
      'Developed by Edmund Jacobson (1930s). A "standard" relaxation therapy in AASM parameters, with trial evidence for reducing insomnia.',
      'طوّره إدموند جاكوبسون (ثلاثينيات القرن الماضي). علاج استرخاء «قياسي» في معايير الأكاديمية الأمريكية لطب النوم، وله أدلة تجريبية في تقليل الأرق.',
    ),
  },
  {
    id: 'breathing-478',
    category: 'relaxation',
    name: L('4·7·8 & Slow Breathing', 'التنفّس ٤·٧·٨ والتنفّس البطيء'),
    summary: L('A long, slow exhale flips the body into "rest" mode.', 'الزفير الطويل البطيء يحوّل الجسد إلى وضع «الراحة».'),
    how: L(
      'Inhale 4, hold 7, exhale 8 (seconds). Longer exhalations engage the parasympathetic nervous system and slow the heart, easing physical arousal.',
      'شهيق ٤، إمساك ٧، زفير ٨ (ثوانٍ). يُشغّل الزفيرُ الأطولُ الجهازَ العصبيَّ نظيرَ الوَدّي ويبطّئ القلب، فيخفّ التوتّر الجسدي.',
    ),
    evidence: L(
      'Popularised by Dr. Andrew Weil. Slow-paced breathing has solid physiological evidence for boosting parasympathetic (calming) activity.',
      'نشره د. أندرو وايل. وللتنفّس البطيء أدلة فسيولوجية قوية على تعزيز نشاط الجهاز نظير الوَدّي المهدّئ.',
    ),
    route: '/breathe',
  },
  {
    id: 'diaphragmatic',
    category: 'relaxation',
    name: L('Diaphragmatic Breathing', 'التنفّس الحجابي'),
    summary: L('Breathe low into the belly, not high into the chest.', 'تنفّس من أسفل البطن لا من أعلى الصدر.'),
    how: L(
      'One hand on the belly, breathe so that hand rises while the chest stays still. Slow, deep belly breathing signals safety to the nervous system.',
      'ضع يدًا على البطن وتنفّس بحيث ترتفع اليد بينما يبقى الصدر ساكنًا. يرسل التنفّس البطني العميق البطيء إشارة أمان إلى الجهاز العصبي.',
    ),
    evidence: L(
      'A core relaxation method; slow diaphragmatic breathing is shown to increase heart-rate variability and reduce physiological arousal.',
      'أسلوب استرخاء أساسي؛ ثبت أن التنفّس الحجابي البطيء يرفع تغيّر معدّل ضربات القلب ويقلّل الاستثارة الفسيولوجية.',
    ),
  },
  {
    id: 'autogenic',
    category: 'relaxation',
    name: L('Autogenic Training', 'التدريب الذاتي (الأوتوجيني)'),
    summary: L('Talk your limbs into heaviness and warmth.', 'وجِّه أطرافك نحو الثِّقل والدفء بالكلمات.'),
    how: L(
      'Slowly repeat calming phrases — "my arms are heavy and warm, my breathing is calm" — moving through the body. Self-suggested heaviness and warmth trigger a relaxation response.',
      'كرّر ببطء عبارات مهدّئة — «ذراعاي ثقيلتان ودافئتان، تنفّسي هادئ» — متنقّلًا عبر الجسد. يُطلق الإيحاءُ الذاتي بالثِّقل والدفء استجابةَ الاسترخاء.',
    ),
    evidence: L(
      'Developed by Johannes Schultz (1930s). Included among relaxation therapies with supportive evidence for insomnia and anxiety.',
      'طوّره يوهانس شولتز (ثلاثينيات القرن الماضي). ويُدرَج ضمن علاجات الاسترخاء ذات الأدلة الداعمة للأرق والقلق.',
    ),
  },
  {
    id: 'body-scan',
    category: 'relaxation',
    name: L('Body Scan / Yoga Nidra / NSDR', 'مسح الجسد / يوجا نيدرا / الراحة العميقة'),
    summary: L('Move calm attention slowly through the whole body.', 'حرّك انتباهًا هادئًا ببطء عبر الجسد كلّه.'),
    how: L(
      'Rest attention on each part of the body in turn, releasing it as you go. This "non-sleep deep rest" lowers arousal and often carries you into sleep.',
      'ثبّت الانتباه على كل جزء من الجسد بالتناوب، وأرخِه كلما مررت به. تخفّض هذه «الراحة العميقة دون نوم» الاستثارةَ وكثيرًا ما تحملك إلى النوم.',
    ),
    evidence: L(
      'Rooted in mindfulness-based approaches; growing evidence that body-scan / yoga-nidra style practices reduce pre-sleep arousal and improve sleep.',
      'متجذّرة في مقاربات اليقظة الذهنية؛ وتتنامى الأدلة على أن ممارسات مسح الجسد ويوجا نيدرا تخفّض استثارة ما قبل النوم وتحسّنه.',
    ),
  },
  {
    id: 'sensory-grounding',
    category: 'relaxation',
    name: L('Sensory Grounding (5-4-3-2-1)', 'التأريض الحسّي (٥-٤-٣-٢-١)'),
    summary: L('Anchor attention in your senses to step out of racing thought.', 'ثبّت انتباهك في حواسّك لتخرج من دوّامة الأفكار.'),
    how: L(
      'Move through your senses one at a time — a few sounds you can hear, points where your body touches the bed, the feel of your breath. Naming real sensations pulls attention out of anxious loops and into the present, quiet room.',
      'تنقّل بين حواسّك واحدة تلو الأخرى — بضعة أصوات تسمعها، مواضع يلامس فيها جسدك السرير، إحساس نفَسك. تسميةُ الأحاسيس الحقيقية تسحب الانتباه من حلقات القلق إلى الغرفة الهادئة الحاضرة.',
    ),
    evidence: L(
      'A staple grounding technique in anxiety management and CBT practice. Direct insomnia trials are lacking, but it plausibly helps by lowering pre-sleep cognitive arousal — a well-established insomnia driver.',
      'أسلوب تأريض أساسي في إدارة القلق وممارسة العلاج المعرفي السلوكي. تنقص التجارب المباشرة على الأرق، لكنه يُرجَّح أن يساعد بخفض الاستثارة المعرفية قبل النوم — وهي محرّك مُثبَت للأرق.',
    ),
    route: '/grounding',
  },

  // ── Cognitive ──────────────────────────────────────────────────────────────
  {
    id: 'cognitive-shuffle',
    category: 'cognitive',
    name: L('The Cognitive Shuffle', 'الخلط الذهني'),
    summary: L('Picture random, unconnected images to derail alert thinking.', 'تخيّل صورًا عشوائية غير مترابطة لتُعطِّل التفكير اليقظ.'),
    how: L(
      'Imagine a slow stream of unrelated everyday objects, one at a time, without linking them. The scattered imagery mimics the mind at natural sleep onset.',
      'تخيّل تيارًا بطيئًا من أشياء يومية غير مترابطة، واحدًا تلو الآخر، دون ربط بينها. تحاكي هذه الصورُ المبعثرةُ حالةَ الذهن عند بدء النوم الطبيعي.',
    ),
    evidence: L(
      'Devised by cognitive scientist Luc Beaudoin ("serial diversification"). Early experimental work is promising and it is low-risk to try.',
      'ابتكره العالم المعرفي لوك بودوان («التنويع المتسلسل»). والأعمال التجريبية المبكرة واعدة، وتجربته منخفضة المخاطر.',
    ),
    route: '/shuffle',
  },
  {
    id: 'imagery-distraction',
    category: 'cognitive',
    name: L('Imagery Distraction', 'التشتيت بالتخيّل'),
    summary: L('Get absorbed in one calm, neutral scene.', 'انغمس في مشهد واحد هادئ محايد.'),
    how: L(
      'Slowly explore a pleasant, low-stakes place in sensory detail. Absorbing but neutral imagery crowds out worry and planning.',
      'استكشف ببطء مكانًا لطيفًا بلا رهانات، بتفاصيله الحسّية. تُزاحم الصورةُ الجاذبةُ المحايدةُ القلقَ والتخطيط.',
    ),
    evidence: L(
      'In a controlled study by Harvey & Payne (2002), imagery distraction helped people fall asleep faster than general distraction or no instruction.',
      'في دراسة محكَّمة لهارفي وباين (٢٠٠٢)، ساعد التشتيت بالتخيّل الناسَ على النوم أسرع من التشتيت العام أو دون توجيه.',
    ),
    route: '/imagery',
  },
  {
    id: 'cognitive-refocusing',
    category: 'cognitive',
    name: L('Articulatory Suppression', 'الكبت النُّطقي'),
    summary: L('Repeat a neutral word to block verbal worry.', 'كرّر كلمة محايدة لتحجب القلق اللفظي.'),
    how: L(
      'Silently repeat a neutral word (e.g. "the") every couple of seconds. Occupying the mind’s verbal channel leaves no room for anxious inner talk.',
      'كرّر بصمت كلمة محايدة (مثل «الـ») كل ثانيتين. فشغلُ القناة اللفظية للعقل لا يترك مجالًا للحديث الداخلي القلق.',
    ),
    evidence: L(
      'Studied as "cognitive refocusing" by Gellis and colleagues; repeating neutral content disrupts the verbal rumination that delays sleep.',
      'دُرِس بوصفه «إعادة التركيز المعرفي» على يد غيليس وزملائه؛ إذ يعطّل تكرارُ محتوى محايد الاجترارَ اللفظي الذي يؤخّر النوم.',
    ),
  },
  {
    id: 'descending-count',
    category: 'cognitive',
    name: L('The Descending Count', 'العدّ التنازلي'),
    summary: L('A slow, monotone count to starve the racing mind.', 'عدٌّ بطيء رتيب يُجوّع العقل المتسارع.'),
    how: L(
      'Count slowly downward from 200, saying each number in your mind with long gaps. Deliberate monotony leaves little to stay awake for.',
      'عُدّ ببطء تنازليًا من ٢٠٠، قائلًا كل رقم في ذهنك بفواصل طويلة. لا تترك الرتابةُ المقصودةُ ما يستحق البقاء مستيقظًا لأجله.',
    ),
    evidence: L(
      'Monotony technique. Honest caveat: in Harvey & Payne (2002) counting underperformed vivid imagery — a simple fallback rather than a headline cure.',
      'أسلوب رتابة. وبأمانة: في دراسة هارفي وباين (٢٠٠٢) كان العدّ أقل فاعلية من التخيّل الحيّ، فهو خيار احتياطي بسيط لا علاج رئيس.',
    ),
    route: '/count',
  },

  // ── Environment / body ─────────────────────────────────────────────────────
  {
    id: 'warm-bath',
    category: 'environment',
    name: L('Warm Bath Before Bed', 'حمّام دافئ قبل النوم'),
    summary: L('A warm soak 1–2 hours before bed speeds sleep onset.', 'نقعٌ دافئ قبل النوم بساعة إلى ساعتين يعجّل بدء النوم.'),
    how: L(
      'Take a warm bath or shower (~40°C) for about 10 minutes, 1–2 hours before bed. The rebound cooling afterward mimics the body’s natural pre-sleep temperature drop.',
      'خُذ حمّامًا دافئًا (نحو ٤٠ درجة) لعشر دقائق تقريبًا، قبل النوم بساعة إلى ساعتين. فالتبريد الارتدادي بعده يحاكي هبوط حرارة الجسد الطبيعي قبل النوم.',
    ),
    evidence: L(
      'A 2019 meta-analysis (Haghayegh et al., Sleep Medicine Reviews) found water-based passive body heating before bed shortened time to fall asleep and improved sleep quality.',
      'وجد تحليل بَعدي (هاغاييغ وزملاؤه، ٢٠١٩) أن التدفئة السلبية للجسد بالماء قبل النوم قصّرت زمن النوم وحسّنت جودته.',
    ),
  },
  {
    id: 'cool-room',
    category: 'environment',
    name: L('A Cool Bedroom', 'غرفة نوم باردة'),
    summary: L('Around 18°C helps the body power down.', 'نحو ١٨ درجة يساعد الجسد على الخمول للنوم.'),
    how: L(
      'Keep the room cool (roughly 16–19°C). Falling asleep depends on a drop in core body temperature, which a cool room supports.',
      'أبقِ الغرفة باردة (نحو ١٦–١٩ درجة). فبدء النوم يعتمد على انخفاض حرارة الجسد المركزية، وتدعم ذلك الغرفةُ الباردة.',
    ),
    evidence: L(
      'Thermoregulation research (e.g. Kräuchi, Okamoto-Mizuno) links a cooler environment and core-temperature decline to easier sleep onset.',
      'تربط أبحاث تنظيم الحرارة (مثل كراوتشي وأوكاموتو-ميزونو) البيئةَ الأبردَ وانخفاضَ الحرارة المركزية بسهولة بدء النوم.',
    ),
  },
  {
    id: 'dim-light',
    category: 'environment',
    name: L('Dim, Warm Evening Light', 'ضوء مسائي خافت ودافئ'),
    summary: L('Dark evenings let melatonin rise on time.', 'الأمسيات المظلمة تتيح ارتفاع الميلاتونين في وقته.'),
    how: L(
      'In the last 1–2 hours before bed, dim the lights and prefer warm tones; cut bright and blue-rich screen light. Light is the main signal that sets your body clock.',
      'في الساعة أو الساعتين الأخيرتين قبل النوم، خفّف الأضواء وفضّل الألوان الدافئة، وقلّل ضوء الشاشات الساطع الغنيّ بالأزرق. فالضوء هو الإشارة الأساسية التي تضبط ساعتك البيولوجية.',
    ),
    evidence: L(
      'Circadian research shows evening light — especially blue-rich light — suppresses melatonin and delays sleep (Czeisler, Chang et al., 2015).',
      'تُظهر أبحاث الساعة البيولوجية أن ضوء المساء — خاصة الغنيّ بالأزرق — يكبت الميلاتونين ويؤخّر النوم (تشايزلر، تشانغ وزملاؤه، ٢٠١٥).',
    ),
  },
  {
    id: 'morning-light',
    category: 'environment',
    name: L('Morning Bright Light', 'ضوء الصباح الساطع'),
    summary: L('Light early anchors the clock for a timely night.', 'الضوء مبكرًا يثبّت الساعة لليلٍ في موعده.'),
    how: L(
      'Get bright light (ideally sunlight) soon after waking for 10–30 minutes. This advances and stabilises your body clock, making you sleepy at the right time at night.',
      'تعرّض لضوء ساطع (ويُفضَّل الشمس) بُعيد الاستيقاظ لعشر إلى ثلاثين دقيقة. يقدّم هذا ساعتك البيولوجية ويثبّتها، فتشعر بالنعاس في الوقت الصحيح ليلًا.',
    ),
    evidence: L(
      'Foundational circadian science (Czeisler and others): timed morning light shifts and strengthens the sleep–wake rhythm.',
      'علمٌ أساسي للساعة البيولوجية (تشايزلر وآخرون): ضوء الصباح الموقوت يزيح إيقاع النوم واليقظة ويقوّيه.',
    ),
  },
  {
    id: 'weighted-blanket',
    category: 'environment',
    name: L('Weighted Blanket', 'البطانية الثقيلة'),
    summary: L('Gentle, even pressure can calm and improve sleep.', 'ضغطٌ لطيف متساوٍ قد يهدّئ ويحسّن النوم.'),
    how: L(
      'Use a blanket around 10% of your body weight. The steady deep-pressure touch is calming for many people and may ease insomnia and anxiety.',
      'استخدم بطانية بوزن يقارب ١٠٪ من وزن جسدك. فاللمسُ الضاغطُ العميقُ الثابت مهدّئ لكثيرين وقد يخفّف الأرق والقلق.',
    ),
    evidence: L(
      'A randomized trial (Ekholm et al., 2020, J. Clinical Sleep Medicine) found weighted blankets reduced insomnia severity versus a light blanket.',
      'وجدت تجربة عشوائية (إيكهولم وزملاؤه، ٢٠٢٠) أن البطانيات الثقيلة قلّلت شدّة الأرق مقارنةً ببطانية خفيفة.',
    ),
  },
  {
    id: 'sound-masking',
    category: 'environment',
    name: L('Sound Masking (Pink / Brown Noise)', 'إخفاء الصوت (الضوضاء الوردية / البنيّة)'),
    summary: L('Steady noise hides sudden sounds that jolt you awake.', 'ضوضاء ثابتة تخفي الأصوات المفاجئة التي توقظك.'),
    how: L(
      'Play steady broadband noise (rain, pink or brown noise) at a low, comfortable level all night to mask disruptive sounds.',
      'شغّل ضوضاء عريضة النطاق ثابتة (مطر، أو ضوضاء وردية أو بنيّة) بمستوى منخفض مريح طوال الليل لإخفاء الأصوات المزعجة.',
    ),
    evidence: L(
      'Studies of continuous broadband/pink noise report faster sleep onset and fewer awakenings by reducing the contrast of sudden sounds.',
      'تُبلّغ دراسات الضوضاء المستمرة عريضة النطاق/الوردية عن بدء نوم أسرع واستيقاظ أقل عبر تقليل تباين الأصوات المفاجئة.',
    ),
    route: '/listen',
  },

  // ── Lifestyle / timing ─────────────────────────────────────────────────────
  {
    id: 'fixed-wake-time',
    category: 'lifestyle',
    name: L('A Fixed Wake Time', 'موعد استيقاظ ثابت'),
    summary: L('Wake at the same time daily — even after a bad night.', 'استيقظ في الموعد نفسه يوميًا — حتى بعد ليلة سيّئة.'),
    how: L(
      'Anchor one consistent wake time seven days a week. A steady wake time is the strongest lever for a stable body clock; let bedtime follow sleepiness.',
      'ثبّت موعد استيقاظ واحدًا طوال أيام الأسبوع. فثباتُ موعد الاستيقاظ أقوى رافعة لساعة بيولوجية مستقرّة، ودع موعد النوم يتبع النعاس.',
    ),
    evidence: L(
      'A cornerstone of CBT-I and circadian hygiene; regularity of wake time is strongly tied to better sleep quality and daytime function.',
      'حجر أساس في العلاج المعرفي السلوكي للأرق ونظافة الساعة البيولوجية؛ ويرتبط انتظامُ الاستيقاظ ارتباطًا وثيقًا بجودة نوم أفضل وأداء نهاري أحسن.',
    ),
  },
  {
    id: 'caffeine-cutoff',
    category: 'lifestyle',
    name: L('Caffeine Cut-off', 'وقف الكافيين مبكرًا'),
    summary: L('Stop caffeine at least 6–8 hours before bed.', 'أوقف الكافيين قبل النوم بست إلى ثماني ساعات على الأقل.'),
    how: L(
      'Avoid coffee, strong tea, energy drinks and dark chocolate in the afternoon and evening. Caffeine blocks the "sleep pressure" signal for many hours.',
      'تجنّب القهوة والشاي القوي ومشروبات الطاقة والشوكولاتة الداكنة بعد الظهر ومساءً. فالكافيين يحجب إشارة «ضغط النوم» لساعات عديدة.',
    ),
    evidence: L(
      'A controlled study (Drake et al., 2013) found caffeine even 6 hours before bed measurably disrupted sleep.',
      'وجدت دراسة محكَّمة (دريك وزملاؤه، ٢٠١٣) أن الكافيين حتى قبل النوم بست ساعات يعطّل النوم على نحوٍ قابل للقياس.',
    ),
  },
  {
    id: 'alcohol',
    category: 'lifestyle',
    name: L('Limit Evening Alcohol', 'تقليل الكحول مساءً'),
    summary: L('A nightcap fragments the second half of the night.', 'شرابُ ما قبل النوم يفتّت النصف الثاني من الليل.'),
    how: L(
      'Alcohol may feel sedating but it worsens sleep quality and causes more waking later in the night; keep the evening free of it.',
      'قد يبدو الكحول مهدّئًا لكنه يسوّئ جودة النوم ويزيد الاستيقاظ في وقت متأخر من الليل؛ فاجعل مساءك خاليًا منه.',
    ),
    evidence: L(
      'Reviews of alcohol and sleep show it reduces REM early and fragments sleep in the second half of the night.',
      'تُظهر مراجعات الكحول والنوم أنه يقلّل نوم حركة العين السريعة مبكرًا ويفتّت النوم في النصف الثاني من الليل.',
    ),
  },
  {
    id: 'exercise',
    category: 'lifestyle',
    name: L('Regular Exercise', 'ممارسة الرياضة بانتظام'),
    summary: L('Moving by day deepens sleep at night.', 'الحركة نهارًا تُعمّق النوم ليلًا.'),
    how: L(
      'Aim for regular moderate activity, mostly earlier in the day. Finish vigorous exercise a few hours before bed so arousal has time to settle.',
      'استهدف نشاطًا معتدلًا منتظمًا، معظمه في وقت مبكر من النهار. وأنهِ التمارين الشديدة قبل النوم بساعات ليهدأ التنبّه.',
    ),
    evidence: L(
      'A meta-analysis (Kredlow et al., 2015) found regular exercise improves sleep quality and reduces the time it takes to fall asleep.',
      'وجد تحليل بَعدي (كريدلو وزملاؤه، ٢٠١٥) أن ممارسة الرياضة بانتظام تحسّن جودة النوم وتقلّل زمن الخلود إليه.',
    ),
  },
  {
    id: 'screens',
    category: 'lifestyle',
    name: L('Fewer Screens at Night', 'تقليل الشاشات ليلًا'),
    summary: L('Bright, engaging screens delay and shorten sleep.', 'الشاشات الساطعة الجاذبة تؤخّر النوم وتقصّره.'),
    how: L(
      'Put engaging devices away before bed; if you must use them, dim them, enable warm/night mode, and choose something calm.',
      'أبعِد الأجهزة الجاذبة قبل النوم؛ وإن اضطررت لاستخدامها فخفّف سطوعها وفعّل الوضع الدافئ/الليلي واختر محتوى هادئًا.',
    ),
    evidence: L(
      'Research links pre-bed screen use to later sleep and less total sleep, via both bright light and mental stimulation (Chang et al., 2015).',
      'تربط الأبحاث استخدامَ الشاشات قبل النوم بنومٍ أكثر تأخّرًا وأقلّ إجمالًا، عبر الضوء الساطع والتنبيه الذهني معًا (تشانغ وزملاؤه، ٢٠١٥).',
    ),
  },

  // ── Good to know ───────────────────────────────────────────────────────────
  {
    id: 'melatonin',
    category: 'info',
    name: L('Melatonin — Timing Matters', 'الميلاتونين — العبرة بالتوقيت'),
    summary: L('A timing signal, not a sedative; low dose, early.', 'إشارةُ توقيت لا مهدّئ؛ جرعة صغيرة ومبكرة.'),
    how: L(
      'Melatonin works best as a small dose (often ~0.5–1 mg) taken a few hours before target bedtime to shift the clock — not as a large dose at lights-out. Discuss with a clinician.',
      'يعمل الميلاتونين أفضل ما يكون كجرعة صغيرة (غالبًا نحو ٠٫٥–١ ملغ) تُؤخذ قبل موعد النوم المستهدف بساعات لإزاحة الساعة — لا كجرعة كبيرة عند إطفاء الضوء. واستشر طبيبًا.',
    ),
    evidence: L(
      'Reviews show modest effects on sleep onset, strongest for circadian problems (jet lag, delayed phase); timing and low dose matter more than amount.',
      'تُظهر المراجعات أثرًا متواضعًا على بدء النوم، وأقواه في اضطرابات الساعة البيولوجية (اختلاف التوقيت، تأخّر الطور)؛ والتوقيت والجرعة الصغيرة أهمّ من الكمية.',
    ),
  },
  {
    id: 'mindfulness',
    category: 'relaxation',
    name: L('Mindfulness Meditation', 'تأمّل اليقظة الذهنية'),
    summary: L('Notice thoughts without chasing them.', 'لاحِظ أفكارك دون أن تطاردها.'),
    how: L(
      'Rest attention on the breath or body; when the mind wanders, gently return without judgement. Practised regularly (not just at bedtime), it lowers the mental arousal behind insomnia.',
      'ثبّت انتباهك على النَّفَس أو الجسد؛ وكلما شرد الذهن أعِده بلطف دون حُكم. وبالممارسة المنتظمة (لا عند النوم فقط) يخفّض الاستثارةَ الذهنية وراء الأرق.',
    ),
    evidence: L(
      'A randomized trial (Ong et al., 2014) found mindfulness-based therapy reduced insomnia severity, with benefits maintained at follow-up.',
      'وجدت تجربة عشوائية (أونغ وزملاؤه، ٢٠١٤) أن العلاج القائم على اليقظة الذهنية خفّض شدّة الأرق، مع بقاء الأثر عند المتابعة.',
    ),
  },
  {
    id: 'lavender',
    category: 'environment',
    name: L('Lavender Aroma', 'رائحة الخُزامى'),
    summary: L('A calming scent that may deepen sleep.', 'رائحة مهدّئة قد تعمّق النوم.'),
    how: L(
      'Diffuse a little lavender essential oil or place it nearby before bed. Its scent is associated with reduced anxiety and better perceived sleep quality.',
      'انشر قليلًا من زيت الخُزامى العطري أو ضعه قريبًا قبل النوم. فرائحته تُقرَن بانخفاض القلق وتحسّن جودة النوم المُدرَكة.',
    ),
    evidence: L(
      'Reviews (e.g. Koulivand et al., 2013) report lavender aromatherapy modestly improves sleep quality and lowers anxiety in several studies.',
      'تُبلّغ المراجعات (مثل كوليفاند وزملائه، ٢٠١٣) أن العلاج العطري بالخُزامى يحسّن جودة النوم تحسّنًا متواضعًا ويخفّف القلق في عدّة دراسات.',
    ),
  },
  {
    id: 'warm-feet',
    category: 'environment',
    name: L('Warm Feet / Bed Socks', 'تدفئة القدمين / جوارب النوم'),
    summary: L('Warming the feet can speed sleep onset.', 'تدفئة القدمين قد تعجّل النوم.'),
    how: L(
      'Wear socks or use a warm bottle at the feet. Warming the extremities widens blood vessels and helps the core cool — the signal that triggers sleep.',
      'ارتدِ جوارب أو ضع قِربة دافئة عند قدميك. فتدفئة الأطراف توسّع الأوعية الدموية وتساعد على تبريد قلب الجسم — وهي الإشارة التي تُطلق النوم.',
    ),
    evidence: L(
      'A study (Ko & Lee, 2018) found wearing bed socks helped people fall asleep faster and wake less during the night.',
      'وجدت دراسة (كو ولي، ٢٠١٨) أن ارتداء جوارب النوم ساعد الناس على النوم أسرع والاستيقاظ أقلّ أثناء الليل.',
    ),
  },
  {
    id: 'gratitude',
    category: 'cognitive',
    name: L('Gratitude at Bedtime', 'الامتنان قبل النوم'),
    summary: L('End the day on a few good things.', 'اختم يومك بأشياء طيّبة قليلة.'),
    how: L(
      'Before sleep, bring to mind (or jot down) a few things that went well. Shifting pre-sleep thoughts toward the positive reduces worry at lights-out.',
      'قبل النوم، استحضِر (أو دوّن) بضعة أمور سارت على ما يُرام. فتوجيه أفكار ما قبل النوم نحو الإيجابي يقلّل القلق عند إطفاء الضوء.',
    ),
    evidence: L(
      'Research (Wood et al., 2009) links greater gratitude to more positive pre-sleep thoughts and better sleep quality and duration.',
      'تربط الأبحاث (وود وزملاؤه، ٢٠٠٩) زيادةَ الامتنان بأفكارِ ما قبل نومٍ أكثر إيجابية وبجودة نومٍ ومدّةٍ أفضل.',
    ),
  },
  {
    id: 'reading',
    category: 'cognitive',
    name: L('Read a Print Book', 'اقرأ كتابًا ورقيًّا'),
    summary: L('A few pages, on paper, not a screen.', 'صفحات قليلة، على ورق لا على شاشة.'),
    how: L(
      'Read something calm and undemanding on paper (or an e-ink reader) as a wind-down cue. It displaces stimulating screens and gives the mind a gentle off-ramp.',
      'اقرأ شيئًا هادئًا غير مُجهِد على الورق (أو قارئ حبر إلكتروني) بوصفه إشارةً للاسترخاء. فهذا يزيح الشاشات المنبّهة ويمنح الذهن مخرجًا لطيفًا.',
    ),
    evidence: L(
      'Reading is a widely recommended wind-down habit; a print book avoids the bright, blue-rich light that delays sleep.',
      'القراءة عادةُ استرخاءٍ موصى بها على نطاق واسع؛ والكتاب الورقيّ يتجنّب الضوء الساطع الغنيّ بالأزرق الذي يؤخّر النوم.',
    ),
  },
  {
    id: 'chamomile',
    category: 'info',
    name: L('Chamomile & Warm Drinks', 'البابونج والمشروبات الدافئة'),
    summary: L('A warm, caffeine-free ritual.', 'طقسٌ دافئ خالٍ من الكافيين.'),
    how: L(
      'A warm, caffeine-free drink such as chamomile can be a soothing part of a bedtime routine. Effects are mild — the ritual and warmth matter as much as the herb.',
      'مشروبٌ دافئ خالٍ من الكافيين كالبابونج يمكن أن يكون جزءًا مُهدّئًا من روتين النوم. والأثر خفيف — فالطقس والدفء لا يقلّان أهمّية عن العُشبة.',
    ),
    evidence: L(
      'Evidence is modest and mixed; chamomile shows small calming effects in some trials. Avoid large fluids close to bed to limit waking.',
      'الأدلة متواضعة ومختلطة؛ ويُظهر البابونج آثارًا مهدّئة صغيرة في بعض التجارب. وتجنّب السوائل الكثيرة قرب النوم لتقليل الاستيقاظ.',
    ),
  },
  {
    id: 'when-to-seek-help',
    category: 'info',
    name: L('When to Seek Help', 'متى تطلب المساعدة'),
    summary: L('Persistent insomnia deserves professional care.', 'الأرق المستمر يستحقّ رعاية مختصّة.'),
    how: L(
      'If insomnia lasts most nights for a month or more, or you suspect sleep apnea (loud snoring, gasping, daytime exhaustion), see a clinician. Structured CBT-I is the recommended first-line treatment.',
      'إن استمرّ الأرق معظم الليالي شهرًا أو أكثر، أو اشتبهتَ بانقطاع النفس النومي (شخير عالٍ، لهاث، إنهاك نهاري)، فراجِع مختصًّا. والعلاج المعرفي السلوكي المنظّم للأرق هو العلاج الأول الموصى به.',
    ),
    evidence: L(
      'The American College of Physicians (2016) recommends CBT-I as first-line care for chronic insomnia in adults, ahead of medication.',
      'توصي الكلية الأمريكية للأطباء (٢٠١٦) بالعلاج المعرفي السلوكي للأرق علاجًا أوّليًا للأرق المزمن لدى البالغين، قبل الدواء.',
    ),
  },
];

/** Extra method→tool links, for methods that reuse an existing interactive tool. */
export const EXTRA_ROUTES: Record<string, string> = {
  'stimulus-control': '/rescue',
  'sleep-restriction': '/window',
  'cognitive-restructuring': '/worry',
  diaphragmatic: '/breathe',
  autogenic: '/autogenic',
  'body-scan': '/bodyscan',
  pmr: '/pmr',
  'cognitive-refocusing': '/count',
  mindfulness: '/breathe',
};

/** The interactive route for a method, if any (own route wins). */
export function routeForMethod(m: SleepMethod): string | undefined {
  return m.route ?? EXTRA_ROUTES[m.id];
}

export const METHOD_ORDER: MethodCategory[] = ['cbti', 'relaxation', 'cognitive', 'environment', 'lifestyle', 'info'];

/** Methods hidden from the Arabic edition (culturally irrelevant advice). */
const AR_HIDDEN = new Set(['alcohol']);

export function methodsByCategory(category: MethodCategory, lang?: string): SleepMethod[] {
  return SLEEP_METHODS.filter(
    (m) => m.category === category && (lang !== 'ar' || !AR_HIDDEN.has(m.id)),
  );
}
