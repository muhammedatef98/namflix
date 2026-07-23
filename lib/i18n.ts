/**
 * Lightweight bilingual layer (English / Modern Standard Arabic). No
 * dependency — a flat dictionary of UI chrome strings plus a `Localized`
 * shape for content that ships in both languages. Arabic is written in clean
 * فصحى (MSA), a first-class language here, not an afterthought.
 */

export type Lang = 'en' | 'ar';

export interface Localized {
  en: string;
  ar: string;
}

/** Resolve a bilingual value for the active language. */
export function pick(value: Localized, lang: Lang): string {
  return value[lang];
}

export const STRINGS = {
  // shared
  back: { en: 'back', ar: 'رجوع' },
  whyThisWorks: { en: 'why this works', ar: 'لماذا ينجح هذا' },
  stop: { en: 'tap to stop', ar: 'المس للإيقاف' },
  openYoutube: { en: 'Open in YouTube', ar: 'افتح في يوتيوب' },
  premium: { en: 'Members only', ar: 'للمشتركين' },
  subscribe: { en: 'Subscribe to Unlock', ar: 'اشترك للفتح' },

  // home
  tagline: { en: 'the sky is dimming', ar: 'السماء تخفت' },
  exit: { en: 'exit', ar: 'خروج' },
  goodNight: { en: 'Good night', ar: 'طابت ليلتك' },
  homeIntro: {
    en: 'Everything here is built to lower arousal and ease you toward sleep — the science-backed way.',
    ar: 'كل ما هنا مصمَّم لخفض الاستثارة وتيسير نومك — على نحوٍ مدعوم بالعلم.',
  },
  secExpeditions: { en: 'Stargazing Expeditions', ar: 'رحلات تأمّل النجوم' },
  secTonight: { en: "Tonight's tools", ar: 'أدوات هذه الليلة' },
  secListen: { en: 'Real sleep sounds & stories', ar: 'أصوات وقصص نوم حقيقية' },
  screenWarmth: { en: 'screen warmth', ar: 'دفء الشاشة' },
  themeColour: { en: 'comfort theme', ar: 'سِمة مريحة للعين' },

  toolBoringTitle: { en: 'Boring on Purpose', ar: 'مُملٌّ عن قصد' },
  toolBoringSub: {
    en: 'cognitive shuffle • dull stories • slow watching',
    ar: 'خلط ذهني • قصص مملّة • مشاهدة بطيئة',
  },
  toolMediaTitle: { en: 'Sleep Media Hub', ar: 'مكتبة النوم الصوتية' },
  toolMediaSub: { en: 'stories • hypnosis • NSDR • 8-hour', ar: 'قصص • تنويم • راحة عميقة • ٨ ساعات' },
  toolLogTitle: { en: 'Log Last Night', ar: 'سجِّل نوم الأمس' },
  toolLogSub: { en: 'sleep diary • efficiency', ar: 'مذكّرة نوم • كفاءة' },
  toolBreatheTitle: { en: 'Constellation Tracing', ar: 'تتبُّع الأبراج' },
  toolBreatheSub: { en: '4·7·8 breathing • Orion', ar: 'تنفّس ٤·٧·٨ • الجبّار' },
  toolMixerTitle: { en: 'Cosmic Mixer', ar: 'مازج الأصوات الكوني' },
  toolMixerSub: { en: 'blend binaural layers', ar: 'امزج طبقات صوتية' },
  toolWorryTitle: { en: 'Deep Sky Worry Release', ar: 'إطلاق القلق' },
  toolWorrySub: { en: 'let the thought burn away', ar: 'دَع الفكرة تحترق وتتلاشى' },

  // boring hub
  boringTitle: { en: 'Boring on Purpose', ar: 'مُملٌّ عن قصد' },
  boringSub: {
    en: 'Content engineered to be forgettable. The tired mind stays awake because it stays interested — so here, nothing is worth staying awake for.',
    ar: 'محتوًى مصمَّم كي يُنسى. فالعقل المتعب يبقى مستيقظًا لأنه يبقى مهتمًّا — وهنا لا شيء يستحق البقاء مستيقظًا لأجله.',
  },
  secActivities: { en: 'Wind-down activities', ar: 'أنشطة الاسترخاء' },
  secStories: { en: 'Deliberately dull stories', ar: 'قصص مملّة عن قصد' },
  secWatch: { en: 'Slow, uneventful watching', ar: 'مشاهدة بطيئة بلا أحداث' },
  boringDisclaimer: {
    en: 'These techniques ease sleep onset; they are not a treatment for a sleep disorder. If insomnia persists for weeks, clinician-guided CBT-I is the evidence-based first-line care.',
    ar: 'هذه الأساليب تُيسّر بدء النوم، وليست علاجًا لاضطراب في النوم. وإن استمرّ الأرق أسابيع، فالعلاج المعرفي السلوكي للأرق بإشراف مختصّ هو الرعاية الأولى المثبتة.',
  },

  // shuffle
  shuffleTitle: { en: 'The Cognitive Shuffle', ar: 'الخلط الذهني' },
  shuffleLead: {
    en: "You'll see one random, everyday thing at a time. Picture it — plainly, for a moment — then let it dissolve before the next appears.",
    ar: 'سترى شيئًا عاديًّا عشوائيًّا واحدًا في كل مرة. تخيّله ببساطة للحظة، ثم دَعه يتلاشى قبل أن يظهر التالي.',
  },
  shuffleRule1: { en: "Don't link them into a story.", ar: 'لا تربط بينها في قصة.' },
  shuffleRule2: { en: 'No image is important. Some are dull. Good.', ar: 'لا صورة مهمّة. بعضها مملّ. وهذا جيّد.' },
  shuffleRule3: { en: "If your mind drifts off — that's the point.", ar: 'إن شرد ذهنك، فهذا هو المقصود تمامًا.' },
  shuffleStart: { en: 'Begin drifting', ar: 'ابدأ الشرود' },
  shuffleHint: { en: 'picture it · let it go · tap to stop', ar: 'تخيّله · دَعه · المس للإيقاف' },
  shuffleScience: {
    en: "A stream of disconnected images can't assemble into the coherent, alert thinking that keeps you awake — it mimics the scattered imagery your mind produces at natural sleep onset.",
    ar: 'تيّار من الصور غير المترابطة لا يستطيع أن ينتظم في تفكير متماسك يقظ يُبقيك مستيقظًا — بل يحاكي الصور المبعثرة التي ينتجها ذهنك عند بدء النوم الطبيعي.',
  },
  shuffleBasis: {
    en: 'Based on the "cognitive shuffle" (serial diversification) by cognitive scientist Luc Beaudoin. Early evidence is promising; it is low-risk to try.',
    ar: 'مبنيّ على «الخلط الذهني» (التنويع المتسلسل) للعالِم المعرفي لوك بودوان. الأدلة المبكرة واعدة، وتجربته منخفضة المخاطر.',
  },

  // count
  countTitle: { en: 'The Descending Count', ar: 'العدّ التنازلي' },
  countLead: {
    en: 'A single number, slowly, from 200 down to one. Say each in your head and let the gaps grow long. There is nothing to reach — the point is the monotony.',
    ar: 'رقم واحد، ببطء، من مئتين تنازليًّا إلى الواحد. قُل كلًّا منها في ذهنك ودَع الفواصل تطول. لا شيء تبلغه — فالمقصود هو الرتابة.',
  },
  countStart: { en: 'Begin counting', ar: 'ابدأ العدّ' },
  countHint: { en: 'say it in your head · slowly · tap to stop', ar: 'قُله في ذهنك · ببطء · المس للإيقاف' },
  countScience: {
    en: 'A slow, predictable count starves the mind of the stimulating narrative thoughts that drive arousal. When it starts to bore you, it is working.',
    ar: 'العدّ البطيء المتوقَّع يُجوّع العقلَ من الأفكار المثيرة التي تُذكي الاستثارة. وحين يبدأ يُملّك، فهو يعمل.',
  },
  countBasis: {
    en: 'Honest caveat: in one Oxford study (Harvey & Payne, 2002) plain counting underperformed vivid imagery — use this as a simple fallback.',
    ar: 'تنبيه أمين: في دراسة من أكسفورد (هارفي وباين، ٢٠٠٢) كان العدّ المجرّد أقل فاعلية من التخيّل الحيّ — فاستخدمه خيارًا احتياطيًّا بسيطًا.',
  },

  // imagery
  imageryTitle: { en: 'Imagery Distraction', ar: 'التشتيت بالتخيّل' },
  imageryLead: {
    en: "One calm, unremarkable place, explored slowly — sense by sense. Let each line settle into a picture before the next appears. You don't have to try; just notice.",
    ar: 'مكان واحد هادئ عاديّ، تستكشفه ببطء — حاسّةً بحاسّة. دَع كل سطر يستقرّ صورةً قبل أن يظهر التالي. لا يلزمك أن تجتهد؛ فقط لاحِظ.',
  },
  imageryStart: { en: 'Walk down to the shore', ar: 'انزل إلى الشاطئ' },
  imageryHint: { en: 'see it slowly · no rush · tap to stop', ar: 'شاهده ببطء · دون عجلة · المس للإيقاف' },
  imageryScience: {
    en: 'Filling the mind with absorbing-but-neutral imagery crowds out the worry and planning that keep you awake — and it beats plain distraction or counting.',
    ar: 'مَلءُ الذهن بصور جاذبة لكنها محايدة يُزاحم القلقَ والتخطيط اللذين يُبقيانك مستيقظًا — وهو يتفوّق على التشتيت المجرّد أو العدّ.',
  },
  imageryBasis: {
    en: 'Based on imagery distraction, tested in a controlled study by Harvey & Payne (2002). One of the better-evidenced techniques here.',
    ar: 'مبنيّ على التشتيت بالتخيّل، الذي اختُبر في دراسة محكَّمة (هارفي وباين، ٢٠٠٢). وهو من أقوى الأساليب هنا دليلًا.',
  },

  // paradox
  paradoxTitle: { en: 'Try to Stay Awake', ar: 'حاوِل أن تبقى مستيقظًا' },
  paradoxCue1: { en: 'Lie still. Let your eyes close, or rest them half-open.', ar: 'استلقِ ساكنًا. دَع عينيك تُغمَضان، أو أرِحهما نصف مفتوحتين.' },
  paradoxCue2: { en: 'Gently try to stay awake — without moving, without effort.', ar: 'حاوِل بلطف أن تبقى مستيقظًا — دون حركة، دون جهد.' },
  paradoxCue3: { en: "Don't try to sleep. You are simply keeping a soft watch.", ar: 'لا تحاول أن تنام. أنت فقط تُبقي يقظةً هادئة.' },
  paradoxCue4: { en: "If sleep starts to come, that is fine. You weren't chasing it.", ar: 'وإن بدأ النوم يأتي، فلا بأس. لم تكن تسعى خلفه.' },
  paradoxScience: {
    en: 'Trying to fall asleep creates pressure to perform — and that effort keeps you alert. Gently trying to stay awake removes the effort, and sleep tends to arrive on its own.',
    ar: 'محاولة النوم تخلق ضغطًا كي «تنجح» — وهذا الجهد يُبقيك متنبّهًا. أما محاولة البقاء مستيقظًا بلطف فتُزيل الجهد، فيأتي النوم من تلقاء نفسه.',
  },
  paradoxBasis: {
    en: 'Paradoxical intention — a recognised CBT-I technique with randomised-trial support for easing sleep-effort and bedtime anxiety.',
    ar: 'النية المتناقضة — أسلوب معترف به في العلاج المعرفي السلوكي للأرق، وله دعم من تجارب عشوائية في تخفيف جهد النوم وقلق ما قبل النوم.',
  },

  // the descent → "Your Path Tonight" / "مسارك الليلة" (adaptive per state)
  descentTitle: { en: 'Your Path Tonight', ar: 'مسارك الليلة' },
  descentSub: {
    en: 'A single guided journey that dims as you go — matched to how tonight feels.',
    ar: 'رحلة موجَّهة واحدة تخفت وأنت تسير فيها — مفصَّلة على حال ليلتك.',
  },
  descentQuestion: { en: "What's keeping you up tonight?", ar: 'ما الذي يُبقيك مستيقظًا الليلة؟' },
  descentBegin: { en: 'Begin', ar: 'ابدأ الرحلة' },
  descentEnd: { en: 'end', ar: 'إنهاء' },
  descentHint: { en: 'follow gently · tap to end', ar: 'اتبع بلطف · المس للإنهاء' },
  descentHaptics: { en: 'gentle taps guide your breath', ar: 'نبضات خفيفة توجّه أنفاسك' },
  descentDoneTitle: { en: 'You’ve arrived', ar: 'لقد وصلت' },
  descentDoneSub: {
    en: 'Stay here as long as you like. Keep a sound playing, or drift in silence.',
    ar: 'ابقَ هنا ما شئت. دَع صوتًا يعمل، أو اسرح في الصمت.',
  },
  descentKeepSound: { en: 'Keep rain playing', ar: 'أبقِ المطر يعمل' },
  descentSilence: { en: 'Drift in silence', ar: 'اسرح في الصمت' },
  bIn: { en: 'breathe in', ar: 'شهيق' },
  bHold: { en: 'hold', ar: 'أمسِك' },
  bOut: { en: 'release', ar: 'زفير' },
  toolDescentTitle: { en: 'Your Path Tonight', ar: 'مسارك الليلة' },
  toolDescentSub: {
    en: 'your guided journey into sleep, tailored tonight',
    ar: 'رحلتك الموجَّهة إلى النوم، مفصَّلة هذه الليلة',
  },

  // tabs
  tabHome: { en: 'Home', ar: 'الرئيسية' },
  tabMethods: { en: 'Methods', ar: 'الأساليب' },
  tabListen: { en: 'Listen', ar: 'استمِع' },
  tabTools: { en: 'Tools', ar: 'أدوات' },

  // methods library
  methodsTitle: { en: 'The Sleep Methods Library', ar: 'مكتبة أساليب النوم' },
  methodsSub: {
    en: 'Every practical, research-backed way to fall asleep and treat insomnia — with the evidence behind each one.',
    ar: 'كل طريقة عملية مدعومة بالأبحاث للنوم وعلاج الأرق — مع الدليل وراء كلٍّ منها.',
  },
  methodHow: { en: 'How to do it', ar: 'كيف تطبّقها' },
  methodEvidence: { en: 'The evidence', ar: 'الدليل العلمي' },
  methodOpen: { en: 'Open the tool', ar: 'افتح الأداة' },
  methodsDisclaimer: {
    en: 'Educational, evidence-informed content — not medical advice. Persistent insomnia warrants clinician-guided CBT-I.',
    ar: 'محتوى تعليمي قائم على الأدلة — وليس نصيحة طبية. الأرق المستمر يستدعي علاجًا معرفيًّا سلوكيًّا بإشراف مختصّ.',
  },

  // tools screen
  toolsTitle: { en: 'Guided tools', ar: 'أدوات موجَّهة' },
  toolsSub: {
    en: 'Interactive practices you can start right now.',
    ar: 'ممارسات تفاعلية يمكنك بدؤها الآن.',
  },
  toolCountTitle: { en: 'The Descending Count', ar: 'العدّ التنازلي' },
  toolCountSub: { en: 'slow, monotone counting', ar: 'عدٌّ بطيء رتيب' },
  toolShuffleTitle: { en: 'The Cognitive Shuffle', ar: 'الخلط الذهني' },
  toolShuffleSub: { en: 'random, unconnected images', ar: 'صور عشوائية غير مترابطة' },
  toolImageryTitle: { en: 'Imagery Distraction', ar: 'التشتيت بالتخيّل' },
  toolImagerySub: { en: 'one calm, neutral scene', ar: 'مشهد واحد هادئ محايد' },
  toolParadoxTitle: { en: 'Try to Stay Awake', ar: 'حاوِل أن تبقى مستيقظًا' },
  toolParadoxSub: { en: 'paradoxical intention', ar: 'النية المتناقضة' },

  toolPmrTitle: { en: 'Muscle Release', ar: 'ترخية العضلات' },
  toolPmrSub: { en: 'tense · release, feet to face', ar: 'شَدٌّ وإرخاء من القدمين إلى الوجه' },
  toolBodyscanTitle: { en: 'Body Scan', ar: 'مسح الجسد' },
  toolBodyscanSub: { en: 'slow attention through the body', ar: 'انتباه بطيء يجول في الجسد' },
  toolGroundTitle: { en: 'Senses in the Dark', ar: 'حواسّ في العتمة' },
  toolGroundSub: { en: '4·3·2·1 sensory grounding', ar: 'تأريض حسّي ٤·٣·٢·١' },
  toolsGroupJourneys: { en: 'Guided journeys', ar: 'رحلات موجَّهة' },
  toolsGroupMind: { en: 'Quiet the mind', ar: 'تهدئة العقل' },
  toolsGroupBody: { en: 'Relax the body', ar: 'إرخاء الجسد' },

  // progressive muscle relaxation
  pmrTitle: { en: 'Muscle Release', ar: 'ترخية العضلات' },
  pmrLead: {
    en: 'Tense each muscle group for a few seconds, then let go and feel it soften. We move slowly from the feet up to the face.',
    ar: 'شُدّ كل مجموعة عضلية لبضع ثوانٍ، ثم أرخِها واشعر بها تلين. ننتقل ببطء من القدمين حتى الوجه.',
  },
  pmrStart: { en: 'Begin releasing', ar: 'ابدأ الترخية' },
  pmrHint: { en: 'tense · release · tap to stop', ar: 'شُدّ · أرخِ · المس للإيقاف' },

  // body scan
  bodyscanTitle: { en: 'Body Scan', ar: 'مسح الجسد' },
  bodyscanLead: {
    en: 'Rest your attention on one part of the body at a time, and let it soften as you pass. No effort, no tensing — just slow, kind noticing, from the toes to the crown.',
    ar: 'ثبّت انتباهك على جزء واحد من الجسد في كل مرة، ودَعه يلين وأنت تمرّ به. لا جهد ولا شدّ — مجرّد ملاحظة بطيئة رقيقة، من أصابع القدمين إلى قمّة الرأس.',
  },
  bodyscanStart: { en: 'Begin the scan', ar: 'ابدأ المسح' },
  bodyscanHint: { en: 'follow slowly · tap to stop', ar: 'تابِع ببطء · المس للإيقاف' },

  // sensory grounding
  groundTitle: { en: 'Senses in the Dark', ar: 'حواسّ في العتمة' },
  groundLead: {
    en: 'An eyes-closed version of sensory grounding. Move through your senses one by one — each time you truly notice something, tap the screen. Anchoring attention in the body pulls it out of racing thought.',
    ar: 'نسخة مغمضة العينين من التأريض الحسّي. تنقّل بين حواسّك واحدة تلو الأخرى — وكلّما لاحظت شيئًا حقًّا، المس الشاشة. تثبيت الانتباه في الجسد يسحبه من دوّامة الأفكار.',
  },
  groundStart: { en: 'Begin grounding', ar: 'ابدأ التأريض' },
  groundTapHint: { en: 'tap for each thing you notice', ar: 'المس عند كل شيء تلاحظه' },
  groundDone: { en: 'You are here, in your bed.', ar: 'أنت هنا، في سريرك.' },
  groundDoneSub: {
    en: 'Stay with the last sensation. Repeat, or drift.',
    ar: 'ابقَ مع الإحساس الأخير. أعِد الجولة، أو انسَبْ نحو النوم.',
  },
  groundAgain: { en: 'Once more', ar: 'مرة أخرى' },

  // morning check-in
  checkinGreeting: { en: 'Good morning', ar: 'صباح الخير' },
  checkinUsed: { en: 'Last night you used:', ar: 'استخدمت البارحة:' },
  checkinQuestion: { en: 'How easily did you fall asleep?', ar: 'كيف كان دخولك في النوم؟' },
  checkinEasy: { en: 'Easily', ar: 'بسهولة' },
  checkinSlow: { en: 'Took a while', ar: 'بعد وقت' },
  checkinHard: { en: 'With difficulty', ar: 'بصعوبة' },
  checkinThanks: { en: 'Noted. Your map is learning you.', ar: 'سُجّلت. خريطتك تتعلّمك.' },
  checkinSeeMap: { en: 'See what works for you ←', ar: '← شاهد ما ينفع معك' },

  // insights — the personal map
  insightsTitle: { en: 'What Works for Me', ar: 'ماذا ينفع معي' },
  insightsSub: {
    en: 'Your own record — which practices actually preceded easy nights.',
    ar: 'سجلّك أنت — أيّ الممارسات سبقت فعلًا لياليك السهلة.',
  },
  insightsEmpty: {
    en: 'Use any tool at night, then answer the one-question morning check-in. Within a few nights, your personal map starts forming here.',
    ar: 'استخدم أي أداة ليلًا، ثم أجب عن سؤال الصباح الواحد. خلال ليالٍ قليلة تبدأ خريطتك الشخصية بالتشكّل هنا.',
  },
  insightsWorks: { en: 'Your record', ar: 'سجلّك' },
  insightsNights: { en: 'rated nights:', ar: 'ليالٍ مقيَّمة:' },
  insightsGathering: { en: 'Still gathering', ar: 'قيد التجميع' },
  insightsHistory: { en: 'Recent nights', ar: 'الليالي الأخيرة' },
  insightsHonesty: {
    en: 'Honest note: these are your personal correlations, not clinical proof — many things shape a night. But your own repeated pattern is the most relevant signal you have.',
    ar: 'ملاحظة صادقة: هذه ارتباطات شخصية لا إثبات سريري — فأشياء كثيرة تشكّل ليلتك. لكنّ نمطك المتكرّر هو أوثق إشارة تملكها.',
  },
  toolInsightsTitle: { en: 'What Works for Me', ar: 'ماذا ينفع معي' },
  toolInsightsSub: { en: 'your personal sleep map', ar: 'خريطة نومك الشخصية' },

  // 14 nights program
  programTitle: { en: '14 Nights', ar: '١٤ ليلة' },
  programSub: {
    en: 'A self-guided miniature of CBT-I — one small step per night.',
    ar: 'نسخة مصغّرة ذاتية من العلاج المعرفي السلوكي للأرق — خطوة صغيرة كل ليلة.',
  },
  programIntro: {
    en: 'CBT-I is the first-line treatment for chronic insomnia — recommended before sleeping pills. Over 14 nights you will build its core habits, one per night: measuring, anchoring your rhythm, retraining the bed, calming body and mind, then writing your own protocol.',
    ar: 'العلاج المعرفي السلوكي هو العلاج الأول للأرق المزمن — ويُوصى به قبل الحبوب المنوّمة. عبر ١٤ ليلة ستبني عاداته الأساسية، واحدة كل ليلة: القياس، وتثبيت الإيقاع، وإعادة تدريب السرير، وتهدئة الجسد والعقل، ثم كتابة بروتوكولك الخاص.',
  },
  programStart: { en: 'Begin night one', ar: 'ابدأ الليلة الأولى' },
  programMarkDone: { en: 'Mark tonight done', ar: 'أتممتُ هذه الليلة' },
  programDone: { en: 'Done ✓', ar: 'تمّت ✓' },
  programOpenTool: { en: 'Open the tool', ar: 'افتح الأداة' },
  programPacing: {
    en: 'One night unlocks per day — the pacing itself is part of the method.',
    ar: 'تُفتح ليلة واحدة كل يوم — فالإيقاع نفسه جزء من المنهج.',
  },
  programDisclaimer: {
    en: 'Educational, evidence-informed content — not medical care. If insomnia persists most nights beyond a month, see a clinician for full CBT-I.',
    ar: 'محتوى تعليمي قائم على الأدلة — وليس رعاية طبية. إن استمرّ الأرق معظم الليالي بعد شهر فراجع مختصًّا لعلاج كامل.',
  },
  toolProgramTitle: { en: '14 Nights', ar: '١٤ ليلة' },
  toolProgramSub: { en: 'a guided CBT-I journey', ar: 'رحلة موجَّهة في العلاج السلوكي' },

  // mixer
  mixerTitle: { en: 'Sound Mixer', ar: 'مازج الأصوات' },
  mixerSub: {
    en: 'Blend up to three sounds, each with its own volume.',
    ar: 'امزج حتى ثلاثة أصوات، لكلٍّ مستواه الخاص.',
  },
  mixerAddLayer: { en: '+ Add a sound', ar: '+ أضِف صوتًا' },
  mixerClosePicker: { en: 'Close list', ar: 'أغلق القائمة' },
  mixerPlay: { en: 'Play', ar: 'تشغيل' },
  mixerPause: { en: 'Pause', ar: 'إيقاف مؤقت' },
  mixPresetStorm: { en: 'Rain + campfire', ar: 'مطر + نار مخيّم' },
  mixPresetNight: { en: 'Crickets + brown noise', ar: 'صراصير + ضوضاء بنيّة' },
  mixPresetShore: { en: 'Waves + wind', ar: 'أمواج + ريح' },
  toolMixerNewSub: { en: 'blend rain, fire, noise…', ar: 'امزج المطر والنار والضوضاء…' },

  // autogenic training
  autogenicTitle: { en: 'Heavy & Warm', ar: 'ثِقل ودفء' },
  autogenicLead: {
    en: 'Autogenic training (Schultz, 1930s): repeat each phrase inwardly, slowly, and let the body follow the words. Heaviness, then warmth, then calm — a standard relaxation therapy for insomnia.',
    ar: 'التدريب الذاتي (شولتز، الثلاثينيات): ردّد كل عبارة في داخلك ببطء، ودَع الجسد يتبع الكلمات. ثِقل، ثم دفء، ثم هدوء — علاج استرخاء قياسي للأرق.',
  },
  autogenicStart: { en: 'Begin the phrases', ar: 'ابدأ العبارات' },
  autogenicHint: { en: 'repeat inwardly · tap to stop', ar: 'ردّد في داخلك · المس للإيقاف' },
  toolAutogenicTitle: { en: 'Heavy & Warm', ar: 'ثِقل ودفء' },
  toolAutogenicSub: { en: 'autogenic self-suggestion', ar: 'إيحاء ذاتي (أوتوجيني)' },

  // sleep window calculator
  windowTitle: { en: 'Your Sleep Window', ar: 'نافذة نومك' },
  windowSub: {
    en: 'Sleep restriction — the most effective single CBT-I component, sized to you.',
    ar: 'تقييد النوم — أنجع مكوّن منفرد في علاج الأرق، مضبوطًا عليك أنت.',
  },
  windowQ1: {
    en: 'How many hours do you actually SLEEP on a typical night? (not time in bed)',
    ar: 'كم ساعة تنامها فعلًا في الليلة المعتادة؟ (لا الوقت الذي تقضيه في السرير)',
  },
  windowQ2: { en: 'Your fixed wake-up time — every day:', ar: 'موعد استيقاظك الثابت — كل يوم:' },
  windowResult: { en: 'Your window for this week', ar: 'نافذتك لهذا الأسبوع' },
  windowBed: { en: 'earliest bedtime', ar: 'أبكر موعد للسرير' },
  windowWake: { en: 'wake time', ar: 'موعد الاستيقاظ' },
  windowNotEarlier: {
    en: 'Do not get into bed before this time — even if tired. Sleepy is the signal, not the clock.',
    ar: 'لا تدخل السرير قبل هذا الموعد — حتى لو كنت مرهقًا. النعاس هو الإشارة، لا الساعة.',
  },
  windowRulesTitle: { en: 'Weekly tuning', ar: 'الضبط الأسبوعي' },
  windowRule1: {
    en: '• Sleeping through ~90% of your window for a week? Move bedtime 15 minutes earlier.',
    ar: '• نمتَ نحو ٩٠٪ من نافذتك أسبوعًا كاملًا؟ قدِّم موعد السرير ١٥ دقيقة.',
  },
  windowRule2: {
    en: '• Lying awake a lot (under ~85%)? Push bedtime 15 minutes later.',
    ar: '• تسهر كثيرًا داخلها (أقل من ٨٥٪)؟ أخِّر موعد السرير ١٥ دقيقة.',
  },
  windowRule3: {
    en: '• Never shrink the window below 5½ hours, and keep the wake time fixed always.',
    ar: '• لا تُنقص النافذة عن ٥ ساعات ونصف أبدًا، وأبقِ موعد الاستيقاظ ثابتًا دائمًا.',
  },
  windowEvidence: {
    en: 'Spielman et al. (1987); meta-analyses rank sleep restriction as the strongest single CBT-I component. Expect a few sleepier days at first — that pressure is the mechanism.',
    ar: 'سبيلمان وزملاؤه (١٩٨٧)؛ وتصنّف التحليلات التلوية تقييد النوم أقوى مكوّن منفرد في العلاج. توقّع أيامًا أولى أكثر نعاسًا — فهذا الضغط هو آلية العلاج نفسها.',
  },
  windowDisclaimer: {
    en: 'Not for people with epilepsy, bipolar disorder, or jobs where daytime sleepiness is dangerous (driving, heavy machinery) — consult a clinician first.',
    ar: 'لا يناسب المصابين بالصرع أو الاضطراب ثنائي القطب، ولا أصحاب الأعمال التي يخطر فيها نعاس النهار (قيادة، آلات ثقيلة) — استشر مختصًّا أولًا.',
  },
  toolWindowTitle: { en: 'Your Sleep Window', ar: 'نافذة نومك' },
  toolWindowSub: { en: 'sleep-restriction calculator', ar: 'حاسبة تقييد النوم' },

  // account section (home footer)
  accountSection: { en: 'Account', ar: 'الحساب' },
  privacyLink: { en: 'Privacy policy', ar: 'سياسة الخصوصية' },
  deleteAccount: { en: 'Delete account', ar: 'حذف الحساب' },
  deleteConfirmTitle: { en: 'Delete your account?', ar: 'أتريد حذف حسابك؟' },
  deleteConfirmBody: {
    en: 'This permanently deletes your account and its data. This cannot be undone.',
    ar: 'سيُحذف حسابك وبياناته نهائيًّا، ولا يمكن التراجع عن ذلك.',
  },
  deleteConfirmYes: { en: 'Delete permanently', ar: 'احذف نهائيًّا' },
  deleteCancel: { en: 'Cancel', ar: 'إلغاء' },
  deleteFailed: {
    en: 'Deletion failed. Check your connection and try again.',
    ar: 'تعذّر الحذف. تحقّق من اتصالك وحاوِل مرة أخرى.',
  },

  // listen shortcut
  surpriseMe: { en: 'Play something for me', ar: 'شغِّل لي شيئًا' },
  favoritesRow: { en: 'Your favourites', ar: 'مفضّلتك' },

  // night rescue — the 3 a.m. mode
  toolRescueTitle: { en: 'Night Rescue', ar: 'الإنقاذ الليلي' },
  toolRescueSub: { en: 'woke at 3 a.m.? start here', ar: 'استيقظت في منتصف الليل؟ ابدأ هنا' },
  rescueEntryTitle: { en: 'Awake in the middle of the night?', ar: 'مستيقظ في منتصف الليل؟' },
  rescueEntrySub: {
    en: 'A near-dark mode that walks you back to sleep.',
    ar: 'وضع شبه مظلم يرافقك عائدًا إلى النوم.',
  },
  rescueTapHint: { en: 'tap to continue', ar: 'المس للمتابعة' },
  rescueAsk: { en: 'What does this moment feel like?', ar: 'كيف تبدو هذه اللحظة؟' },
  rescueStimulusTitle: { en: 'The 20-minute rule', ar: 'قاعدة العشرين دقيقة' },
  rescueOtherPaths: { en: 'Show the other paths', ar: 'أرِني المسارات الأخرى' },

  // media / player
  mediaTitle: { en: 'Sounds that help you sleep', ar: 'أصوات تساعدك على النوم' },
  mediaSub: {
    en: 'Real, long-form ambient sound — plays instantly, loops all night.',
    ar: 'صوت محيطيّ حقيقيّ طويل — يعمل فورًا ويتكرّر طوال الليل.',
  },
  sleepTimer: { en: 'Sleep timer', ar: 'مؤقّت النوم' },
  screenOff: { en: 'Screen off', ar: 'إطفاء الشاشة' },
  tapToWake: { en: 'tap to wake screen', ar: 'المس لإيقاظ الشاشة' },

  // breathe screen
  breatheIn: { en: 'Breathe in', ar: 'شهيق' },
  breatheHold: { en: 'Hold', ar: 'أمسِك' },
  breatheOut: { en: 'Release', ar: 'زفير' },
  breatheHint: { en: '4 · 7 · 8 — follow the light', ar: '٤ · ٧ · ٨ — اتبع الضوء' },

  // worry screen
  worryTitle: { en: 'Deep Sky', ar: 'سماء عميقة' },
  worrySub: { en: 'name the thought, then let it burn away', ar: 'سَمِّ الفكرة، ثم دَعها تحترق وتتلاشى' },
  worryPlaceholder: { en: "what's keeping you awake?", ar: 'ما الذي يُبقيك مستيقظًا؟' },
  worryRelease: { en: 'Release', ar: 'أطلِقها' },

  // login screen
  welcomeBack: { en: 'welcome back', ar: 'أهلًا بعودتك' },
  restStarts: { en: 'rest starts here', ar: 'الراحة تبدأ هنا' },
  emailField: { en: 'email', ar: 'البريد الإلكتروني' },
  guestEnter: { en: 'Continue as guest', ar: 'الدخول كضيف' },
  loginFailed: { en: 'Sign-in failed', ar: 'فشل تسجيل الدخول' },
  // passwordless email-code flow
  authIntro: {
    en: 'Enter your email and we’ll send you a sign-in code.',
    ar: 'أدخِل بريدك وسنرسل لك رمز دخول.',
  },
  sendCode: { en: 'Send code', ar: 'أرسِل الرمز' },
  emailMissing: { en: 'Enter your email first.', ar: 'أدخِل بريدك أولًا.' },
  codeSentTo: { en: 'We sent a sign-in code to', ar: 'أرسلنا رمز دخول إلى' },
  codeField: { en: 'verification code', ar: 'رمز الدخول' },
  verifyCode: { en: 'Verify & enter', ar: 'تأكيد ودخول' },
  codeMissing: { en: 'Enter the code from your email.', ar: 'أدخِل الرمز الموجود في بريدك.' },
  resendCode: { en: 'Resend code', ar: 'إعادة إرسال الرمز' },
  changeEmail: { en: 'Change email', ar: 'تغيير البريد' },
  codeResent: { en: 'A new code is on its way.', ar: 'رمز جديد في الطريق إليك.' },

  // premium / plans
  premiumTitle: { en: 'Namflix Premium', ar: 'نامفلكس بريميوم' },
  premiumSub: {
    en: 'Every method, every sound, the full guided descent — unlocked.',
    ar: 'كل الأساليب، كل الأصوات، الرحلة الموجَّهة كاملة — مفتوحة لك.',
  },
  planMonthly: { en: 'Monthly', ar: 'شهري' },
  planYearly: { en: 'Yearly', ar: 'سنوي' },
  planLifetime: { en: 'Lifetime', ar: 'مدى الحياة' },
  perMonth: { en: '/mo', ar: '/شهر' },
  perYear: { en: '/yr', ar: '/سنة' },
  planYearlyNote: { en: 'Save 33% vs monthly', ar: 'وفّر ٣٣٪ عن الشهري' },
  planLifetimeFree: { en: 'Free', ar: 'مجانًا' },
  planLifetimeNote: { en: 'Launch offer — limited time', ar: 'عرض الإطلاق — لوقت محدود' },
  planLifetimeCta: { en: 'Unlock free for life', ar: 'افتحه مجانًا مدى الحياة' },
  planPaidCta: { en: 'Choose plan', ar: 'اختر الباقة' },
  planPaidSoon: {
    en: 'Paid plans arrive with the App Store release. For now, Lifetime is free — enjoy everything.',
    ar: 'الباقات المدفوعة ستتوفّر مع إصدار المتجر. حاليًا Lifetime مجاني — استمتع بكل شيء.',
  },
  premiumActive: { en: 'You’re on Lifetime — everything is unlocked. Rest easy.', ar: 'أنت على باقة مدى الحياة — كل شيء مفتوح. نَم مطمئنًّا.' },
  premiumEntry: { en: 'Unlock everything — free for launch', ar: 'افتح كل المزايا — مجانًا مع الإطلاق' },
  premiumBadge: { en: 'PREMIUM', ar: 'بريميوم' },
  bestValue: { en: 'BEST VALUE', ar: 'الأفضل قيمة' },

  // descent rationale
  descentWhy: { en: 'Why this path', ar: 'لماذا هذا المسار' },
} as const;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}
