import { useState, useCallback } from 'react';
import { Text, View, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import type { Localized } from '@/lib/i18n';
import { useRecordTool } from '@/hooks/useRecordTool';

// Eyes-closed adaptation of 5-4-3-2-1 grounding, tuned for lying in the dark:
// hearing → touch → breath → whole body.
const SENSES: { count: number; prompt: Localized }[] = [
  { count: 4, prompt: { en: 'sounds you can hear, near or far', ar: 'أصوات تسمعها، قريبة أو بعيدة' } },
  { count: 3, prompt: { en: 'places your body touches the bed', ar: 'مواضع يلامس فيها جسدك السرير' } },
  { count: 2, prompt: { en: 'slow breaths you can feel moving', ar: 'نفَسان بطيئان تشعر بحركتهما' } },
  { count: 1, prompt: { en: 'feeling of your whole body, heavy and still', ar: 'إحساس بجسدك كلّه، ثقيلًا ساكنًا' } },
];

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const localDigit = (n: number, ar: boolean) => (ar ? AR_DIGITS[n] : String(n));

type Phase = 'intro' | 'running' | 'done';

export default function GroundingScreen() {
  useRecordTool('grounding');
  const { t, tc, lang, isRTL } = useLocale();
  const [phase, setPhase] = useState<Phase>('intro');
  const [senseIndex, setSenseIndex] = useState(0);
  const [remaining, setRemaining] = useState(SENSES[0].count);

  const start = useCallback(() => {
    setSenseIndex(0);
    setRemaining(SENSES[0].count);
    setPhase('running');
  }, []);

  const tap = useCallback(() => {
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (remaining > 1) {
      setRemaining(remaining - 1);
      return;
    }
    const next = senseIndex + 1;
    if (next >= SENSES.length) {
      setPhase('done');
      return;
    }
    setSenseIndex(next);
    setRemaining(SENSES[next].count);
  }, [remaining, senseIndex]);

  return (
    <LinearGradient colors={[NightPalette.deepEmber, '#0A0000']} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <BackButton />

        {phase === 'intro' && (
          <View style={styles.intro}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('groundTitle')}</Text>
            <Text style={[styles.lead, isRTL && styles.textRTL]}>{t('groundLead')}</Text>
            <Pressable style={[styles.startBtn, isRTL && styles.alignSelfEnd]} onPress={start}>
              <Text style={styles.startText}>{t('groundStart')}</Text>
            </Pressable>
          </View>
        )}

        {phase === 'running' && (
          <Pressable style={styles.stage} onPress={tap}>
            <Animated.View
              key={`${senseIndex}-${remaining}`}
              entering={FadeIn.duration(500)}
              style={styles.stageInner}
            >
              <Text style={styles.count}>{localDigit(remaining, lang === 'ar')}</Text>
              <Text style={styles.prompt}>{tc(SENSES[senseIndex].prompt)}</Text>
            </Animated.View>
            <Text style={styles.stageHint}>{t('groundTapHint')}</Text>
          </Pressable>
        )}

        {phase === 'done' && (
          <Animated.View entering={FadeIn.duration(700)} exiting={FadeOut} style={styles.stage}>
            <Text style={styles.doneTitle}>{t('groundDone')}</Text>
            <Text style={styles.doneSub}>{t('groundDoneSub')}</Text>
            <Pressable style={styles.againBtn} onPress={start}>
              <Text style={styles.againText}>{t('groundAgain')}</Text>
            </Pressable>
          </Animated.View>
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
  stageInner: { alignItems: 'center' },
  count: { color: '#FF3300', fontSize: 88, fontFamily: FONT.light, lineHeight: 110 },
  prompt: {
    color: NightPalette.textPrimary,
    fontSize: 18,
    fontFamily: FONT.light,
    lineHeight: 30,
    textAlign: 'center',
    marginTop: 8,
  },
  stageHint: { position: 'absolute', bottom: 40, fontSize: 12, color: 'rgba(255,51,0,0.35)', lineHeight: 18 },
  doneTitle: { color: '#FF3300', fontSize: 24, fontFamily: FONT.light, lineHeight: 38, textAlign: 'center' },
  doneSub: { color: NightPalette.dimText, fontSize: 14, lineHeight: 23, textAlign: 'center', marginTop: 12 },
  againBtn: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,51,0,0.4)',
  },
  againText: { color: NightPalette.textPrimary, fontSize: 14, lineHeight: 21 },
});
