import { useEffect, useRef, useState, useCallback } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import type { Localized } from '@/lib/i18n';
import { useRecordTool } from '@/hooks/useRecordTool';

const STEP_MS = 12000;
const FADE_MS = 1500;
const KEEP_AWAKE_TAG = 'namflix-autogenic';

// The classic Schultz sequence: heaviness → warmth → heart → breath →
// belly → cool forehead. Each phrase is repeated inwardly, slowly.
const CUES: Localized[] = [
  { en: 'Repeat inwardly, slowly: “My right arm is heavy.”', ar: 'ردّد في داخلك ببطء: «ذراعي اليمنى ثقيلة.»' },
  { en: '“My left arm is heavy. Both arms are heavy.”', ar: '«ذراعي اليسرى ثقيلة. كلتا ذراعيّ ثقيلتان.»' },
  { en: '“My legs are heavy. My whole body is pleasantly heavy.”', ar: '«ساقاي ثقيلتان. جسدي كلّه ثقيل ثقلًا مريحًا.»' },
  { en: '“My right arm is warm.”', ar: '«ذراعي اليمنى دافئة.»' },
  { en: '“My left arm is warm. Warmth flows through both arms.”', ar: '«ذراعي اليسرى دافئة. الدفء يسري في ذراعيّ.»' },
  { en: '“My legs are warm. My whole body is warm and soft.”', ar: '«ساقاي دافئتان. جسدي كلّه دافئ رخوٌ.»' },
  { en: '“My heartbeat is calm and regular.”', ar: '«نبض قلبي هادئ منتظم.»' },
  { en: '“My breathing is calm. It breathes me.”', ar: '«تنفّسي هادئ. يتنفّس من تلقاء نفسه.»' },
  { en: '“My belly is soft and warm.”', ar: '«بطني ليّن دافئ.»' },
  { en: '“My forehead is pleasantly cool.”', ar: '«جبيني بارد برودة لطيفة.»' },
  { en: 'Heavy, warm, calm, cool. Rest inside these words.', ar: 'ثقيل، دافئ، هادئ، بارد. استرِح داخل هذه الكلمات.' },
];

export default function AutogenicScreen() {
  useRecordTool('autogenic');
  const { t, tc, isRTL } = useLocale();
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const opacity = useSharedValue(0);

  const fade = useCallback(() => {
    opacity.value = withSequence(
      withTiming(0, { duration: FADE_MS / 2, easing: Easing.in(Easing.ease) }),
      withTiming(1, { duration: FADE_MS, easing: Easing.out(Easing.ease) }),
    );
  }, [opacity]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    opacity.value = withTiming(0, { duration: FADE_MS });
    void deactivateKeepAwake(KEEP_AWAKE_TAG);
  }, [opacity]);

  const start = useCallback(() => {
    setRunning(true);
    setIndex(0);
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    opacity.value = withTiming(1, { duration: FADE_MS });
    intervalRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= CUES.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return prev;
        }
        fade();
        return next;
      });
    }, STEP_MS);
  }, [opacity, fade]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, []);

  const cueStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <LinearGradient colors={[NightPalette.deepEmber, '#0A0000']} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <BackButton />
        {running ? (
          <Pressable style={styles.stage} onPress={stop}>
            <Animated.Text style={[styles.cue, cueStyle]}>{tc(CUES[index])}</Animated.Text>
            <Text style={styles.stageHint}>{t('autogenicHint')}</Text>
          </Pressable>
        ) : (
          <View style={styles.intro}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('autogenicTitle')}</Text>
            <Text style={[styles.lead, isRTL && styles.textRTL]}>{t('autogenicLead')}</Text>
            <Pressable style={[styles.startBtn, isRTL && styles.alignSelfEnd]} onPress={start}>
              <Text style={styles.startText}>{t('autogenicStart')}</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  alignSelfEnd: { alignSelf: 'flex-end' },
  intro: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
  title: { fontSize: 26, fontFamily: FONT.bold, lineHeight: 38, color: NightPalette.textPrimary },
  lead: { fontSize: 15, lineHeight: 25, color: NightPalette.dimText, marginTop: 16 },
  startBtn: {
    marginTop: 32,
    alignSelf: 'flex-start',
    paddingVertical: 15,
    paddingHorizontal: 34,
    borderRadius: 999,
    backgroundColor: NightPalette.amber,
  },
  startText: { color: NightPalette.voidBlack, fontSize: 15, fontFamily: FONT.bold, lineHeight: 22 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  cue: { color: '#FF3300', fontSize: 23, fontFamily: FONT.light, lineHeight: 38, textAlign: 'center' },
  stageHint: { position: 'absolute', bottom: 40, fontSize: 12, color: 'rgba(255,51,0,0.35)', lineHeight: 18 },
});
