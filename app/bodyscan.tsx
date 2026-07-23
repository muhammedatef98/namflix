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

const STEP_MS = 11000;
const FADE_MS = 1400;
const KEEP_AWAKE_TAG = 'namflix-bodyscan';

// Toes-to-crown attention cues — no tensing, only soft noticing.
const CUES: Localized[] = [
  { en: 'Bring your attention to your toes. Just notice them… and let them soften.', ar: 'انقل انتباهك إلى أصابع قدميك. لاحظها فحسب… ودَعها تلين.' },
  { en: 'Your feet and ankles. Feel their weight sink into the bed.', ar: 'قدماك وكاحلاك. اشعر بثقلهما يغوص في السرير.' },
  { en: 'Your calves and shins. Warm, heavy, held.', ar: 'بطّتا ساقيك وقصبتاهما. دافئتان، ثقيلتان، مسنودتان.' },
  { en: 'Your knees and thighs. Nothing for them to do tonight.', ar: 'ركبتاك وفخذاك. لا شيء عليهما فعله الليلة.' },
  { en: 'Your hips and lower back. Let the mattress carry them completely.', ar: 'وركاك وأسفل ظهرك. دَع الفراش يحملهما تمامًا.' },
  { en: 'Your belly. Watch it rise and fall on its own.', ar: 'بطنك. راقبه يعلو ويهبط من تلقاء نفسه.' },
  { en: 'Your chest and heart. Each breath a little slower.', ar: 'صدرك وقلبك. كلّ نفَسٍ أبطأ قليلًا.' },
  { en: 'Your hands and fingers. Loose, open, resting.', ar: 'يداك وأصابعك. مرتخية، مفتوحة، مستريحة.' },
  { en: 'Your arms and shoulders. Let them drop away from your ears.', ar: 'ذراعاك وكتفاك. دَعهما يهبطان بعيدًا عن أذنيك.' },
  { en: 'Your neck and jaw. Unclench. Let the tongue rest.', ar: 'رقبتك وفكّك. أرخِهما. دَع اللسان يستريح.' },
  { en: 'Your eyes and forehead. Smooth, quiet, dim.', ar: 'عيناك وجبينك. ناعمان، ساكنان، معتمان.' },
  { en: 'Your whole body now — one warm, heavy shape. Rest here.', ar: 'جسدك كلّه الآن — كتلة واحدة دافئة ثقيلة. استرِح هنا.' },
];

export default function BodyScanScreen() {
  useRecordTool('bodyscan');
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
            <Text style={styles.stageHint}>{t('bodyscanHint')}</Text>
          </Pressable>
        ) : (
          <View style={styles.intro}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('bodyscanTitle')}</Text>
            <Text style={[styles.lead, isRTL && styles.textRTL]}>{t('bodyscanLead')}</Text>
            <Pressable style={[styles.startBtn, isRTL && styles.alignSelfEnd]} onPress={start}>
              <Text style={styles.startText}>{t('bodyscanStart')}</Text>
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
  cue: { color: '#FF3300', fontSize: 23, fontFamily: FONT.light, lineHeight: 37, textAlign: 'center' },
  stageHint: { position: 'absolute', bottom: 40, fontSize: 12, color: 'rgba(255,51,0,0.35)', lineHeight: 18 },
});
