import { useCallback, useState } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import { useRecordTool } from '@/hooks/useRecordTool';
import {
  PROGRAM,
  loadProgress,
  startProgram,
  markDone,
  unlockedNights,
  type ProgramProgress,
} from '@/lib/program';

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const localNum = (n: number, ar: boolean) =>
  ar ? String(n).split('').map((d) => AR_DIGITS[Number(d)]).join('') : String(n);

function CheckGlyph({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path d="M4 12.5 L10 18 L20 6" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function ProgramScreen() {
  useRecordTool('program');
  const { t, tc, lang, isRTL } = useLocale();
  const { accent } = useTheme();
  const router = useRouter();
  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [openNight, setOpenNight] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void loadProgress().then((p) => {
        if (!alive) return;
        setProgress(p);
        setLoaded(true);
        if (p) setOpenNight(unlockedNights(p));
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const begin = async () => {
    const fresh = await startProgram();
    setProgress(fresh);
    setOpenNight(1);
  };

  const toggleDone = async (n: number) => {
    if (!progress) return;
    setProgress(await markDone(progress, n));
  };

  const unlocked = progress ? unlockedNights(progress) : 0;
  const ar = lang === 'ar';

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('programTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('programSub')}</Text>

          {loaded && !progress && (
            <View style={[styles.introCard, { borderColor: accent }]}>
              <Text style={[styles.introText, isRTL && styles.textRTL]}>{t('programIntro')}</Text>
              <Pressable
                onPress={begin}
                style={({ pressed }) => [styles.startBtn, { backgroundColor: accent }, pressed && styles.pressed]}
              >
                <Text style={styles.startText}>{t('programStart')}</Text>
              </Pressable>
            </View>
          )}

          {progress &&
            PROGRAM.map((night) => {
              const isUnlocked = night.n <= unlocked;
              const isDone = progress.done.includes(night.n);
              const isOpen = openNight === night.n;
              return (
                <Pressable
                  key={night.n}
                  disabled={!isUnlocked}
                  onPress={() => setOpenNight(isOpen ? null : night.n)}
                  style={[
                    styles.nightCard,
                    !isUnlocked && styles.lockedCard,
                    isOpen && { borderColor: accent },
                  ]}
                >
                  <View style={[styles.nightHead, isRTL && styles.rowRTL]}>
                    <View
                      style={[
                        styles.numBubble,
                        isDone && { backgroundColor: accent, borderColor: accent },
                      ]}
                    >
                      {isDone ? (
                        <CheckGlyph color={NightPalette.voidBlack} />
                      ) : (
                        <Text style={[styles.numText, !isUnlocked && styles.lockedText]}>
                          {localNum(night.n, ar)}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.nightTitle,
                        !isUnlocked && styles.lockedText,
                        isRTL && styles.textRTL,
                      ]}
                    >
                      {tc(night.title)}
                    </Text>
                  </View>

                  {isOpen && isUnlocked && (
                    <View style={styles.body}>
                      <Text style={[styles.action, isRTL && styles.textRTL]}>{tc(night.action)}</Text>
                      <Text style={[styles.why, isRTL && styles.textRTL]}>{tc(night.why)}</Text>
                      <View style={[styles.actions, isRTL && styles.rowRTL]}>
                        <Pressable
                          onPress={() => toggleDone(night.n)}
                          style={({ pressed }) => [
                            styles.doneBtn,
                            isDone && { backgroundColor: accent, borderColor: accent },
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text style={[styles.doneText, isDone && styles.doneTextOn]}>
                            {isDone ? t('programDone') : t('programMarkDone')}
                          </Text>
                        </Pressable>
                        {night.route && (
                          <Pressable
                            onPress={() => router.push(night.route as never)}
                            style={({ pressed }) => [styles.toolBtn, pressed && styles.pressed]}
                          >
                            <Text style={[styles.toolText, { color: accent }]}>{t('programOpenTool')}</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}

          {progress && unlocked < PROGRAM.length && (
            <Text style={[styles.pacing, isRTL && styles.textRTL]}>{t('programPacing')}</Text>
          )}
          <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t('programDisclaimer')}</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 26, paddingTop: 12, paddingBottom: 36 },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  pressed: { opacity: 0.7 },
  title: { fontSize: 26, fontFamily: FONT.bold, lineHeight: 38, color: NightPalette.textPrimary },
  sub: { fontSize: 13, lineHeight: 21, color: NightPalette.dimText, marginTop: 4, marginBottom: 20 },
  introCard: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(74,26,10,0.5)',
    padding: 20,
  },
  introText: { color: '#E0B896', fontSize: 14, lineHeight: 24 },
  startBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  startText: { color: NightPalette.voidBlack, fontSize: 14, fontFamily: FONT.bold, lineHeight: 21 },
  nightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    padding: 16,
    marginBottom: 12,
  },
  lockedCard: { opacity: 0.45 },
  nightHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: NightPalette.amber, fontSize: 13, fontFamily: FONT.bold, lineHeight: 19 },
  nightTitle: { flex: 1, color: NightPalette.textPrimary, fontSize: 15, lineHeight: 23 },
  lockedText: { color: NightPalette.dimText },
  body: { marginTop: 14 },
  action: { color: '#E0B896', fontSize: 14, lineHeight: 24 },
  why: { color: NightPalette.dimText, fontSize: 12, lineHeight: 20, marginTop: 10, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  doneBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  doneText: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20 },
  doneTextOn: { color: NightPalette.voidBlack, fontFamily: FONT.bold },
  toolBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  toolText: { fontSize: 13, lineHeight: 20 },
  pacing: { color: NightPalette.dimText, fontSize: 12, lineHeight: 19, marginTop: 8 },
  disclaimer: { color: NightPalette.dimText, fontSize: 11, lineHeight: 18, marginTop: 20, opacity: 0.8 },
});
