/**
 * "14 Nights" — a self-guided miniature of CBT-I (cognitive behavioural
 * therapy for insomnia), the first-line treatment recommended by the American
 * College of Physicians (2016). One small, concrete assignment per night,
 * ordered the way clinician-delivered CBT-I typically unfolds: measure →
 * anchor the rhythm → stimulus control → arousal work → cognitive work →
 * consolidation. Honest framing throughout: this is education, not therapy,
 * and persistent insomnia deserves clinician-guided care.
 *
 * Progress is stored locally: { startedAt: ISO date, done: number[] }.
 * One night unlocks per calendar day — the pacing IS the treatment.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Localized } from '@/lib/i18n';

const PROGRAM_KEY = 'namflix.program';

export interface ProgramNight {
  /** 1-based night number. */
  n: number;
  title: Localized;
  /** Tonight's single concrete assignment. */
  action: Localized;
  /** Why — the honest evidence line. */
  why: Localized;
  /** Optional in-app tool that supports tonight's step. */
  route?: string;
}

const L = (en: string, ar: string): Localized => ({ en, ar });

export const PROGRAM: ProgramNight[] = [
  {
    n: 1,
    title: L('Just watch', 'راقِب فقط'),
    action: L(
      'Change nothing tonight. Note roughly when you got into bed, how long falling asleep felt, and when you woke. No precision needed — impressions are enough.',
      'لا تغيّر شيئًا الليلة. لاحِظ تقريبًا متى دخلت السرير، وكم بدا لك زمن الدخول في النوم، ومتى استيقظت. لا حاجة للدقة — الانطباعات تكفي.',
    ),
    why: L(
      'CBT-I always begins with a sleep diary: you cannot adjust what you have not measured.',
      'يبدأ العلاج المعرفي السلوكي دائمًا بمذكرة نوم: لا يمكنك ضبط ما لم تقسه.',
    ),
  },
  {
    n: 2,
    title: L('Anchor the morning', 'ثبّت الصباح'),
    action: L(
      'Pick ONE wake-up time you can keep every day — including weekends — and set that alarm now. Tonight, sleep whenever you feel sleepy.',
      'اختر موعد استيقاظ واحدًا تستطيع الالتزام به كل يوم — حتى نهاية الأسبوع — واضبط المنبّه الآن. أما الليلة فنَم متى شعرت بالنعاس.',
    ),
    why: L(
      'A fixed wake time is the strongest single lever on the body clock; bedtime follows it, not the reverse.',
      'موعد الاستيقاظ الثابت أقوى رافعة منفردة لساعة الجسد؛ وموعد النوم يتبعه لا العكس.',
    ),
  },
  {
    n: 3,
    title: L('Morning light', 'ضوء الصباح'),
    action: L(
      'Within an hour of waking, get 10–30 minutes of bright light — sunlight if possible, a balcony or window seat counts.',
      'خلال ساعة من استيقاظك، احصل على ١٠–٣٠ دقيقة من ضوء ساطع — الشمس إن أمكن، وتكفي شرفة أو مقعد قرب النافذة.',
    ),
    why: L(
      'Morning light advances and stabilises the circadian clock, making sleepiness arrive on time at night.',
      'ضوء الصباح يقدّم الساعة اليومية ويثبّتها، فيصل النعاس في موعده ليلًا.',
    ),
  },
  {
    n: 4,
    title: L('Caffeine curfew', 'حظر الكافيين'),
    action: L(
      'No caffeine after roughly 2 p.m. today — coffee, tea, cola, and energy drinks all count.',
      'لا كافيين بعد نحو الثانية ظهرًا اليوم — القهوة والشاي والكولا ومشروبات الطاقة كلها محسوبة.',
    ),
    why: L(
      "Caffeine's half-life is ~5–6 hours; an afternoon cup still occupies its receptors at midnight.",
      'عمر الكافيين النصفي نحو ٥–٦ ساعات؛ ففنجان العصر ما يزال يشغل مستقبلاته في منتصف الليل.',
    ),
  },
  {
    n: 5,
    title: L('The bed is for sleep', 'السرير للنوم'),
    action: L(
      'From tonight: no phone, work, or eating in bed. Bed = sleep (and intimacy) only. If you want to scroll, do it in a chair.',
      'من الليلة: لا هاتف ولا عمل ولا أكل في السرير. السرير = نوم (وعلاقة زوجية) فقط. إن أردت التصفّح فمن كرسيّ.',
    ),
    why: L(
      'Stimulus control (Bootzin, 1972): the brain learns by association — a bed used only for sleep starts triggering sleep.',
      'التحكّم بالمثيرات (بوتزين ١٩٧٢): يتعلّم الدماغ بالاقتران — والسرير المخصّص للنوم وحده يبدأ باستدعاء النوم.',
    ),
  },
  {
    n: 6,
    title: L('The 20-minute rule', 'قاعدة العشرين دقيقة'),
    action: L(
      "If you're awake and frustrated for what feels like ~20 minutes, leave the bed. Sit in dim light, do something dull, return only when your eyes are heavy.",
      'إذا بقيت مستيقظًا منزعجًا لما يشبه ٢٠ دقيقة، فغادر السرير. اجلس في ضوء خافت، وافعل شيئًا مملًّا، ولا تعُد إلا حين تثقل عيناك.',
    ),
    why: L(
      'Lying awake teaches the brain that bed = wakefulness. Leaving breaks the association; sleepiness brings you back honestly.',
      'البقاء مستيقظًا في السرير يعلّم الدماغ أن السرير = يقظة. المغادرة تكسر هذا الاقتران، والنعاس يعيدك بصدق.',
    ),
    route: '/rescue',
  },
  {
    n: 7,
    title: L('Wind-down hour', 'ساعة التهدئة'),
    action: L(
      'Build a fixed last hour: lights dimmed, screens away or warm-filtered, one quiet routine (shower, reading, stretching) in the same order.',
      'ابنِ ساعة أخيرة ثابتة: أضواء خافتة، وشاشات بعيدة أو بمرشّح دافئ، وروتين هادئ واحد (استحمام، قراءة، تمدّد) بالترتيب نفسه.',
    ),
    why: L(
      'A repeated pre-sleep sequence becomes a conditioned cue — the routine itself starts making you sleepy.',
      'التسلسل المتكرّر قبل النوم يصبح إشارة شرطية — فالروتين نفسه يبدأ بجلب النعاس.',
    ),
  },
  {
    n: 8,
    title: L('Unload the mind — early', 'أفرِغ العقل مبكرًا'),
    action: L(
      'Two hours before bed, take 10 minutes with paper: dump every worry and tomorrow-task, and give each one a next step. Close the notebook with the day.',
      'قبل النوم بساعتين، خذ ١٠ دقائق مع ورقة: أفرِغ كل همّ ومهمة غد، واكتب لكلٍّ خطوة تالية. ثم أغلق الدفتر مع اليوم.',
    ),
    why: L(
      '"Constructive worry" (scheduled worry time) reliably reduces pre-sleep cognitive arousal in trials.',
      '«القلق البنّاء» (وقت قلق مجدوَل) يقلّل الاستثارة الذهنية قبل النوم بثبات في التجارب.',
    ),
    route: '/worry',
  },
  {
    n: 9,
    title: L('Body night', 'ليلة الجسد'),
    action: L(
      'In bed tonight, run one full body practice: muscle release or a slow body scan. Nothing else to achieve.',
      'في السرير الليلة، طبّق ممارسة جسدية كاملة واحدة: ترخية العضلات أو مسح الجسد البطيء. لا شيء آخر مطلوب.',
    ),
    why: L(
      'Relaxation therapies are "standard" treatments in AASM practice parameters for chronic insomnia.',
      'علاجات الاسترخاء علاجات «قياسية» في معايير الأكاديمية الأمريكية لطب النوم للأرق المزمن.',
    ),
    route: '/pmr',
  },
  {
    n: 10,
    title: L('Breath night', 'ليلة النفَس'),
    action: L(
      'Lights out, then ten slow 4·7·8 cycles — inhale 4, hold 7, exhale 8. If the mind wanders, return to counting.',
      'أطفئ الضوء ثم عشر دورات بطيئة ٤·٧·٨ — شهيق ٤، إمساك ٧، زفير ٨. إن شرد الذهن فعُد إلى العدّ.',
    ),
    why: L(
      'Long exhalations engage the parasympathetic system and slow the heart — the physiology of "safe to sleep".',
      'الزفير الطويل يشغّل الجهاز نظير الودّي ويبطّئ القلب — وهي فسيولوجيا «الأمان للنوم».',
    ),
    route: '/breathe',
  },
  {
    n: 11,
    title: L('Quiet the mind', 'تهدئة العقل'),
    action: L(
      'Tonight, replace trying-to-sleep with a cognitive tool: the shuffle, one neutral scene, or slow counting. Pick one and stay with it.',
      'الليلة، استبدل محاولةَ النوم بأداة ذهنية: الخلط الذهني، أو مشهد محايد واحد، أو عدّ بطيء. اختر واحدة والزمها.',
    ),
    why: L(
      'Racing thought blocks sleep onset; giving attention a boring, low-stakes task lets sleep arrive uninvited.',
      'التفكير المتسارع يمنع بدء النوم؛ ومنح الانتباه مهمة مملّة بلا رهانات يدَع النوم يصل دون دعوة.',
    ),
    route: '/shuffle',
  },
  {
    n: 12,
    title: L('Right-size the night', 'ضبط حجم الليل'),
    action: L(
      'Estimate honestly: how many hours do you actually SLEEP (not lie in bed)? Tonight go to bed only that many hours before your fixed wake time — not earlier. Never under 5½ hours.',
      'قدّر بصدق: كم ساعة تنامها فعلًا (لا التي تقضيها في السرير)؟ الليلة ادخل السرير قبل موعد استيقاظك الثابت بهذا القدر فقط — لا أبكر. ولا تنزل عن ٥ ساعات ونصف أبدًا.',
    ),
    why: L(
      'A gentle taste of sleep restriction — the most effective single CBT-I component: less time in bed compresses sleep and deepens it.',
      'لمسة لطيفة من تقييد النوم — أنجع مكوّن منفرد في العلاج: تقليل زمن السرير يضغط النوم ويعمّقه.',
    ),
  },
  {
    n: 13,
    title: L('Befriend the wobble', 'صادِق التعثّر'),
    action: L(
      "Expect a rough night sometimes — it isn't relapse, it's weather. Tonight, if sleep is slow, say: 'resting is enough' and stay with a calm practice instead of fighting.",
      'توقّع ليلة متعثّرة أحيانًا — ليست انتكاسة بل تقلّب جوّ. الليلة، إن تباطأ النوم فقل: «الراحة تكفي» والزم ممارسة هادئة بدل القتال.',
    ),
    why: L(
      'Cognitive restructuring: catastrophic beliefs about one bad night are themselves a driver of chronic insomnia.',
      'إعادة البناء المعرفي: الأفكار الكارثية عن ليلة سيئة واحدة هي نفسها من محرّكات الأرق المزمن.',
    ),
    route: '/paradox',
  },
  {
    n: 14,
    title: L('Your own protocol', 'بروتوكولك الخاص'),
    action: L(
      'Open your personal map and pick the 2–3 practices with your best record. Write your protocol: fixed wake time + wind-down hour + your top tools. That is your plan now.',
      'افتح خريطتك الشخصية واختر أفضل ممارستين أو ثلاث في سجلّك. اكتب بروتوكولك: موعد استيقاظ ثابت + ساعة تهدئة + أدواتك الأنجح. هذه خطتك الآن.',
    ),
    why: L(
      'Maintenance is personalised: what you measured on yourself beats any generic list. If insomnia persists most nights beyond a month, see a clinician for full CBT-I.',
      'الاستمرار شخصيّ: ما قسته على نفسك يتفوّق على أي قائمة عامة. وإن استمرّ الأرق معظم الليالي بعد شهر، فراجع مختصًّا لعلاجٍ كامل.',
    ),
    route: '/insights',
  },
];

export interface ProgramProgress {
  startedAt: string; // YYYY-MM-DD
  done: number[];
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function loadProgress(): Promise<ProgramProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(PROGRAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgramProgress;
    return typeof parsed?.startedAt === 'string' && Array.isArray(parsed?.done) ? parsed : null;
  } catch {
    return null;
  }
}

export async function startProgram(): Promise<ProgramProgress> {
  const fresh: ProgramProgress = { startedAt: todayKey(), done: [] };
  await AsyncStorage.setItem(PROGRAM_KEY, JSON.stringify(fresh)).catch(() => undefined);
  return fresh;
}

export async function markDone(progress: ProgramProgress, n: number): Promise<ProgramProgress> {
  const next: ProgramProgress = progress.done.includes(n)
    ? { ...progress, done: progress.done.filter((d) => d !== n) }
    : { ...progress, done: [...progress.done, n] };
  await AsyncStorage.setItem(PROGRAM_KEY, JSON.stringify(next)).catch(() => undefined);
  return next;
}

/** Highest night unlocked: one per calendar day since start (min 1, max 14). */
export function unlockedNights(progress: ProgramProgress): number {
  const start = new Date(`${progress.startedAt}T00:00:00`);
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.min(PROGRAM.length, days + 1));
}
