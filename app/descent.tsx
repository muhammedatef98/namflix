import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { NightPalette, FONT } from '@/constants/theme';
import { buildSequence, stepLines, TONIGHT_STATES, type DescentStep } from '@/lib/descent';
import { nextShuffleWord, imageryScene } from '@/lib/dullContent';
import { useRecordTool } from '@/hooks/useRecordTool';

const KEEP_AWAKE_TAG = 'namflix-descent';
type Phase = 'intro' | 'running' | 'done';
type Breath = 'in' | 'hold' | 'out';

// A dozen fixed faint stars — atmosphere without per-frame work.
const STARS = [
  [12, 14], [78, 9], [44, 22], [88, 34], [22, 40], [64, 30],
  [8, 58], [92, 62], [34, 72], [70, 80], [50, 52], [18, 88],
] as const;

function buzz(soft = false) {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(
    soft ? Haptics.ImpactFeedbackStyle.Soft : Haptics.ImpactFeedbackStyle.Light,
  ).catch(() => undefined);
}

export default function DescentScreen() {
  useRecordTool('descent');
  const router = useRouter();
  const { t, tc, lang, isRTL } = useLocale();

  const [phase, setPhase] = useState<Phase>('intro');
  const [stateId, setStateId] = useState<string>(TONIGHT_STATES[0].id);
  const [sequence, setSequence] = useState<DescentStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [beat, setBeat] = useState('');
  const [breath, setBreath] = useState<Breath | null>(null);

  const dim = useSharedValue(0.1);
  const halo = useSharedValue(1);
  const textOpacity = useSharedValue(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervals = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    intervals.current.forEach(clearInterval);
    timers.current = [];
    intervals.current = [];
  }, []);

  const fadeInBeat = useCallback(
    (text: string) => {
      setBeat(text);
      textOpacity.value = withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) }),
      );
    },
    [textOpacity],
  );

  const begin = useCallback(() => {
    const seq = buildSequence(stateId);
    setSequence(seq);
    setStepIndex(0);
    setPhase('running');
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
  }, [stateId]);

  const end = useCallback(() => {
    clearAll();
    void deactivateKeepAwake(KEEP_AWAKE_TAG);
    router.back();
  }, [clearAll, router]);

  // The engine: one effect per step. Sets up that step's beats / breath and a
  // master timeout that advances (or finishes) when the step's time is up.
  useEffect(() => {
    if (phase !== 'running') return;
    const step = sequence[stepIndex];
    if (!step) {
      clearAll();
      dim.value = withTiming(0.95, { duration: 3000 });
      setBreath(null);
      setPhase('done');
      return;
    }

    const total = sequence.length;
    const target = total > 1 ? 0.12 + 0.82 * (stepIndex / (total - 1)) : 0.5;
    dim.value = withTiming(target, { duration: 2500, easing: Easing.inOut(Easing.ease) });

    if (step.type === 'breathe' && step.breathe) {
      setBreath('in');
      halo.value = 1;
      const { inhale, hold, exhale } = step.breathe;

      const runCycle = () => {
        setBreath('in');
        buzz();
        halo.value = withTiming(1.9, { duration: inhale * 1000, easing: Easing.inOut(Easing.ease) });
        const toExhale = () => {
          setBreath('out');
          buzz(true);
          halo.value = withTiming(1, { duration: exhale * 1000, easing: Easing.inOut(Easing.ease) });
          timers.current.push(setTimeout(runCycle, exhale * 1000));
        };
        timers.current.push(
          setTimeout(() => {
            if (hold > 0) {
              setBreath('hold');
              timers.current.push(setTimeout(toExhale, hold * 1000));
            } else {
              toExhale();
            }
          }, inhale * 1000),
        );
      };
      runCycle();
    } else {
      setBreath(null);
      // Choose the beat source for this step.
      let getNext: (prev: string) => string;
      let finite: string[] | null = null;
      if (step.type === 'shuffle') {
        getNext = (prev) => nextShuffleWord(lang, prev || null);
      } else if (step.type === 'imagery') {
        finite = imageryScene(lang);
      } else {
        finite = stepLines(step, lang);
      }

      const beatMs =
        step.type === 'shuffle'
          ? 8500
          : finite && finite.length > 0
            ? Math.max(4500, Math.floor((step.durationSec * 1000) / finite.length))
            : 6000;

      let i = 0;
      const first = finite ? finite[0] : getNext!('');
      fadeInBeat(first);

      const id = setInterval(() => {
        if (finite) {
          i += 1;
          if (i >= finite.length) {
            clearInterval(id); // hold on the last line
            return;
          }
          fadeInBeat(finite[i]);
        } else {
          setBeat((prev) => {
            const nxt = getNext(prev);
            textOpacity.value = withSequence(
              withTiming(0, { duration: 300 }),
              withTiming(1, { duration: 1000 }),
            );
            return nxt;
          });
        }
      }, beatMs);
      intervals.current.push(id);
    }

    timers.current.push(
      setTimeout(() => {
        clearAll();
        setStepIndex((n) => n + 1);
      }, step.durationSec * 1000),
    );

    return clearAll;
  }, [phase, stepIndex, sequence, lang, clearAll, dim, halo, textOpacity, fadeInBeat]);

  useEffect(() => {
    return () => {
      clearAll();
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [clearAll]);

  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.value }));
  const haloStyle = useAnimatedStyle(() => ({ transform: [{ scale: halo.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  const breathLabel = breath === 'in' ? t('bIn') : breath === 'hold' ? t('bHold') : t('bOut');
  const step = sequence[stepIndex];
  const selectedState = TONIGHT_STATES.find((s) => s.id === stateId);

  return (
    <LinearGradient colors={[NightPalette.deepEmber, '#0A0000']} style={styles.fill}>
      {/* faint starfield */}
      {STARS.map(([x, y], i) => (
        <View key={i} style={[styles.star, { left: `${x}%`, top: `${y}%` }]} />
      ))}
      {/* the descending darkness */}
      <Animated.View pointerEvents="none" style={[styles.dimLayer, dimStyle]} />

      <SafeAreaView style={styles.fill}>
        {phase === 'intro' && (
          <ScrollView
            style={styles.intro}
            contentContainerStyle={styles.introContent}
            showsVerticalScrollIndicator={false}
          >
            <BackButton />
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('descentTitle')}</Text>
            <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('descentSub')}</Text>

            <Text style={[styles.question, isRTL && styles.textRTL]}>{t('descentQuestion')}</Text>
            <View style={styles.states}>
              {TONIGHT_STATES.map((s) => {
                const on = s.id === stateId;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setStateId(s.id)}
                    style={[styles.state, on && styles.stateOn, isRTL && styles.stateRTL]}
                  >
                    <Text style={[styles.stateLabel, on && styles.stateLabelOn, isRTL && styles.textRTL]}>
                      {tc(s.label)}
                    </Text>
                    <Text style={[styles.stateHint, isRTL && styles.textRTL]}>{tc(s.hint)}</Text>
                  </Pressable>
                );
              })}
            </View>

            {selectedState && (
              <View style={styles.rationale}>
                <Text style={[styles.rationaleLabel, isRTL && styles.textRTL]}>{t('descentWhy')}</Text>
                <Text style={[styles.rationaleText, isRTL && styles.textRTL]}>{tc(selectedState.rationale)}</Text>
              </View>
            )}

            <Pressable style={styles.beginBtn} onPress={begin}>
              <Text style={styles.beginText}>{t('descentBegin')}</Text>
            </Pressable>
            <Text style={styles.hapticHint}>{t('descentHaptics')}</Text>
          </ScrollView>
        )}

        {phase === 'running' && (
          <Pressable style={styles.stage} onPress={end}>
            <View style={styles.progress}>
              {sequence.map((_, i) => (
                <View key={i} style={[styles.pip, i <= stepIndex && styles.pipOn]} />
              ))}
            </View>

            {step && <Text style={styles.stepTitle}>{tc(step.title)}</Text>}

            <View style={styles.centerArea}>
              {breath ? (
                <>
                  <Animated.View style={[styles.halo, haloStyle]} />
                  <Text style={styles.breathLabel}>{breathLabel}</Text>
                </>
              ) : (
                <Animated.Text style={[styles.beat, isRTL && styles.beatRTL, textStyle]}>
                  {beat}
                </Animated.Text>
              )}
            </View>

            <Text style={styles.stageHint}>{t('descentHint')}</Text>
          </Pressable>
        )}

        {phase === 'done' && (
          <View style={styles.done}>
            <Text style={styles.doneTitle}>{t('descentDoneTitle')}</Text>
            <Text style={[styles.doneSub, isRTL && styles.textRTL]}>{t('descentDoneSub')}</Text>
            <Pressable
              style={styles.doneBtn}
              onPress={() => router.replace({ pathname: '/player/[id]', params: { id: 'rain-soft' } })}
            >
              <Text style={styles.doneBtnText}>{t('descentKeepSound')}</Text>
            </Pressable>
            <Pressable style={styles.doneGhost} onPress={() => router.back()}>
              <Text style={styles.doneGhostText}>{t('descentSilence')}</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const RED = '#FF3300';
const EMBER = '#C97A4A';

const styles = StyleSheet.create({
  fill: { flex: 1 },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(217,139,90,0.5)' },
  dimLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },

  // intro
  intro: { flex: 1, paddingHorizontal: 28, paddingTop: 20 },
  introContent: { paddingBottom: 48 },
  title: { fontSize: 30, fontFamily: FONT.bold, lineHeight: 44, color: NightPalette.textPrimary },
  sub: { fontSize: 14, lineHeight: 22, color: NightPalette.dimText, marginTop: 10 },
  question: { fontSize: 13, lineHeight: 20, color: NightPalette.amber, marginTop: 30, marginBottom: 14 },
  states: { gap: 10 },
  state: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.5)',
  },
  stateRTL: { alignItems: 'flex-end' },
  stateOn: { borderColor: NightPalette.amber, backgroundColor: 'rgba(74,26,10,0.6)' },
  stateLabel: { color: NightPalette.textPrimary, fontSize: 16, lineHeight: 24 },
  stateLabelOn: { color: '#F2C9A6', fontFamily: FONT.bold },
  stateHint: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18, marginTop: 2 },
  rationale: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(36,17,9,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.28)',
  },
  rationaleLabel: { color: NightPalette.amber, fontSize: 11, marginBottom: 8, lineHeight: 16 },
  rationaleText: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 21 },
  beginBtn: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 999,
    backgroundColor: NightPalette.amber,
  },
  beginText: { color: NightPalette.voidBlack, fontSize: 16, fontFamily: FONT.bold, lineHeight: 24 },
  hapticHint: { textAlign: 'center', color: NightPalette.dimText, fontSize: 11, lineHeight: 17, marginTop: 14 },

  // running
  stage: { flex: 1, alignItems: 'center', paddingTop: 20 },
  progress: { flexDirection: 'row', gap: 8, marginTop: 8 },
  pip: { width: 22, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,51,0,0.18)' },
  pipOn: { backgroundColor: 'rgba(255,51,0,0.6)' },
  stepTitle: { color: EMBER, fontSize: 13, lineHeight: 20, marginTop: 26, textTransform: 'uppercase' },
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  halo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: 'rgba(255,51,0,0.5)',
    backgroundColor: 'rgba(255,51,0,0.06)',
  },
  breathLabel: { color: RED, fontSize: 22, lineHeight: 34, fontFamily: FONT.light, marginTop: 40 },
  beat: { color: EMBER, fontSize: 24, fontFamily: FONT.light, lineHeight: 38, textAlign: 'center' },
  beatRTL: { writingDirection: 'rtl' },
  stageHint: { color: 'rgba(255,51,0,0.3)', fontSize: 12, lineHeight: 18, marginBottom: 34 },

  // done
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  doneTitle: { color: EMBER, fontSize: 24, lineHeight: 36, fontFamily: FONT.bold },
  doneSub: { color: NightPalette.dimText, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 14, marginBottom: 30 },
  doneBtn: { backgroundColor: 'rgba(74,26,10,0.7)', borderWidth: 1, borderColor: 'rgba(194,78,26,0.5)', borderRadius: 999, paddingVertical: 15, paddingHorizontal: 40 },
  doneBtnText: { color: '#F2C9A6', fontSize: 15, fontFamily: FONT.bold },
  doneGhost: { marginTop: 16, paddingVertical: 10 },
  doneGhostText: { color: NightPalette.dimText, fontSize: 14 },
});
