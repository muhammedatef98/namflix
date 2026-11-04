/**
 * Lightweight bilingual layer (English / Modern Standard Arabic). No
 * dependency — a flat dictionary of UI chrome strings plus a `Localized`
 * shape for content that ships in both languages. Arabic is written in warm, pan-Arab MSA — the newspaper tone, not the
 * academic one. Short sentences, common verbs, and no decorative tashkeel
 * on short labels. The goal is: a reader from any Arab country finds it
 * natural, not formal.
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
  stop: { en: 'tap to stop', ar: 'المس لتوقف' },
  openYoutube: { en: 'Open in YouTube', ar: 'افتح في يوتيوب' },
  premium: { en: 'Members only', ar: 'لأعضاء بريميوم' },
  subscribe: { en: 'Subscribe to Unlock', ar: 'اشترك لتفتحه' },

  // home
  tagline: { en: 'the sky is dimming', ar: 'السماء بدأت تهدأ' },
  goodNight: { en: 'Good night', ar: 'تصبح على خير' },
  homeIntro: {
    en: 'Everything here is built to lower arousal and ease you toward sleep — the science-backed way.',
    ar: 'كل ما هنا مصمَّم لتهدئة التوتر وتسهيل نومك — بطريقة مدعومة علميًّا.',
  },
  secExpeditions: { en: 'Stargazing Expeditions', ar: 'رحلات تأمّل النجوم' },
  secTonight: { en: "Tonight's tools", ar: 'أدوات الليلة' },
  secListen: { en: 'Real sleep sounds & stories', ar: 'أصوات وقصص تساعدك تنام' },
  screenWarmth: { en: 'screen warmth', ar: 'دفء الشاشة' },
  themeColour: { en: 'comfort theme', ar: 'ثيم مريح للعين' },

  toolBoringTitle: { en: 'Boring on Purpose', ar: 'ممل عن قصد' },
  toolBoringSub: {
    en: 'cognitive shuffle • dull stories • slow watching',
    ar: 'خلط ذهني • قصص مملّة • مشاهدة بطيئة',
  },
  toolMediaTitle: { en: 'Sleep Media Hub', ar: 'مكتبة النوم الصوتية' },
  toolMediaSub: { en: 'stories • hypnosis • NSDR • 8-hour', ar: 'قصص • تنويم • راحة عميقة • ٨ ساعات' },
  toolLogTitle: { en: 'Log Last Night', ar: 'سجِّل نوم الأمس' },
  toolLogSub: { en: 'sleep diary • efficiency', ar: 'سجلّ نوم بسيط' },
  toolBreatheTitle: { en: 'Constellation Tracing', ar: 'تتبُّع الأبراج' },
  toolBreatheSub: { en: '4·7·8 breathing • Orion', ar: 'تنفّس ٤·٧·٨ • الجبّار' },
  toolMixerTitle: { en: 'Cosmic Mixer', ar: 'خلّاط الأصوات الكوني' },
  toolMixerSub: { en: 'blend binaural layers', ar: 'امزج طبقات صوتية' },
  toolWorryTitle: { en: 'Deep Sky Worry Release', ar: 'إطلاق القلق' },
  toolWorrySub: { en: 'let the thought burn away', ar: 'دَع الفكرة تحترق وتتلاشى' },

  // boring hub
  boringTitle: { en: 'Boring on Purpose', ar: 'ممل عن قصد' },
  boringSub: {
    en: 'Content engineered to be forgettable. The tired mind stays awake because it stays interested — so here, nothing is worth staying awake for.',
    ar: 'محتوًى مصمَّم كي يُنسى. فالعقل المتعب يبقى مستيقظًا لأنه يبقى مهتمًّا — وهنا لا شيء يستحق البقاء مستيقظًا لأجله.',
  },
  secActivities: { en: 'Wind-down activities', ar: 'أنشطة الاسترخاء' },
  secMind: { en: 'Quiet the mind', ar: 'تهدئة العقل' },
  secBody: { en: 'Settle the body', ar: 'تهدئة الجسد' },
  secStories: { en: 'Deliberately dull stories', ar: 'قصص مملّة عن قصد' },
  secWatch: { en: 'Slow, uneventful watching', ar: 'مشاهدة بطيئة بلا أحداث' },
  boringDisclaimer: {
    en: 'These techniques ease sleep onset; they are not a treatment for a sleep disorder. If insomnia persists for weeks, clinician-guided CBT-I is the evidence-based first-line care.',
    ar: 'هذه الطرق تُيسّر بدء النوم، وليست علاجًا لاضطراب في النوم. وإن استمرّ الأرق أسابيع، فالعلاج السلوكي للأرق للأرق بإشراف مختصّ هو الرعاية الأولى المثبتة.',
  },

  // shuffle
  shuffleTitle: { en: 'The Cognitive Shuffle', ar: 'خلخلة الأفكار' },
  shuffleLead: {
    en: "You'll see one random, everyday thing at a time. Picture it — plainly, for a moment — then let it dissolve before the next appears.",
    ar: 'سترى شيئًا عاديًّا عشوائيًّا واحدًا في كل مرة. تخيّله ببساطة للحظة، ثم دَعه يتلاشى قبل أن يظهر التالي.',
  },
  shuffleRule1: { en: "Don't link them into a story.", ar: 'لا تربطها بقصة.' },
  shuffleRule2: { en: 'No image is important. Some are dull. Good.', ar: 'لا توجد صورة أهم من غيرها. بعضها ممل، وهذا جيد.' },
  shuffleRule3: { en: "If your mind drifts off — that's the point.", ar: 'إن شرد ذهنك، فهذا هو المطلوب تمامًا.' },
  shuffleStart: { en: 'Begin drifting', ar: 'ابدأ الخلخلة' },
  shuffleHint: { en: 'picture it · let it go · tap to stop', ar: 'تخيّله · دَعه · المس لتوقف' },
  shuffleScience: {
    en: "A stream of disconnected images can't assemble into the coherent, alert thinking that keeps you awake — it mimics the scattered imagery your mind produces at natural sleep onset.",
    ar: 'تيّار من الصور غير المترابطة لا يستطيع أن ينتظم في تفكير متماسك يقظ يُبقيك مستيقظًا — بل يحاكي الصور المبعثرة التي ينتجها ذهنك عند بدء النوم الطبيعي.',
  },
  shuffleBasis: {
    en: 'Based on the "cognitive shuffle" (serial diversification) by cognitive scientist Luc Beaudoin. Early evidence is promising; it is low-risk to try.',
    ar: 'مبنيّ على «خلخلة الأفكار» (التنويع المتسلسل) للعالِم المعرفي لوك بودوان. الأدلة المبكرة واعدة، وتجربته منخفضة المخاطر.',
  },

  // count
  countTitle: { en: 'The Descending Count', ar: 'عدّ تنازلي بطيء' },
  countLead: {
    en: 'A single number, slowly, from 200 down to one. Say each in your head and let the gaps grow long. There is nothing to reach — the point is the monotony.',
    ar: 'رقم واحد، ببطء، من مئتين تنازليًّا إلى الواحد. قُل كلًّا منها في ذهنك ودَع الفواصل تطول. لا شيء تبلغه — فالمقصود هو الرتابة.',
  },
  countStart: { en: 'Begin counting', ar: 'ابدأ العدّ' },
  countHint: { en: 'say it in your head · slowly · tap to stop', ar: 'قُله في ذهنك · ببطء · المس لتوقف' },
  countScience: {
    en: 'A slow, predictable count starves the mind of the stimulating narrative thoughts that drive arousal. When it starts to bore you, it is working.',
    ar: 'العدّ البطيء المتوقَّع يُجوّع العقلَ من الأفكار المثيرة التي تُذكي التوتر. وحين يبدأ يُملّك، فهو يعمل.',
  },
  countBasis: {
    en: 'Honest caveat: in one Oxford study (Harvey & Payne, 2002) plain counting underperformed vivid imagery — use this as a simple fallback.',
    ar: 'تنبيه أمين: في دراسة من أكسفورد (هارفي وباين، ٢٠٠٢) كان العدّ المجرّد أقل فاعلية من التخيّل الحيّ — فاستخدمه خيارًا احتياطيًّا بسيطًا.',
  },

  // imagery
  imageryTitle: { en: 'Imagery Distraction', ar: 'تخيّل يُبعدك عن الأفكار' },
  imageryLead: {
    en: "One calm, unremarkable place, explored slowly — sense by sense. Let each line settle into a picture before the next appears. You don't have to try; just notice.",
    ar: 'مكان واحد هادئ عاديّ، تستكشفه ببطء — حاسّةً بحاسّة. دَع كل سطر يستقرّ صورةً قبل أن يظهر التالي. لا يلزمك أن تجتهد؛ فقط لاحِظ.',
  },
  imageryStart: { en: 'Walk down to the shore', ar: 'انزل إلى البحر' },
  imageryHint: { en: 'see it slowly · no rush · tap to stop', ar: 'شاهده ببطء · دون عجلة · المس لتوقف' },
  imageryScience: {
    en: 'Filling the mind with absorbing-but-neutral imagery crowds out the worry and planning that keep you awake — and it beats plain distraction or counting.',
    ar: 'مَلءُ الذهن بصور جاذبة لكنها محايدة يُزاحم القلقَ والتخطيط اللذين يُبقيانك مستيقظًا — وهو يتفوّق على التشتيت المجرّد أو العدّ.',
  },
  imageryBasis: {
    en: 'Based on imagery distraction, tested in a controlled study by Harvey & Payne (2002). One of the better-evidenced techniques here.',
    ar: 'مبنيّ على تخيّل يُبعدك عن الأفكار، الذي اختُبر في دراسة محكَّمة (هارفي وباين، ٢٠٠٢). وهو من أقوى الطرق هنا دليلًا.',
  },

  // paradox
  paradoxTitle: { en: 'Try to Stay Awake', ar: 'جرّب أن تبقى مستيقظًا' },
  paradoxCue1: { en: 'Lie still. Let your eyes close, or rest them half-open.', ar: 'استلقِ بهدوء. اترك عينيك تُغلَقان، أو اتركهما نصف مفتوحتين.' },
  paradoxCue2: { en: 'Gently try to stay awake — without moving, without effort.', ar: 'جرّب بهدوء أن تبقى مستيقظًا، بلا حركة ولا مجهود.' },
  paradoxCue3: { en: "Don't try to sleep. You are simply keeping a soft watch.", ar: 'لا تحاول أن تنام. أنت فقط تحافظ على يقظة هادئة.' },
  paradoxCue4: { en: "If sleep starts to come, that is fine. You weren't chasing it.", ar: 'وإن بدأ النوم يأتي، لا تقاومه. أنت لم تكن تسعى وراءه أصلًا.' },
  paradoxScience: {
    en: 'Trying to fall asleep creates pressure to perform — and that effort keeps you alert. Gently trying to stay awake removes the effort, and sleep tends to arrive on its own.',
    ar: 'محاولة النوم تخلق ضغطًا كي «تنجح» — وهذا الجهد يُبقيك متنبّهًا. أما محاولة البقاء مستيقظًا بلطف فتُزيل الجهد، فيأتي النوم من تلقاء نفسه.',
  },
  paradoxBasis: {
    en: 'Paradoxical intention — a recognised CBT-I technique with randomised-trial support for easing sleep-effort and bedtime anxiety.',
    ar: 'النيّة العكسية — أسلوب معترف به في العلاج السلوكي للأرق للأرق، وله دعم من تجارب عشوائية في تخفيف جهد النوم وقلق ما قبل النوم.',
  },

  // the descent → "Your Path Tonight" / "مسارك الليلة" (adaptive per state)
  descentTitle: { en: 'Your Path Tonight', ar: 'مسارك الليلة' },
  descentSub: {
    en: 'A single guided journey that dims as you go — matched to how tonight feels.',
    ar: 'رحلة موجَّهة واحدة تخفت وأنت تسير فيها — مفصَّلة على حال ليلتك.',
  },
  descentQuestion: { en: "What's keeping you up tonight?", ar: 'ما الذي يشغلك عن النوم الليلة؟' },
  descentBegin: { en: 'Begin', ar: 'ابدأ' },
  descentEnd: { en: 'end', ar: 'إنهاء' },
  descentHint: { en: 'follow gently · tap to end', ar: 'اتبع بلطف · المس لتُنهي' },
  descentHaptics: { en: 'gentle taps guide your breath', ar: 'نبضات خفيفة ترشد أنفاسك' },
  descentDoneTitle: { en: 'You’ve arrived', ar: 'لقد وصلت' },
  descentDoneSub: {
    en: 'Stay here as long as you like. Keep a sound playing, or drift in silence.',
    ar: 'ابقَ هنا على راحتك. اترك صوتًا يعمل، أو اغفُ في الصمت.',
  },
  descentKeepSound: { en: 'Keep rain playing', ar: 'اترك المطر يعمل' },
  descentSilence: { en: 'Drift in silence', ar: 'اغفُ في الصمت' },
  bIn: { en: 'breathe in', ar: 'شهيق' },
  bHold: { en: 'hold', ar: 'ثبّت' },
  bOut: { en: 'release', ar: 'زفير' },
  toolDescentTitle: { en: 'Your Path Tonight', ar: 'مسارك الليلة' },
  toolDescentSub: {
    en: 'your guided journey into sleep, tailored tonight',
    ar: 'رحلتك الهادئة نحو النوم، مرتّبة لك الليلة',
  },

  // tabs
  tabHome: { en: 'Home', ar: 'الرئيسية' },
  tabMethods: { en: 'Methods', ar: 'الطرق' },
  tabListen: { en: 'Listen', ar: 'استمع' },
  tabTools: { en: 'Tools', ar: 'أدوات' },

  // methods library
  methodsTitle: { en: 'The Sleep Methods Library', ar: 'مكتبة طرق النوم' },
  methodsSub: {
    en: 'Every practical, research-backed way to fall asleep and treat insomnia — with the evidence behind each one.',
    ar: 'كل طريقة عملية مدعومة بالأبحاث للنوم وعلاج الأرق — مع الدليل وراء كلٍّ منها.',
  },
  methodHow: { en: 'How to do it', ar: 'كيف تطبّقها' },
  methodEvidence: { en: 'The evidence', ar: 'الدليل العلمي' },
  methodOpen: { en: 'Open the tool', ar: 'افتح الأداة' },
  methodOpenLocked: { en: 'Open the tool (Premium)', ar: 'افتح الأداة (بريميوم)' },
  methodsDisclaimer: {
    en: 'Educational, evidence-informed content — not medical advice. Persistent insomnia warrants clinician-guided CBT-I.',
    ar: 'محتوى تعليمي قائم على الأبحاث، وليس نصيحة طبية. الأرق المستمر يحتاج إلى علاج سلوكي بإشراف مختص.',
  },

  // tools screen
  toolsTitle: { en: 'Guided tools', ar: 'أدوات تساعدك' },
  toolsSub: {
    en: 'Interactive practices you can start right now.',
    ar: 'تمارين قصيرة يمكنك البدء بها الآن.',
  },
  toolCountTitle: { en: 'The Descending Count', ar: 'عدّ تنازلي بطيء' },
  toolCountSub: { en: 'slow, monotone counting', ar: 'عدٌّ بطيء رتيب' },
  toolShuffleTitle: { en: 'The Cognitive Shuffle', ar: 'خلخلة الأفكار' },
  toolShuffleSub: { en: 'random, unconnected images', ar: 'صور عشوائية غير مترابطة' },
  toolImageryTitle: { en: 'Imagery Distraction', ar: 'تخيّل يُبعدك عن الأفكار' },
  toolImagerySub: { en: 'one calm, neutral scene', ar: 'مشهد واحد هادئ محايد' },
  toolParadoxTitle: { en: 'Try to Stay Awake', ar: 'جرّب أن تبقى مستيقظًا' },
  toolParadoxSub: { en: 'paradoxical intention', ar: 'النيّة العكسية' },

  toolPmrTitle: { en: 'Muscle Release', ar: 'استرخاء العضلات' },
  toolPmrSub: { en: 'tense · release, feet to face', ar: 'شَدٌّ وإرخاء من القدمين إلى الوجه' },
  toolBodyscanTitle: { en: 'Body Scan', ar: 'جولة في جسدك' },
  toolBodyscanSub: { en: 'slow attention through the body', ar: 'انتباه بطيء يجول في الجسد' },
  toolGroundTitle: { en: 'Senses in the Dark', ar: 'حواسك في العتمة' },
  toolGroundSub: { en: '4·3·2·1 sensory grounding', ar: 'تثبيت بالحواس ٤·٣·٢·١' },
  toolsGroupJourneys: { en: 'Guided journeys', ar: 'رحلات موجَّهة' },
  toolsGroupMind: { en: 'Quiet the mind', ar: 'تهدئة العقل' },
  toolsGroupBody: { en: 'Relax the body', ar: 'إرخاء الجسد' },

  // progressive muscle relaxation
  pmrTitle: { en: 'Muscle Release', ar: 'استرخاء العضلات' },
  pmrLead: {
    en: 'Tense each muscle group for a few seconds, then let go and feel it soften. We move slowly from the feet up to the face.',
    ar: 'شُدّ كل مجموعة عضلات لبضع ثوانٍ، ثم أرخِها واشعر بها وهي تلين. ننتقل تدريجيًّا من القدمين إلى الوجه.',
  },
  pmrStart: { en: 'Begin releasing', ar: 'ابدأ الاسترخاء' },
  pmrHint: { en: 'tense · release · tap to stop', ar: 'شُدّ · أرخِ · المس لتوقف' },

  // body scan
  bodyscanTitle: { en: 'Body Scan', ar: 'جولة في جسدك' },
  bodyscanLead: {
    en: 'Rest your attention on one part of the body at a time, and let it soften as you pass. No effort, no tensing — just slow, kind noticing, from the toes to the crown.',
    ar: 'ركّز انتباهك على جزء واحد من جسدك كل مرة، واتركه يسترخي. بلا مجهود ولا شدّ — فقط ملاحظة هادئة، من أصابع القدمين حتى قمة الرأس.',
  },
  bodyscanStart: { en: 'Begin the scan', ar: 'ابدأ الجولة' },
  bodyscanHint: { en: 'follow slowly · tap to stop', ar: 'تابِع ببطء · المس لتوقف' },

  // sensory grounding
  groundTitle: { en: 'Senses in the Dark', ar: 'حواسك في العتمة' },
  groundLead: {
    en: 'An eyes-closed version of sensory grounding. Move through your senses one by one — each time you truly notice something, tap the screen. Anchoring attention in the body pulls it out of racing thought.',
    ar: 'نسخة مغمضة العينين من التثبيت بالحواس. تنقّل بين حواسّك واحدة تلو الأخرى — وكلّما لاحظت شيئًا حقًّا، المس الشاشة. تثبيت الانتباه في الجسد يسحبه من دوّامة الأفكار.',
  },
  groundStart: { en: 'Begin grounding', ar: 'ابدأ التثبيت' },
  groundTapHint: { en: 'tap for each thing you notice', ar: 'المس الشاشة عند كل شيء تلاحظه' },
  groundDone: { en: 'You are here, in your bed.', ar: 'أنت هنا، في فراشك.' },
  groundDoneSub: {
    en: 'Stay with the last sensation. Repeat, or drift.',
    ar: 'ابقَ مع الإحساس الأخير. أعِد الجولة، أو اترك نفسك تنام.',
  },
  groundAgain: { en: 'Once more', ar: 'مرة أخرى' },

  // morning check-in
  checkinGreeting: { en: 'Good morning', ar: 'صباح الخير' },
  checkinUsed: { en: 'Last night you used:', ar: 'استخدمت ليلة أمس:' },
  checkinQuestion: { en: 'How easily did you fall asleep?', ar: 'كيف نمت؟' },
  checkinEasy: { en: 'Easily', ar: 'بسهولة' },
  checkinSlow: { en: 'Took a while', ar: 'أخذ وقتًا' },
  checkinHard: { en: 'With difficulty', ar: 'بصعوبة' },
  checkinThanks: { en: 'Noted. Your map is learning you.', ar: 'تم التسجيل. خريطتك بدأت تتعرّف عليك.' },
  checkinSeeMap: { en: 'See what works for you ←', ar: '← اكتشف ما يناسبك' },

  // insights — the personal map
  insightsTitle: { en: 'What Works for Me', ar: 'ما الذي ينفعني' },
  insightsSub: {
    en: 'Your own record — which practices actually preceded easy nights.',
    ar: 'سجلّك الشخصي: أيّ الطرق تسبق فعلًا لياليك السهلة.',
  },
  insightsEmpty: {
    en: 'Use any tool at night, then answer the one-question morning check-in. Within a few nights, your personal map starts forming here.',
    ar: 'استخدم أي أداة ليلًا، ثم أجب عن سؤال الصباح. خلال ليالٍ قليلة تبدأ خريطتك الشخصية في الظهور هنا.',
  },
  insightsWorks: { en: 'Your record', ar: 'سجلّك' },
  insightsNights: { en: 'rated nights:', ar: 'ليالٍ تقيّمت:' },
  insightsGathering: { en: 'Still gathering', ar: 'قيد الجمع' },
  insightsHistory: { en: 'Recent nights', ar: 'ليالٍ قريبة' },
  insightsHonesty: {
    en: 'Honest note: these are your personal correlations, not clinical proof — many things shape a night. But your own repeated pattern is the most relevant signal you have.',
    ar: 'ملاحظة صادقة: هذه ارتباطات شخصية وليست دليلًا طبيًا، فأشياء كثيرة تؤثر في نومك. لكن تكرار النمط نفسه عندك هو أصدق إشارة متاحة.',
  },
  toolInsightsTitle: { en: 'What Works for Me', ar: 'ما الذي ينفعني' },
  toolInsightsSub: { en: 'your personal sleep map', ar: 'خريطة نومك الخاصة' },

  // 14 nights program
  programTitle: { en: '14 Nights', ar: '١٤ ليلة' },
  programSub: {
    en: 'A self-guided miniature of CBT-I — one small step per night.',
    ar: 'نسخة مصغّرة ذاتية من العلاج السلوكي للأرق للأرق — خطوة صغيرة كل ليلة.',
  },
  programIntro: {
    en: 'CBT-I is the first-line treatment for chronic insomnia — recommended before sleeping pills. Over 14 nights you will build its core habits, one per night: measuring, anchoring your rhythm, retraining the bed, calming body and mind, then writing your own protocol.',
    ar: 'العلاج السلوكي للأرق هو العلاج الأول للأرق المزمن — ويُوصى به قبل الحبوب المنوّمة. عبر ١٤ ليلة ستبني عاداته الأساسية، واحدة كل ليلة: القياس، وتثبيت الإيقاع، وإعادة تدريب السرير، وتهدئة الجسد والعقل، ثم كتابة بروتوكولك الخاص.',
  },
  programStart: { en: 'Begin night one', ar: 'ابدأ أول ليلة' },
  programMarkDone: { en: 'Mark tonight done', ar: 'أنهيت ليلة اليوم' },
  programDone: { en: 'Done ✓', ar: 'تمّت ✓' },
  programOpenTool: { en: 'Open the tool', ar: 'افتح الأداة' },
  programPacing: {
    en: 'One night unlocks per day — the pacing itself is part of the method.',
    ar: 'تنفتح ليلة واحدة في اليوم — الإيقاع نفسه جزء من الطريقة.',
  },
  programDisclaimer: {
    en: 'Educational, evidence-informed content — not medical care. If insomnia persists most nights beyond a month, see a clinician for full CBT-I.',
    ar: 'محتوى تعليمي قائم على الأبحاث، وليس رعاية طبية. إن استمر الأرق معظم الليالي بعد شهر، فراجع مختصًّا لعلاج كامل.',
  },
  toolProgramTitle: { en: '14 Nights', ar: '١٤ ليلة' },
  toolProgramSub: { en: 'a guided CBT-I journey', ar: 'رحلة موجَّهة في العلاج السلوكي' },

  // mixer
  mixerTitle: { en: 'Sound Mixer', ar: 'خلّاط الأصوات' },
  mixerSub: {
    en: 'Blend up to three sounds, each with its own volume.',
    ar: 'اخلط حتى ثلاثة أصوات، كل واحد بمستواه.',
  },
  mixerAddLayer: { en: '+ Add a sound', ar: '+ أضِف صوتًا' },
  mixerClosePicker: { en: 'Close list', ar: 'أغلق القائمة' },
  mixerPlay: { en: 'Play', ar: 'تشغيل' },
  mixerPause: { en: 'Pause', ar: 'إيقاف مؤقت' },
  mixPresetStorm: { en: 'Rain + campfire', ar: 'مطر + نار' },
  mixPresetNight: { en: 'Crickets + brown noise', ar: 'صراصير + ضوضاء هادئة' },
  mixPresetShore: { en: 'Waves + wind', ar: 'أمواج + ريح' },
  toolMixerNewSub: { en: 'blend rain, fire, noise…', ar: 'اخلط المطر والنار والضوضاء…' },

  // save & recall the user's own mixes (tap one to launch it exactly as saved)
  mixerSaveThis: { en: 'Save this mix', ar: 'احفظ هذا المزيج' },
  mixerSavePlaceholder: { en: 'Give this mix a name', ar: 'أعطِ هذا المزيج اسمًا' },
  mixerSaveConfirm: { en: 'Save', ar: 'احفظ' },
  mixerYourSaved: { en: 'Your saved mixes', ar: 'مزيجاتك المحفوظة' },
  mixerSavedOneLayer: { en: '1 sound', ar: 'صوت واحد' },
  mixerSavedLayersN: { en: '{n} sounds', ar: '{n} أصوات' },
  mixerDeleteSavedTitle: { en: 'Delete this mix?', ar: 'نحذف هذا المزيج؟' },
  mixerDeleteSavedBody: {
    en: "This removes '{name}' from your saved mixes. The sounds themselves stay available.",
    ar: 'سنحذف «{name}» من مزيجاتك المحفوظة. أمّا الأصوات نفسها فستبقى متاحة.',
  },
  deleteCancel: { en: 'Cancel', ar: 'إلغاء' },
  deleteConfirmYes: { en: 'Delete', ar: 'حذف' },

  // autogenic training
  autogenicTitle: { en: 'Heavy & Warm', ar: 'ثقل ودفء' },
  autogenicLead: {
    en: 'Autogenic training (Schultz, 1930s): repeat each phrase inwardly, slowly, and let the body follow the words. Heaviness, then warmth, then calm — a standard relaxation therapy for insomnia.',
    ar: 'التدريب الذاتي (شولتز، الثلاثينيات): ردّد كل عبارة في داخلك ببطء، واترك جسمك يتبع الكلمات. ثقل، ثم دفء، ثم هدوء — طريقة استرخاء معتمدة للأرق.',
  },
  autogenicStart: { en: 'Begin the phrases', ar: 'ابدأ العبارات' },
  autogenicHint: { en: 'repeat inwardly · tap to stop', ar: 'ردّد في داخلك · المس لتوقف' },
  toolAutogenicTitle: { en: 'Heavy & Warm', ar: 'ثقل ودفء' },
  toolAutogenicSub: { en: 'autogenic self-suggestion', ar: 'إيحاء ذاتي هادئ' },

  // sleep window calculator
  windowTitle: { en: 'Your Sleep Window', ar: 'نافذة نومك' },
  windowSub: {
    en: 'Sleep restriction — the most effective single CBT-I component, sized to you.',
    ar: 'تقييد النوم — أقوى عنصر منفرد في علاج الأرق، مضبوط عليك أنت.',
  },
  windowQ1: {
    en: 'How many hours do you actually SLEEP on a typical night? (not time in bed)',
    ar: 'كم ساعة تنامها فعلًا في الليلة العادية؟ (وليس الوقت الذي تقضيه في السرير)',
  },
  windowQ2: { en: 'Your fixed wake-up time — every day:', ar: 'موعد استيقاظك الثابت، كل يوم:' },
  windowResult: { en: 'Your window for this week', ar: 'نافذتك لهذا الأسبوع' },
  windowBed: { en: 'earliest bedtime', ar: 'أبكر موعد للنوم' },
  windowWake: { en: 'wake time', ar: 'موعد الاستيقاظ' },
  windowNotEarlier: {
    en: 'Do not get into bed before this time — even if tired. Sleepy is the signal, not the clock.',
    ar: 'لا تدخل السرير قبل هذا الموعد حتى لو كنت متعبًا. النعاس هو الإشارة، وليس الساعة.',
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
  reminderTitle: { en: 'Remind me before bedtime', ar: 'ذكّرني قبل موعد النوم' },
  reminderSub: {
    en: 'One quiet notification a day, at {time}. No sound, no vibration.',
    ar: 'إشعار هادئ واحد يوميًا عند {time}. بلا صوت ولا اهتزاز.',
  },
  reminderDenied: {
    en: 'Notifications are turned off for Namflix. You can allow them in your phone settings.',
    ar: 'الإشعارات متوقفة لنامفلكس. يمكنك السماح بها من إعدادات هاتفك.',
  },
  toolWindowTitle: { en: 'Your Sleep Window', ar: 'نافذة نومك' },
  toolWindowSub: { en: 'sleep-restriction calculator', ar: 'حاسبة نافذة النوم' },

  // links row (home footer)
  privacyLink: { en: 'Privacy policy', ar: 'سياسة الخصوصية' },

  // listen shortcut
  surpriseMe: { en: 'Play something for me', ar: 'شغِّل لي شيئًا' },
  favoritesRow: { en: 'Your favourites', ar: 'مفضّلتك' },

  // sleep radio — curated channels that rotate on their own
  radioHeading: { en: 'Sleep Radio', ar: 'راديو النوم' },
  radioSub: {
    en: 'Tap a channel — it walks through its sounds for you, all night.',
    ar: 'اضغط قناة، فتعمل تلقائيًّا طوال الليل وتتنقّل بين الأصوات وحدها.',
  },
  radioOn: { en: 'ON AIR', ar: 'يعمل الآن' },

  // offline downloads — the sound is kept on the phone, so no network needed
  downloadStart: { en: 'Download for offline', ar: 'نزّل للاستخدام بدون نت' },
  downloadRemove: { en: 'Remove download', ar: 'احذف النسخة المحفوظة' },
  downloadsTitle: { en: 'Downloaded sounds', ar: 'الأصوات المحفوظة' },
  downloadsSub: {
    en: 'Yours on this phone. These keep playing even without internet.',
    ar: 'موجودة على هاتفك. تستمر بالعمل حتى بدون نت.',
  },
  downloadsEmpty: {
    en: 'No downloads yet. Open any sound and tap the download arrow to keep it on your phone.',
    ar: 'لا توجد أصوات محفوظة. افتح أي صوت واضغط سهم التنزيل ليبقى على جهازك.',
  },
  downloadsUsed: { en: '{amount} used', ar: 'يشغل {amount}' },
  downloadsClearAll: { en: 'Delete all downloads', ar: 'احذف كل المحفوظات' },
  downloadsClearConfirmTitle: { en: 'Delete all downloads?', ar: 'حذف كل المحفوظات؟' },
  downloadsClearConfirmBody: {
    en: 'The sounds still stream from our servers when you need them.',
    ar: 'تظل الأصوات تعمل بالبثّ من خوادمنا عند الحاجة.',
  },

  // night rescue — the 3 a.m. mode
  toolRescueTitle: { en: 'Night Rescue', ar: 'نجدة الليل' },
  toolRescueSub: { en: 'woke at 3 a.m.? start here', ar: 'استيقظت في منتصف الليل؟ ابدأ هنا' },
  rescueEntryTitle: { en: 'Awake in the middle of the night?', ar: 'استيقظت في منتصف الليل؟' },
  rescueEntrySub: {
    en: 'A near-dark mode that walks you back to sleep.',
    ar: 'وضع شبه مظلم يعيدك إلى النوم بهدوء.',
  },
  rescueTapHint: { en: 'tap to continue', ar: 'المس لتُكمل' },
  rescueAsk: { en: 'What does this moment feel like?', ar: 'بماذا تشعر الآن؟' },
  // night screen — dark companion with no clock on purpose
  nightEntry: { en: 'Night Screen', ar: 'شاشة الليل' },
  nightEntrySub: {
    en: 'A dark, quiet screen for when you wake — no clock to watch',
    ar: 'شاشة مظلمة هادئة لحظة الاستيقاظ، بلا ساعة تراقبها',
  },
  nightBreatheHint: {
    en: 'Breathe with the light. In as it grows, out as it fades.',
    ar: 'تنفّس مع الضوء: شهيق حين يكبر، وزفير حين يخفت.',
  },
  nightNothingPlaying: { en: 'Nothing playing', ar: 'لا يوجد صوت يعمل' },
  nightPlayRain: { en: 'Play soft rain', ar: 'شغّل مطرًا هادئًا' },
  nightNeedHelp: { en: 'Can’t get back to sleep?', ar: 'لا تستطيع العودة للنوم؟' },
  nightShowControls: { en: 'Show controls', ar: 'إظهار الأزرار' },
  rescueStimulusTitle: { en: 'The 20-minute rule', ar: 'قاعدة العشرين دقيقة' },
  rescueOtherPaths: { en: 'Show the other paths', ar: 'أرني المسارات الأخرى' },

  // media / player
  mediaTitle: { en: 'Sounds that help you sleep', ar: 'أصوات تساعدك تنام' },
  mediaSub: {
    en: 'Real, long-form ambient sound — plays instantly, loops all night.',
    ar: 'أصوات حقيقية طويلة، تعمل فورًا وتستمر طوال الليل.',
  },
  sleepTimer: { en: 'Sleep timer', ar: 'مؤقّت النوم' },
  screenOff: { en: 'Screen off', ar: 'إطفاء الشاشة' },
  tapToWake: { en: 'tap to wake screen', ar: 'المس لتُشعل الشاشة' },

  // breathe screen
  breatheIn: { en: 'Breathe in', ar: 'شهيق' },
  breatheHold: { en: 'Hold', ar: 'ثبّت' },
  breatheOut: { en: 'Release', ar: 'زفير' },
  breatheHint: { en: '4 · 7 · 8 — follow the light', ar: '٤ · ٧ · ٨ — تابع الضوء' },

  // worry screen
  worryTitle: { en: 'Deep Sky', ar: 'سماء عميقة' },
  worrySub: { en: 'name the thought, then let it burn away', ar: 'سَمِّ الفكرة، ثم اتركها تحترق وتختفي' },
  worryPlaceholder: { en: "what's keeping you awake?", ar: 'ما الذي يشغلك عن النوم؟' },
  worryRelease: { en: 'Release', ar: 'أطلقها' },

  codeResent: { en: 'A new code is on its way.', ar: 'رمز جديد في الطريق إليك.' },

  // premium / plans
  premiumTitle: { en: 'Namflix Premium', ar: 'نامفلكس بريميوم' },
  premiumSub: {
    en: 'Every method, every sound, the full guided descent — unlocked.',
    ar: 'كل الطرق، كل الأصوات، والرحلة الموجَّهة بكاملها — مفتوحة لك.',
  },
  // what the subscription actually buys — Apple requires the purchase screen to
  // describe this next to the price (Guideline 3.1.2(c) / 2.3.2)
  premiumIncludes: { en: 'Every plan includes', ar: 'كل باقة فيها' },
  premiumFeat1: {
    en: '40+ looping sleep sounds, favourites and a 3-layer mixer',
    ar: '‏٤٠+ صوت نوم بتكرار مستمر، مع المفضّلة وخلّاط من ٣ طبقات',
  },
  premiumFeat2: {
    en: '30+ evidence-based methods, plus Drift and Night Rescue',
    ar: '‏٣٠+ أسلوبًا قائمًا على الأدلة، مع «السكينة» و«نجدة الليل»',
  },
  premiumFeat3: {
    en: 'The 14-night CBT-I program, sleep window and personal insights',
    ar: 'برنامج الـ١٤ ليلة للعلاج السلوكي، نافذة النوم، وتحليلك الشخصي',
  },
  premiumFeat4: {
    en: 'No ads and no tracking — restore it on any of your devices',
    ar: 'بلا إعلانات ولا تتبّع — استرجعه على أي جهاز من أجهزتك',
  },
  planMonthly: { en: 'Monthly', ar: 'شهري' },
  planYearly: { en: 'Yearly', ar: 'سنوي' },
  planLifetime: { en: 'Lifetime', ar: 'مدى الحياة' },
  perMonth: { en: '/mo', ar: '/شهر' },
  perYear: { en: '/yr', ar: '/سنة' },
  // Savings copy is assembled around a number DERIVED from two live StoreKit
  // prices (see `yearlySavingsPct` in app/premium.tsx). The percentage is never
  // written by hand, so it cannot drift out of date when prices change.
  savePrefix: { en: 'Save', ar: 'وفّر' },
  vsMonthly: { en: 'vs paying monthly', ar: 'عن الدفع الشهري' },
  planLifetimePaidNote: {
    en: 'One payment. Yours for good — no renewal.',
    ar: 'دفعة واحدة. لك للأبد — بلا تجديد.',
  },
  planLifetimeFree: { en: 'Free', ar: 'مجانًا' },
  planLifetimeNote: { en: 'Launch offer — limited time', ar: 'عرض الإطلاق — لوقت محدود' },
  planLifetimeCta: { en: 'Unlock free for life', ar: 'افتحه مجانًا مدى الحياة' },
  planPaidCta: { en: 'Choose plan', ar: 'اختر الباقة' },
  planPaidSoon: {
    en: 'Paid plans arrive with the App Store release. For now, Lifetime is free — enjoy everything.',
    ar: 'الباقات المدفوعة ستتوفّر مع إصدار المتجر. حاليًا Lifetime مجاني — استمتع بكل شيء.',
  },
  premiumActive: { en: 'You’re on Lifetime — everything is unlocked. Rest easy.', ar: 'أنت على باقة مدى الحياة — كل شيء مفتوح. نَم مطمئنًّا.' },
  premiumEntry: { en: 'Unlock every method and sound', ar: 'افتح كل الطرق والأصوات' },
  premiumBadge: { en: 'PREMIUM', ar: 'بريميوم' },
  bestValue: { en: 'BEST VALUE', ar: 'الأفضل قيمة' },
  restorePurchases: { en: 'Restore purchases', ar: 'استرجاع المشتريات' },
  redeemCode: { en: 'Redeem a code', ar: 'استخدام رمز' },
  redeemDone: {
    en: 'Code accepted — everything is unlocked.',
    ar: 'تم قبول الرمز — كل شيء مفتوح الآن.',
  },
  redeemNone: {
    en: 'No code was redeemed.',
    ar: 'لم يُستخدم أي رمز.',
  },
  redeemAndroid: {
    en: 'Open the Play Store, tap your profile, then Payments and subscriptions → Redeem code.',
    ar: 'افتح متجر Play، واضغط صورتك، ثم المدفوعات والاشتراكات ← استخدام رمز.',
  },
  // Lifetime-code copy. The field takes both kinds of code: a Namflix lifetime
  // code, checked on device, and an App Store offer code, handed to Apple's
  // sheet. The placeholder stays neutral so neither looks like the "real" one.
  redeemPlaceholder: { en: 'Enter your code', ar: 'أدخل الرمز' },
  redeemSubmit: { en: 'Redeem', ar: 'تفعيل' },
  redeemAppStore: { en: 'I have an App Store code', ar: 'لديّ رمز من App Store' },
  redeemPlayStore: { en: 'I have a Google Play code', ar: 'لديّ رمز من Google Play' },
  redeemLifetimeDone: {
    en: 'Code accepted — Namflix is yours for life. Everything is unlocked.',
    ar: 'تم قبول الرمز — نامفليكس لك مدى الحياة. كل شيء مفتوح الآن.',
  },
  redeemInvalid: {
    en: 'That code isn’t valid. Check for typos and try again.',
    ar: 'هذا الرمز غير صالح. تأكد من كتابته وحاول مجددًا.',
  },
  restorePrompt: {
    en: 'Reinstalled, or on a new phone? Your subscription is tied to your store account.',
    ar: 'أعدت التثبيت أو انتقلت لهاتف جديد؟ اشتراكك مرتبط بحساب المتجر.',
  },
  termsOfUse: { en: 'Terms of Use', ar: 'شروط الاستخدام' },
  // free-trial copy. Only rendered when the store actually reports a trial —
  // `trialThen` is completed with the real billed price by `trialLabel()`.
  trialThen: { en: 'free, then', ar: 'مجانًا، ثم' },
  trialUnitDay: { en: 'days', ar: 'أيام' },
  trialUnitDay1: { en: 'day', ar: 'يوم' },
  trialUnitWeek: { en: 'weeks', ar: 'أسابيع' },
  trialUnitWeek1: { en: 'week', ar: 'أسبوع' },
  trialUnitMonth: { en: 'months', ar: 'أشهر' },
  trialUnitMonth1: { en: 'month', ar: 'شهر' },
  trialUnitYear: { en: 'years', ar: 'سنوات' },
  trialUnitYear1: { en: 'year', ar: 'سنة' },
  trialDisclosure: {
    en: 'The free trial converts to a paid subscription automatically unless you cancel at least 24 hours before it ends. Cancel anytime in your App Store account settings.',
    ar: 'تتحوّل التجربة المجانية إلى اشتراك مدفوع تلقائيًّا إن لم تُلغِها قبل انتهائها بـ٢٤ ساعة على الأقل. يمكنك الإلغاء في أي وقت من إعدادات حساب App Store.',
  },
  subDisclosure: {
    en: 'Payment is charged to your Apple ID. Subscriptions renew automatically unless cancelled at least 24 hours before the period ends. Manage or cancel anytime in your App Store account settings.',
    ar: 'يُخصم المبلغ من حساب Apple ID. يتجدّد الاشتراك تلقائيًا إن لم يُلغَ قبل نهاية المدة بـ٢٤ ساعة على الأقل. يمكنك إدارة اشتراكك أو إلغاؤه في أي وقت من إعدادات حساب App Store.',
  },
  restoreNone: { en: 'No previous purchase found.', ar: 'لم نجد أي عملية شراء سابقة.' },
  purchaseFailed: { en: 'Purchase could not be completed. Please try again.', ar: 'لم نتمكن من إتمام الشراء. حاول مرة أخرى.' },

  // limited-time free Lifetime offer (countdown + claim flow)
  offerEndsIn: { en: 'Free offer ends in', ar: 'ينتهي العرض المجاني خلال' },
  afterOfferPaid: { en: 'After it ends, access becomes paid.', ar: 'بعد انتهائه، يصبح الوصول مدفوعًا.' },
  cdDays: { en: 'days', ar: 'يوم' },
  cdHours: { en: 'hrs', ar: 'ساعة' },
  cdMins: { en: 'min', ar: 'دقيقة' },
  cdSecs: { en: 'sec', ar: 'ثانية' },
  claimFree: { en: 'Claim it free', ar: 'احصل عليه مجانًا' },
  notNow: { en: 'Not now — keep looking around', ar: 'لاحقًا — أكمل التصفّح' },
  claiming: { en: 'Activating…', ar: 'جارٍ التفعيل…' },
  claimed: { en: 'Activated ✓', ar: 'تم التفعيل ✓' },

  premiumNoAds: { en: 'Remove all ads', ar: 'إزالة كل الإعلانات' },

  // locked content — rewarded unlock (free users only)
  lockTitle: { en: 'This one is for members', ar: 'هذا المحتوى لأعضاء بريميوم' },
  lockSub: {
    en: 'Open it with Premium, or watch one short ad to open it for {hours}.',
    ar: 'افتحه مع بريميوم، أو شاهد إعلانًا قصيرًا يفتحه لك {hours}.',
  },
  unlockWithPremium: { en: 'Unlock with Premium', ar: 'افتحه مع بريميوم' },
  // {hours} → hoursPhrase(), e.g. "24 hours" / "٢٤ ساعة"
  watchAdUnlock: { en: 'Watch a short ad to unlock this for {hours}', ar: 'شاهد إعلانًا قصيرًا ليُفتح لك {hours}' },
  goPremiumNoAds: { en: 'Go Premium — everything unlocked, no ads', ar: 'اشترك في بريميوم واستمتع بكل المحتوى بلا إعلانات' },
  adLoading: { en: 'Getting a short ad ready…', ar: 'نجهّز إعلانًا قصيرًا…' },
  adNoFill: { en: 'No ad available right now, please try again later', ar: 'لا يتوفر إعلان الآن، حاول بعد قليل' },
  adDailyCap: { en: 'Daily limit reached — unlock everything with Premium', ar: 'وصلت إلى الحد اليومي، افتح كل شيء مع بريميوم' },
  adNotNow: { en: 'Not now', ar: 'ليس الآن' },
  adPrivacyChoices: { en: 'Ad privacy choices', ar: 'خيارات خصوصية الإعلانات' },

  // descent rationale
  descentWhy: { en: 'Why this path', ar: 'لماذا هذا المسار' },

  // voluntary support (tip jar) — unlocks nothing, ever
  supportSection: { en: 'Support', ar: 'الدعم' },
  supportCardTitle: { en: 'Keep Namflix free', ar: 'ساعد نامفلكس ليبقى مجانيًا' },
  supportCardSub: {
    en: 'no ads, no tracking — support it if it helped',
    ar: 'بلا إعلانات ولا تتبّع، ادعمه إن نفعك',
  },
  supportTitle: { en: 'Support Namflix', ar: 'ادعم نامفلكس' },
  supportIntro: {
    en: 'Namflix has no ads, no trackers, and nothing that watches you at 3 a.m. It is built and paid for by one person.',
    ar: 'نامفلكس بلا إعلانات ولا تتبّع، ولا أحد يراقبك في الفجر. يبنيه شخص واحد ويتحمّل تكاليفه.',
  },
  supportWhy: {
    en: 'What your support pays for',
    ar: 'أين يذهب دعمك',
  },
  supportWhyBody: {
    en: 'Audio hosting and streaming, developer fees, and the hours behind each new evidence-based tool.',
    ar: 'استضافة الأصوات وبثّها، ورسوم النشر، والساعات وراء كل أداة جديدة قائمة على الأبحاث.',
  },
  supportCta: { en: 'Buy me a coffee', ar: 'ادعمني بفنجان قهوة' },
  supportOpensBrowser: {
    en: 'Opens ko-fi.com in your browser. Any amount, once — no subscription.',
    ar: 'يفتح ko-fi.com في المتصفح. أي مبلغ، مرة واحدة، بلا اشتراك.',
  },
  supportUnlocksNothing: {
    en: 'This unlocks nothing. Everything you already have stays yours, and nothing in the app is hidden behind a donation.',
    ar: 'هذا لا يفتح أي ميزة. ما لديك يبقى لك، ولا شيء في التطبيق محجوب خلف تبرّع.',
  },
  supportNoObligation: {
    en: 'If money is tight, skip this — telling one person who cannot sleep about the app helps just as much.',
    ar: 'إن كان الوضع صعبًا فتجاوز هذا. أن تُعرّف شخصًا يعاني الأرق بالتطبيق يساعدني بالقدر نفسه.',
  },
  // health disclaimer — the app cites studies and sits in Health & Fitness, so
  // Apple 1.4.1 wants a visible "see a clinician" reminder, not a buried one
  medicalDisclaimer: {
    en: 'Namflix offers evidence-based education and self-help, not medical care. It does not diagnose or treat, and it is not a substitute for a clinician — if sleep problems persist or you take sleep medication, speak to a doctor.',
    ar: 'يقدّم نامفلكس محتوى تعليميًّا ومساعدة ذاتية قائمة على الأبحاث، وليس رعاية طبية. لا يُشخّص ولا يعالج، ولا يغني عن الطبيب — إن استمرّت مشكلات النوم أو كنت تتناول أدوية للنوم فاستشر طبيبًا.',
  },
  contactSupport: { en: 'Contact support', ar: 'تواصل مع الدعم' },
  contactFailed: {
    en: 'Could not open mail. Write to Namflix.sleep@gmail.com',
    ar: 'لم نتمكن من فتح البريد. راسلنا على Namflix.sleep@gmail.com',
  },
  supportFailed: {
    en: 'Could not open the link. Try again from your browser: ko-fi.com/muhammedatef98',
    ar: 'لم نتمكن من فتح الرابط. جرّب من المتصفح: ko-fi.com/muhammedatef98',
  },
} as const;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Western digits → Arabic-Indic, matching the app's Arabic copy (٢٤, ٣٣٪). */
export function arabicDigits(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/** "24 hours" / "٢٤ ساعة" — Arabic follows number–noun agreement. */
export function hoursPhrase(h: number, lang: Lang): string {
  if (lang === 'en') return h === 1 ? '1 hour' : `${h} hours`;
  if (h === 1) return 'ساعة واحدة';
  if (h === 2) return 'ساعتين';
  if (h <= 10) return `${arabicDigits(h)} ساعات`;
  return `${arabicDigits(h)} ساعة`;
}

/**
 * Small "time left" badge for a temporarily unlocked item: "18h left" /
 * "متاح لمدة ١٨ ساعة". Rounds up, so it never claims less time than remains.
 * Arabic follows the number–noun agreement rules (ساعة / ساعتين / ساعات).
 */
export function hoursLeftLabel(remainingMs: number, lang: Lang): string {
  if (remainingMs < 60 * 60 * 1000) return lang === 'ar' ? 'متاح لأقل من ساعة' : '<1h left';
  const h = Math.ceil(remainingMs / (60 * 60 * 1000));
  return lang === 'en' ? `${h}h left` : `متاح لمدة ${hoursPhrase(h, lang)}`;
}
