import { useState, useCallback } from 'react';
import { Text, View, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { FONT } from '@/constants/theme';
import type { Localized } from '@/lib/i18n';
import { useRecordTool } from '@/hooks/useRecordTool';

/**
 * Night Rescue — the middle-of-the-night mode. Almost every sleep app is built
 * for falling asleep at bedtime; this screen is built for waking at 3 a.m.,
 * the most common insomnia complaint. It is the darkest surface in the app
 * (near-black, dim ember text, no starfield), opens with honest CBT-I-grounded
 * reassurance, then offers one short path per state — including real stimulus-
 * control guidance (Bootzin, 1972) that ambient-sound apps never ship.
 */

// Tap-through reassurance, one calm truth at a time.
const REASSURE: Localized[] = [
  {
    en: 'Waking at night is normal. Sleep runs in ~90-minute cycles, and even great sleepers surface between them.',
    ar: 'الاستيقاظ ليلًا طبيعي. النوم يجري في دورات نحو ٩٠ دقيقة، وحتى النائمون الممتازون يطفون بينها.',
  },
  {
    en: "Don't check the time. Clock-watching triggers mental arithmetic and frustration — the two things that keep you up.",
    ar: 'لا تنظر إلى الساعة. مراقبتها تُشعل حساب الوقت والانزعاج — وهما تحديدًا ما يُبقيك مستيقظًا.',
  },
  {
    en: 'You need to do nothing. Resting quietly in the dark still restores you — sleep returns when you stop chasing it.',
    ar: 'لا يلزمك فعل شيء. الراحة الهادئة في الظلام تجدّدك أيضًا — والنوم يعود حين تكفّ عن مطاردته.',
  },
];

type Path = {
  id: string;
  label: Localized;
  hint: Localized;
  route?: string;
};

const PATHS: Path[] = [
  {
    id: 'racing',
    label: { en: 'My mind is racing', ar: 'عقلي يتسابق' },
    hint: { en: 'scatter the thoughts', ar: 'بعثِر الأفكار' },
    route: '/shuffle',
  },
  {
    id: 'tense',
    label: { en: 'My body is tense or alert', ar: 'جسدي متوتر أو متيقّظ' },
    hint: { en: 'slow the breath', ar: 'أبطِئ النفَس' },
    route: '/breathe',
  },
  {
    id: 'sound',
    label: { en: 'I just want a quiet sound', ar: 'أريد صوتًا خافتًا فقط' },
    hint: { en: 'the lightest rain', ar: 'أخفّ درجات المطر' },
    route: '/player/rain-soft',
  },
  {
    id: 'long',
    label: { en: "I've been awake a while, frustrated", ar: 'مستيقظ منذ مدة، ومنزعج' },
    hint: { en: 'the 20-minute rule', ar: 'قاعدة العشرين دقيقة' },
  },
];

// Stimulus control for nocturnal awakenings — the piece sound apps never ship.
const STIMULUS_STEPS: Localized[] = [
  {
    en: 'If frustration has built, leave the bed. Sit somewhere else in dim light.',
    ar: 'إن تراكم الانزعاج، فغادر السرير. اجلس في مكان آخر في ضوء خافت.',
  },
  {
    en: 'Do something genuinely dull — no phone scrolling, no bright screens, no snacks.',
    ar: 'افعل شيئًا مملًّا حقًّا — لا تصفّح للهاتف، ولا شاشات ساطعة، ولا وجبات.',
  },
  {
    en: 'Return to bed only when your eyes feel heavy — not when you decide "it\'s time".',
    ar: 'عُد إلى السرير فقط حين تثقل عيناك — لا حين تقرّر أن «الوقت قد حان».',
  },
  {
    en: 'This trains your brain to link the bed with sleep, not with lying awake. It is a core piece of CBT-I (stimulus control, Bootzin 1972).',
    ar: 'هذا يدرّب دماغك على ربط السرير بالنوم لا بالسهر. وهو ركن أساسي في العلاج المعرفي السلوكي للأرق (التحكّم بالمثيرات، بوتزين ١٩٧٢).',
  },
];

type Phase = 'reassure' | 'paths' | 'stimulus';

export default function RescueScreen() {
  useRecordTool('rescue');
  const { t, tc, isRTL } = useLocale();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('reassure');
  const [line, setLine] = useState(0);

  const advance = useCallback(() => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (line + 1 < REASSURE.length) setLine(line + 1);
    else setPhase('paths');
  }, [line]);

  const choose = useCallback(
    (path: Path) => {
      if (path.route) router.push(path.route as never);
      else setPhase('stimulus');
    },
    [router],
  );

  return (
    <View style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <BackButton />

        {phase === 'reassure' && (
          <Pressable style={styles.stage} onPress={advance}>
            <Animated.Text key={line} entering={FadeIn.duration(700)} style={styles.reassure}>
              {tc(REASSURE[line])}
            </Animated.Text>
            <Text style={styles.tapHint}>{t('rescueTapHint')}</Text>
          </Pressable>
        )}

        {phase === 'paths' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.pathsWrap}>
            <Text style={[styles.pathsTitle, isRTL && styles.textRTL]}>{t('rescueAsk')}</Text>
            {PATHS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => choose(p)}
                style={({ pressed }) => [styles.pathBtn, isRTL && styles.rowRTL, pressed && styles.pressed]}
              >
                <View style={styles.pathText}>
                  <Text style={[styles.pathLabel, isRTL && styles.textRTL]}>{tc(p.label)}</Text>
                  <Text style={[styles.pathHint, isRTL && styles.textRTL]}>{tc(p.hint)}</Text>
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {phase === 'stimulus' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.pathsWrap}>
            <Text style={[styles.pathsTitle, isRTL && styles.textRTL]}>{t('rescueStimulusTitle')}</Text>
            {STIMULUS_STEPS.map((s, i) => (
              <View key={i} style={[styles.stepRow, isRTL && styles.rowRTL]}>
                <Text style={styles.stepDot}>·</Text>
                <Text style={[styles.stepText, isRTL && styles.textRTL]}>{tc(s)}</Text>
              </View>
            ))}
            <Pressable
              onPress={() => setPhase('paths')}
              style={({ pressed }) => [styles.backToPaths, isRTL && styles.alignSelfEnd, pressed && styles.pressed]}
            >
              <Text style={styles.backToPathsText}>{t('rescueOtherPaths')}</Text>
            </Pressable>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const EMBER_DIM = 'rgba(255,110,60,0.62)';
const EMBER_FAINT = 'rgba(255,110,60,0.30)';

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#020100' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  rowRTL: { flexDirection: 'row-reverse' },
  alignSelfEnd: { alignSelf: 'flex-end' },
  pressed: { opacity: 0.6 },

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  reassure: {
    color: EMBER_DIM,
    fontSize: 21,
    fontFamily: FONT.light,
    lineHeight: 36,
    textAlign: 'center',
  },
  tapHint: { position: 'absolute', bottom: 40, fontSize: 12, color: EMBER_FAINT, lineHeight: 18 },

  pathsWrap: { flex: 1, paddingHorizontal: 28, paddingTop: 18 },
  pathsTitle: {
    color: EMBER_DIM,
    fontSize: 20,
    fontFamily: FONT.light,
    lineHeight: 32,
    marginBottom: 22,
  },
  pathBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,110,60,0.18)',
    backgroundColor: 'rgba(255,110,60,0.045)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  pathText: { flex: 1 },
  pathLabel: { color: EMBER_DIM, fontSize: 16, lineHeight: 25 },
  pathHint: { color: EMBER_FAINT, fontSize: 12, marginTop: 2, lineHeight: 18 },

  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  stepDot: { color: EMBER_FAINT, fontSize: 16, lineHeight: 26 },
  stepText: { flex: 1, color: EMBER_DIM, fontSize: 15, lineHeight: 26 },
  backToPaths: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,110,60,0.3)',
  },
  backToPathsText: { color: EMBER_DIM, fontSize: 13, lineHeight: 20 },
});
