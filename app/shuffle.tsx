import { useEffect, useRef, useState, useCallback } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { NightPalette, FONT } from '@/constants/theme';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { nextShuffleWord } from '@/lib/dullContent';
import { useRecordTool } from '@/hooks/useRecordTool';

const WORD_MS = 9000; // how long each image lingers before the next
const FADE_MS = 1400;
const KEEP_AWAKE_TAG = 'namflix-shuffle';

export default function ShuffleScreen() {
  useRecordTool('shuffle');
  const router = useRouter();
  const { t, lang, isRTL } = useLocale();
  const [running, setRunning] = useState(false);
  const [word, setWord] = useState<string>('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opacity = useSharedValue(0);
  const dot = useSharedValue(0.4);

  const showWord = useCallback(
    (next: string) => {
      setWord(next);
      opacity.value = withSequence(
        withTiming(0, { duration: FADE_MS / 2, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: FADE_MS, easing: Easing.out(Easing.ease) }),
      );
    },
    [opacity],
  );

  const advance = useCallback(() => {
    setWord((prev) => {
      const next = nextShuffleWord(lang, prev || null);
      opacity.value = withSequence(
        withTiming(0, { duration: FADE_MS / 2, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: FADE_MS, easing: Easing.out(Easing.ease) }),
      );
      return next;
    });
  }, [opacity, lang]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    opacity.value = withTiming(0, { duration: FADE_MS });
    void deactivateKeepAwake(KEEP_AWAKE_TAG);
  }, [opacity]);

  const start = useCallback(() => {
    setRunning(true);
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    dot.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    showWord(nextShuffleWord(lang, null));
    intervalRef.current = setInterval(advance, WORD_MS);
  }, [advance, dot, showWord, lang]);

  // Clean up timers + keep-awake on unmount.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, []);

  const wordStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: dot.value }));

  return (
    <LinearGradient colors={[NightPalette.deepEmber, '#0A0000']} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <BackButton />

        {running ? (
          <Pressable style={styles.stage} onPress={stop}>
            <Animated.Text style={[styles.word, wordStyle]}>{word}</Animated.Text>
            <Animated.View style={[styles.dot, dotStyle]} />
            <Text style={styles.stageHint}>{t('shuffleHint')}</Text>
          </Pressable>
        ) : (
          <View style={styles.intro}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('shuffleTitle')}</Text>
            <Text style={[styles.lead, isRTL && styles.textRTL]}>{t('shuffleLead')}</Text>
            <View style={[styles.rules, isRTL && styles.alignEnd]}>
              <Text style={[styles.rule, isRTL && styles.textRTL]}>· {t('shuffleRule1')}</Text>
              <Text style={[styles.rule, isRTL && styles.textRTL]}>· {t('shuffleRule2')}</Text>
              <Text style={[styles.rule, isRTL && styles.textRTL]}>· {t('shuffleRule3')}</Text>
            </View>

            <Pressable style={[styles.startBtn, isRTL && styles.alignSelfEnd]} onPress={start}>
              <Text style={styles.startText}>{t('shuffleStart')}</Text>
            </Pressable>

            <View style={styles.science}>
              <Text style={[styles.scienceLabel, isRTL && styles.textRTL]}>{t('whyThisWorks')}</Text>
              <Text style={[styles.scienceBody, isRTL && styles.textRTL]}>{t('shuffleScience')}</Text>
              <Text style={[styles.scienceBasis, isRTL && styles.textRTL]}>{t('shuffleBasis')}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const RED = '#FF3300';

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { paddingHorizontal: 24, paddingTop: 8, alignSelf: 'flex-start' },
  backRTL: { alignSelf: 'flex-end' },
  backText: { color: NightPalette.textPrimary, fontSize: 16 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  alignEnd: { alignItems: 'flex-end' },
  alignSelfEnd: { alignSelf: 'flex-end' },

  intro: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
  title: {
    fontSize: 26,
    fontFamily: FONT.light,

    color: NightPalette.textPrimary,
  },
  lead: { fontSize: 15, lineHeight: 24, color: NightPalette.dimText, marginTop: 16 },
  rules: { marginTop: 22, gap: 8 },
  rule: { fontSize: 13, lineHeight: 19, color: NightPalette.textPrimary },
  startBtn: {
    marginTop: 32,
    alignSelf: 'flex-start',
    paddingVertical: 15,
    paddingHorizontal: 34,
    borderRadius: 999,
    backgroundColor: NightPalette.amber,
  },
  startText: { color: NightPalette.voidBlack, fontSize: 15, fontFamily: FONT.bold,},
  science: {
    marginTop: 'auto',
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(140,42,18,0.2)',
    paddingTop: 16,
  },
  scienceLabel: { color: NightPalette.amber, fontSize: 11,},
  scienceBody: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20, marginTop: 10 },
  scienceBasis: {
    color: NightPalette.dimText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
    fontStyle: 'italic',
  },

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  word: {
    fontSize: 40,
    fontFamily: FONT.light,

    color: RED,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: RED, marginTop: 48 },
  stageHint: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,

    color: 'rgba(255,51,0,0.35)',
  },
});
