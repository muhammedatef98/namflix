/**
 * "Your Path Tonight" / "مسارك الليلة" — one continuous, self-dimming guided sleep journey.
 *
 * The user names what's keeping them up; the app assembles a sequence of
 * evidence-based techniques matched to that arousal type (cognitive vs.
 * somatic vs. worry), then runs them as a single flow that progressively
 * dims the screen, paces the breath, and lands in near-darkness. Matching the
 * technique to the complaint mirrors how CBT-I is actually tailored.
 *
 * Every text step carries several interchangeable *variants* of its guidance —
 * all expressing the same evidence-based technique in different words. One
 * variant is drawn at random each run, so the same choice never reads exactly
 * the same twice, while the underlying method stays 100% grounded.
 */

import type { Lang, Localized } from '@/lib/i18n';

export type StepType = 'text' | 'breathe' | 'shuffle' | 'imagery' | 'settle';

export interface BreathePattern {
  inhale: number; // seconds
  hold: number;
  exhale: number;
}

export interface DescentStep {
  id: string;
  type: StepType;
  durationSec: number;
  title: Localized;
  /** Resolved guidance beats for this run (chosen from `variants`). */
  lines: Localized[];
  /**
   * Interchangeable phrasings of the same technique. buildSequence() picks one
   * at random per run and copies it into `lines`. Breathe/shuffle/imagery pull
   * their beats elsewhere and leave this empty.
   */
  variants?: Localized[][];
  breathe?: BreathePattern;
}

export interface TonightState {
  id: string;
  label: Localized;
  hint: Localized;
  /** Why this particular path — grounded in the research. */
  rationale: Localized;
  /** Ordered step ids drawn from STEP_LIBRARY. */
  steps: string[];
}

const L = (en: string, ar: string): Localized => ({ en, ar });

export const STEP_LIBRARY: Record<string, DescentStep> = {
  ground: {
    id: 'ground',
    type: 'text',
    durationSec: 22,
    title: L('Settling in', 'نستقرّ'),
    lines: [],
    variants: [
      [
        L('Lie back. Let the bed take your full weight.', 'استلقِ. دَع السرير يحمل ثِقلك كلّه.'),
        L('There is nothing to do now but arrive.', 'لا شيء عليك الآن سوى أن تصل وتهدأ.'),
      ],
      [
        L('Let your body get heavy where it rests.', 'دَع جسدك يثقل حيث يستقرّ.'),
        L('The day is over. You can stop holding on.', 'انتهى النهار. يمكنك أن تكفّ عن التماسك.'),
      ],
      [
        L('Feel the three points that carry you: head, back, heels.', 'اشعر بالنقاط الثلاث التي تحملك: الرأس، الظهر، الكعبان.'),
        L('Nothing is required of you here.', 'لا شيء مطلوب منك هنا.'),
      ],
    ],
  },
  worry: {
    id: 'worry',
    type: 'text',
    durationSec: 48,
    title: L('Set it down', 'ضَعها جانبًا'),
    // Constructive-worry / cognitive-offloading (a core CBT-I technique).
    lines: [],
    variants: [
      [
        L('Bring up the thought that feels loudest.', 'استحضِر الفكرة التي يعلو صوتها أكثر من غيرها.'),
        L('Name one small next step for tomorrow.', 'حدِّد خطوة تالية صغيرة واحدة للغد.'),
        L('Now picture writing it on a slip of paper…', 'الآن تخيّل أنك تكتبها على ورقة…'),
        L('…and setting the paper aside. It keeps till morning.', '…وتضع الورقة جانبًا. ستبقى حتى الصباح.'),
      ],
      [
        L('Notice the worry your mind keeps returning to.', 'لاحِظ القلق الذي يعود إليه ذهنك مرارًا.'),
        L('Tell yourself: this has a time, and the time is tomorrow.', 'قُل لنفسك: لهذا وقت، ووقته هو الغد.'),
        L('Imagine closing it inside a drawer for the night.', 'تخيّل أنك تغلقه في دُرج طوال الليل.'),
        L('It will still be there when you truly need it.', 'سيبقى موجودًا حين تحتاجه فعلًا.'),
      ],
      [
        L('Let the busiest thought step forward.', 'دَع أكثر الأفكار انشغالًا تتقدّم.'),
        L('Give it a single word — a label, not a solution.', 'امنحها كلمة واحدة — تسمية، لا حلًّا.'),
        L('Picture placing that word on a shelf across the room.', 'تخيّل أنك تضع تلك الكلمة على رفٍّ في الجهة المقابلة.'),
        L('You can pick it up in the morning. Not now.', 'يمكنك أخذها في الصباح. ليس الآن.'),
      ],
    ],
  },
  body: {
    id: 'body',
    type: 'text',
    durationSec: 96,
    title: L('Softening', 'ترخية'),
    // Progressive muscle relaxation (Jacobson): release muscle groups in turn.
    lines: [],
    variants: [
      [
        L('Soften your forehead, and unclench your jaw.', 'أرخِ جبهتك، وفُكّ إطباق فكّك.'),
        L('Let your shoulders drop away from your ears.', 'دَع كتفيك ينزلان بعيدًا عن أذنيك.'),
        L('Feel your arms grow heavy and warm.', 'اشعر بذراعيك تثقلان وتدفآن.'),
        L('Let your chest and belly slow right down.', 'دَع صدرك وبطنك يهدآن تمامًا.'),
        L('Release your hips into the bed.', 'أرخِ وركيك في السرير.'),
        L('Let your legs go loose and heavy.', 'دَع ساقيك ترتخيان وتثقلان.'),
        L('Feel the last tension drain out through your feet.', 'اشعر بآخر توتّر ينساب خارجًا من قدميك.'),
      ],
      [
        L('Start at your feet. Let the toes uncurl.', 'ابدأ من قدميك. دَع الأصابع تسترخي.'),
        L('Let the heaviness rise into your calves and knees.', 'دَع الثِّقل يصعد إلى ساقيك وركبتيك.'),
        L('Let your thighs and hips sink downward.', 'دَع فخذيك ووركيك يغوصان إلى الأسفل.'),
        L('Let your belly rise and fall on its own.', 'دَع بطنك يعلو ويهبط من تلقاء نفسه.'),
        L('Soften your hands, one finger at a time.', 'أرخِ يديك، إصبعًا إثر إصبع.'),
        L('Let your shoulders and neck give way.', 'دَع كتفيك وعنقك يذعنان للراحة.'),
        L('Smooth the muscles around your eyes.', 'لطِّف العضلات حول عينيك.'),
      ],
      [
        L('Take a breath, and on the out-breath let your face go slack.', 'خُذ نفَسًا، ومع الزفير دَع وجهك يرتخي.'),
        L('Let your jaw part slightly. No effort there.', 'دَع فكّك ينفرج قليلًا. لا جهد هناك.'),
        L('Let both shoulders melt into the mattress.', 'دَع كلا كتفيك يذوبان في الفراش.'),
        L('Let your arms lie exactly where they fell.', 'دَع ذراعيك حيث سقطتا تمامًا.'),
        L('Let your back spread and widen.', 'دَع ظهرك ينبسط ويتّسع.'),
        L('Let your legs roll open and grow still.', 'دَع ساقيك تنفرجان وتسكنان.'),
        L('Let every muscle you are not using switch off.', 'دَع كل عضلة لا تستعملها تنطفئ.'),
      ],
    ],
  },
  breathe478: {
    id: 'breathe478',
    type: 'breathe',
    durationSec: 114,
    title: L('4 · 7 · 8', '٤ · ٧ · ٨'),
    lines: [],
    breathe: { inhale: 4, hold: 7, exhale: 8 },
  },
  breatheLong: {
    id: 'breatheLong',
    type: 'breathe',
    durationSec: 96,
    title: L('Long, slow exhale', 'زفير طويل بطيء'),
    lines: [],
    breathe: { inhale: 4, hold: 0, exhale: 8 },
  },
  shuffle: {
    id: 'shuffle',
    type: 'shuffle',
    durationSec: 110,
    title: L('Let it scatter', 'دَعها تتبعثر'),
    lines: [],
  },
  imagery: {
    id: 'imagery',
    type: 'imagery',
    durationSec: 120,
    title: L('A quiet shore', 'شاطئ هادئ'),
    lines: [],
  },
  paradox: {
    id: 'paradox',
    type: 'text',
    durationSec: 60,
    title: L('Keep a soft watch', 'يقظة هادئة'),
    // Paradoxical intention: gently resisting sleep removes performance anxiety.
    lines: [],
    variants: [
      [
        L("Don't try to sleep. Simply try to stay gently awake.", 'لا تحاول أن تنام. فقط حاوِل بلطف أن تبقى مستيقظًا.'),
        L('Keep your eyes softly closed, and just… wait.', 'أبقِ عينيك مغمضتين بهدوء، وفقط… انتظِر.'),
        L("If sleep comes, let it. You weren't chasing it.", 'إن جاء النوم فدَعه. لم تكن تسعى خلفه.'),
      ],
      [
        L('Give yourself permission to stay awake a while longer.', 'اسمح لنفسك بالبقاء مستيقظًا قليلًا بعد.'),
        L('There is nowhere to get to. Just rest your eyes.', 'لا مكان عليك بلوغه. فقط أرِح عينيك.'),
        L('Let sleep arrive on its own, whenever it likes.', 'دَع النوم يأتي وحده، متى شاء.'),
      ],
      [
        L('Drop the goal of sleeping. Nothing to achieve tonight.', 'اترُك هدف النوم. لا شيء لتحقّقه الليلة.'),
        L('Keep a soft, easy watch on the darkness.', 'راقِب الظلام مراقبةً هادئة يسيرة.'),
        L('The less you reach for it, the closer it comes.', 'كلّما قلّ سعيك إليه، اقترب أكثر.'),
      ],
    ],
  },
  settle: {
    id: 'settle',
    type: 'settle',
    durationSec: 70,
    title: L('Down', 'إلى الأعماق'),
    lines: [],
    variants: [
      [
        L("You don't need to follow anything now.", 'لا تحتاج أن تتابع شيئًا الآن.'),
        L('Let the last thought go unfinished.', 'دَع آخر فكرة تبقى ناقصة.'),
        L('Down, and down, and down.', 'أعمقُ… فأعمقُ… فأعمق.'),
      ],
      [
        L('Nothing left to do. Nothing left to hold.', 'لم يبقَ ما تفعله. لم يبقَ ما تُمسك به.'),
        L('Let the words blur and drift apart.', 'دَع الكلمات تتلاشى وتتباعد.'),
        L('Sinking, slowly, into the quiet.', 'تغوص، ببطء، في الهدوء.'),
      ],
      [
        L('Let go of the last thread of attention.', 'أفلِت آخر خيط من الانتباه.'),
        L('Heavier now. Softer now.', 'أثقلُ الآن. وأليَنُ الآن.'),
        L('Let yourself be carried the rest of the way.', 'دَع نفسك يُحمل بقيّة الطريق.'),
      ],
    ],
  },
};

export const TONIGHT_STATES: TonightState[] = [
  {
    id: 'racing',
    label: L('My mind is racing', 'ذهني لا يهدأ'),
    hint: L('thoughts won’t stop looping', 'الأفكار تدور ولا تتوقّف'),
    rationale: L(
      'A racing mind needs disruption, not focus. So we first offload the worry (a CBT-I technique), then scatter alert thinking with the cognitive shuffle (Beaudoin) and calm imagery (Harvey & Payne, 2002).',
      'الذهن المتسارع يحتاج تشتيتًا لا تركيزًا. لذا نُفرغ القلق أولًا (أسلوب من العلاج المعرفي السلوكي)، ثم نُبعثر التفكير اليقظ بالخلط الذهني (بودوان) والتخيّل الهادئ (هارفي وباين، ٢٠٠٢).',
    ),
    steps: ['ground', 'worry', 'shuffle', 'imagery', 'settle'],
  },
  {
    id: 'tense',
    label: L('My body is tense', 'جسدي متوتّر'),
    hint: L('wound-up, can’t relax', 'مشدود ولا يقدر على الاسترخاء'),
    rationale: L(
      'Because the tension is physical, we work on the body: a head-to-toe release (Jacobson’s progressive relaxation) and slow 4·7·8 breathing, both shown to lower physiological arousal.',
      'لأن التوتّر جسديّ، نعمل على الجسد: ترخيةٌ من الرأس إلى القدم (استرخاء جاكوبسون التدريجي) وتنفّس ٤·٧·٨ البطيء، وكلاهما يخفض الاستثارة الفسيولوجية.',
    ),
    steps: ['ground', 'body', 'breathe478', 'settle'],
  },
  {
    id: 'worried',
    label: L('I feel anxious', 'أشعر بالقلق'),
    hint: L('worry sits in the chest', 'القلق يجثم في الصدر'),
    rationale: L(
      'Worry lives in thought, so we begin by setting it down (constructive worry, a CBT-I method), then calm the body with breathing and occupy the mind with pleasant imagery (Harvey & Payne, 2002).',
      'القلق يسكن الفكر، لذا نبدأ بوضعه جانبًا (القلق البنّاء، أسلوب من العلاج المعرفي السلوكي)، ثم نُهدّئ الجسد بالتنفّس ونشغل الذهن بتخيّل لطيف (هارفي وباين، ٢٠٠٢).',
    ),
    steps: ['ground', 'worry', 'breathe478', 'imagery', 'settle'],
  },
  {
    id: 'wired',
    label: L("I'm wired, too awake", 'متنبّه جدًّا'),
    hint: L('alert, not sleepy at all', 'يقظ بلا أيّ نعاس'),
    rationale: L(
      'When you are over-alert, a long, slow exhale shifts the nervous system toward rest; then the cognitive shuffle (Beaudoin) breaks up the wakeful thinking.',
      'حين تكون شديد التنبّه، يُحوّل الزفير الطويل البطيء الجهاز العصبي نحو الراحة؛ ثم يُفكّك الخلط الذهني (بودوان) التفكير اليقظ.',
    ),
    steps: ['ground', 'breatheLong', 'shuffle', 'settle'],
  },
  {
    id: 'awake3am',
    label: L("I woke and can't drift back", 'استيقظت ولا أعود للنوم'),
    hint: L('3am, mind switched on', 'الفجر، والذهن قد استيقظ'),
    rationale: L(
      'At 3am, chasing sleep backfires. So we use paradoxical intention — gently trying to stay awake to remove the pressure (an evidence-based technique) — then long exhales to settle.',
      'عند الفجر، السعيُ خلف النوم يأتي بنتيجة عكسية. لذا نستعمل النية المتناقضة — محاولة البقاء مستيقظًا بلطف لرفع الضغط (أسلوب قائم على الأدلة) — ثم زفيرًا طويلًا للتهدئة.',
    ),
    steps: ['ground', 'paradox', 'breatheLong', 'settle'],
  },
];

function pickVariant(step: DescentStep): DescentStep {
  if (!step.variants || step.variants.length === 0) return step;
  const chosen = step.variants[Math.floor(Math.random() * step.variants.length)];
  return { ...step, lines: chosen };
}

/**
 * Assemble the run for a chosen state, drawing a fresh random phrasing for each
 * text step so the guidance differs every time — while the technique behind
 * each step stays fixed and evidence-based.
 */
export function buildSequence(stateId: string): DescentStep[] {
  const state = TONIGHT_STATES.find((s) => s.id === stateId) ?? TONIGHT_STATES[0];
  return state.steps
    .map((id) => STEP_LIBRARY[id])
    .filter(Boolean)
    .map(pickVariant);
}

/** Localized line list for a step, resolving the active language. */
export function stepLines(step: DescentStep, lang: Lang): string[] {
  return step.lines.map((l) => l[lang]);
}
