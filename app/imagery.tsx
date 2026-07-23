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
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { NightPalette, FONT } from '@/constants/theme';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { imageryScene } from '@/lib/dullContent';
import { useRecordTool } from '@/hooks/useRecordTool';

const LINE_MS = 11000; // each line lingers ~11s
const FADE_MS = 2200;
const KEEP_AWAKE_TAG = 'namflix-imagery';

export default function ImageryScreen() {
  useRecordTool('imagery');
  const router = useRouter();
  const { t, lang, isRTL } = useLocale();
  const scene = imageryScene(lang);
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const opacity = useSharedValue(0);

  const fadeSwap = useCallback(() => {
    opacity.value = withSequence(
      withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.ease) }),
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
        if (next >= scene.length) {
          // Hold on the final line; the scene has settled.
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return prev;
        }
        fadeSwap();
        return next;
      });
    }, LINE_MS);
  }, [fadeSwap, opacity, scene.length]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, []);

  const lineStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <LinearGradient colors={[NightPalette.deepEmber, '#0A0000']} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <BackButton />

        {running ? (
          <Pressable style={styles.stage} onPress={stop}>
            <Animated.Text style={[styles.line, lineStyle]}>{scene[index]}</Animated.Text>
            <Text style={styles.stageHint}>{t('imageryHint')}</Text>
          </Pressable>
        ) : (
          <View style={styles.intro}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('imageryTitle')}</Text>
            <Text style={[styles.lead, isRTL && styles.textRTL]}>{t('imageryLead')}</Text>

            <Pressable style={[styles.startBtn, isRTL && styles.alignSelfEnd]} onPress={start}>
              <Text style={styles.startText}>{t('imageryStart')}</Text>
            </Pressable>

            <View style={styles.science}>
              <Text style={[styles.scienceLabel, isRTL && styles.textRTL]}>{t('whyThisWorks')}</Text>
              <Text style={[styles.scienceBody, isRTL && styles.textRTL]}>{t('imageryScience')}</Text>
              <Text style={[styles.scienceBasis, isRTL && styles.textRTL]}>{t('imageryBasis')}</Text>
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
  alignSelfEnd: { alignSelf: 'flex-end' },

  intro: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
  title: { fontSize: 26, fontFamily: FONT.light, color: NightPalette.textPrimary },
  lead: { fontSize: 15, lineHeight: 24, color: NightPalette.dimText, marginTop: 16 },
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

  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  line: {
    fontSize: 24,
    fontFamily: FONT.light,
    lineHeight: 36,
    color: RED,
    textAlign: 'center',
  },
  stageHint: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,

    color: 'rgba(255,51,0,0.35)',
  },
});
