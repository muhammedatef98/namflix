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

const STEP_MS = 7000;
const FADE_MS = 1000;
const KEEP_AWAKE_TAG = 'namflix-pmr';

// Foot-to-face muscle groups: tense, then release.
const CUES: Localized[] = [
  { en: 'Curl your toes tight… hold… and release.', ar: 'اقبض أصابع قدميك بقوّة… أمسِك… ثم أرخِها.' },
  { en: 'Tense your calves… hold… and let them go.', ar: 'شُدّ بطّتي ساقيك… أمسِك… ثم أطلِقهما.' },
  { en: 'Squeeze your thighs… hold… and soften.', ar: 'اضغط فخذيك… أمسِك… ثم ليّنهما.' },
  { en: 'Clench your hips and stomach… hold… release.', ar: 'اقبض وركيك وبطنك… أمسِك… ثم أرخِ.' },
  { en: 'Make fists with your hands… hold… and open.', ar: 'اقبض يديك… أمسِك… ثم افتحهما.' },
  { en: 'Tense your arms… hold… and let them fall heavy.', ar: 'شُدّ ذراعيك… أمسِك… ثم دَعهما يسقطان ثقيلين.' },
  { en: 'Lift your shoulders to your ears… hold… drop them.', ar: 'ارفع كتفيك نحو أذنيك… أمسِك… ثم أنزِلهما.' },
  { en: 'Scrunch your face tight… hold… and smooth it out.', ar: 'قطّب وجهك بشدّة… أمسِك… ثم افرِده.' },
  { en: 'Now your whole body, loose and heavy. Rest.', ar: 'الآن جسدك كلّه، رخوٌ وثقيل. استرِح.' },
];

export default function PmrScreen() {
  useRecordTool('pmr');
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
            <Text style={styles.stageHint}>{t('pmrHint')}</Text>
          </Pressable>
        ) : (
          <View style={styles.intro}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('pmrTitle')}</Text>
            <Text style={[styles.lead, isRTL && styles.textRTL]}>{t('pmrLead')}</Text>
            <Pressable style={[styles.startBtn, isRTL && styles.alignSelfEnd]} onPress={start}>
              <Text style={styles.startText}>{t('pmrStart')}</Text>
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
  cue: { color: '#FF3300', fontSize: 24, fontFamily: FONT.light, lineHeight: 38, textAlign: 'center' },
  stageHint: { position: 'absolute', bottom: 40, fontSize: 12, color: 'rgba(255,51,0,0.35)', lineHeight: 18 },
});
