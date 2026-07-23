import { useCallback, useState } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import { useRecordTool } from '@/hooks/useRecordTool';

/**
 * Sleep-window calculator — an interactive taste of Sleep Restriction Therapy
 * (Spielman et al., 1987), the single most effective CBT-I component.
 * Principle: time in bed should match time actually slept, so sleep pressure
 * consolidates the night. The window is anchored to the FIXED wake time and
 * never allowed below the clinical floor of 5.5 hours.
 */

const STORE_KEY = 'namflix.window';
const MIN_WINDOW_H = 5.5;
const SLEEP_CHOICES = [5.5, 6, 6.5, 7, 7.5, 8, 8.5];
const WAKE_HOURS = [4, 5, 6, 7, 8, 9, 10, 11];
const WAKE_MINUTES = [0, 15, 30, 45];

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const arNum = (s: string) => s.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);

interface WindowSettings {
  sleepHours: number;
  wakeHour: number;
  wakeMinute: number;
}

const DEFAULTS: WindowSettings = { sleepHours: 7, wakeHour: 7, wakeMinute: 0 };

function formatClock(totalMinutes: number, ar: boolean): string {
  const mins = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = ar ? (h24 < 12 ? 'ص' : 'م') : h24 < 12 ? 'AM' : 'PM';
  const raw = `${h12}:${String(m).padStart(2, '0')}`;
  return `${ar ? arNum(raw) : raw} ${suffix}`;
}

export default function WindowScreen() {
  useRecordTool('window');
  const { t, isRTL, lang } = useLocale();
  const { accent } = useTheme();
  const [settings, setSettings] = useState<WindowSettings>(DEFAULTS);
  const ar = lang === 'ar';

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      AsyncStorage.getItem(STORE_KEY)
        .then((raw) => {
          if (!raw || !alive) return;
          const parsed = JSON.parse(raw) as WindowSettings;
          if (typeof parsed?.sleepHours === 'number') setSettings(parsed);
        })
        .catch(() => undefined);
      return () => {
        alive = false;
      };
    }, []),
  );

  const update = (next: WindowSettings) => {
    setSettings(next);
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => undefined);
  };

  const windowH = Math.max(MIN_WINDOW_H, settings.sleepHours);
  const wakeMins = settings.wakeHour * 60 + settings.wakeMinute;
  const bedMins = wakeMins - windowH * 60;

  const hourLabel = (h: number) => {
    const raw = h === Math.floor(h) ? String(h) : String(h);
    return ar ? arNum(raw) : raw;
  };

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('windowTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('windowSub')}</Text>

          {/* Q1: actual sleep */}
          <Text style={[styles.q, isRTL && styles.textRTL]}>{t('windowQ1')}</Text>
          <View style={[styles.chips, isRTL && styles.rowRTL]}>
            {SLEEP_CHOICES.map((h) => {
              const on = settings.sleepHours === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => update({ ...settings, sleepHours: h })}
                  style={[styles.chip, on && { backgroundColor: accent, borderColor: accent }]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{hourLabel(h)}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Q2: fixed wake time */}
          <Text style={[styles.q, isRTL && styles.textRTL]}>{t('windowQ2')}</Text>
          <View style={[styles.chips, isRTL && styles.rowRTL]}>
            {WAKE_HOURS.map((h) => {
              const on = settings.wakeHour === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => update({ ...settings, wakeHour: h })}
                  style={[styles.chip, on && { backgroundColor: accent, borderColor: accent }]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {formatClock(h * 60, ar).split(' ')[0].split(':')[0]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.chips, isRTL && styles.rowRTL]}>
            {WAKE_MINUTES.map((m) => {
              const on = settings.wakeMinute === m;
              const label = `:${String(m).padStart(2, '0')}`;
              return (
                <Pressable
                  key={m}
                  onPress={() => update({ ...settings, wakeMinute: m })}
                  style={[styles.chip, on && { backgroundColor: accent, borderColor: accent }]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{ar ? arNum(label) : label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Result */}
          <View style={[styles.result, { borderColor: accent }]}>
            <Text style={[styles.resultLabel, isRTL && styles.textRTL]}>{t('windowResult')}</Text>
            <View style={[styles.timesRow, isRTL && styles.rowRTL]}>
              <View style={styles.timeBox}>
                <Text style={styles.timeCaption}>{t('windowBed')}</Text>
                <Text style={[styles.timeValue, { color: accent }]}>{formatClock(bedMins, ar)}</Text>
              </View>
              <Text style={styles.timeArrow}>{isRTL ? '←' : '→'}</Text>
              <View style={styles.timeBox}>
                <Text style={styles.timeCaption}>{t('windowWake')}</Text>
                <Text style={[styles.timeValue, { color: accent }]}>{formatClock(wakeMins, ar)}</Text>
              </View>
            </View>
            <Text style={[styles.resultNote, isRTL && styles.textRTL]}>{t('windowNotEarlier')}</Text>
          </View>

          {/* Weekly adjustment rules */}
          <Text style={[styles.rulesTitle, isRTL && styles.textRTL]}>{t('windowRulesTitle')}</Text>
          <Text style={[styles.rule, isRTL && styles.textRTL]}>{t('windowRule1')}</Text>
          <Text style={[styles.rule, isRTL && styles.textRTL]}>{t('windowRule2')}</Text>
          <Text style={[styles.rule, isRTL && styles.textRTL]}>{t('windowRule3')}</Text>

          <Text style={[styles.evidence, isRTL && styles.textRTL]}>{t('windowEvidence')}</Text>
          <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t('windowDisclaimer')}</Text>
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
  title: { fontSize: 26, fontFamily: FONT.bold, lineHeight: 38, color: NightPalette.textPrimary },
  sub: { fontSize: 13, lineHeight: 21, color: NightPalette.dimText, marginTop: 4 },
  q: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#F2C9A6',
    marginTop: 24,
    marginBottom: 10,
    lineHeight: 22,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  chipText: { color: NightPalette.dimText, fontSize: 14, lineHeight: 21 },
  chipTextOn: { color: NightPalette.voidBlack, fontFamily: FONT.bold },
  result: {
    marginTop: 26,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: 'rgba(74,26,10,0.5)',
    padding: 20,
  },
  resultLabel: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18 },
  timesRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  timeBox: { flex: 1 },
  timeCaption: { color: NightPalette.dimText, fontSize: 11, lineHeight: 17, textAlign: 'center' },
  timeValue: { fontSize: 24, fontFamily: FONT.bold, lineHeight: 34, textAlign: 'center', marginTop: 2 },
  timeArrow: { color: NightPalette.dimText, fontSize: 18 },
  resultNote: { color: '#E0B896', fontSize: 12, lineHeight: 19, marginTop: 12, textAlign: 'center' },
  rulesTitle: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: NightPalette.amber,
    marginTop: 26,
    marginBottom: 10,
    lineHeight: 20,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  rule: { color: '#E0B896', fontSize: 13, lineHeight: 22, marginBottom: 8 },
  evidence: { color: NightPalette.dimText, fontSize: 12, lineHeight: 20, marginTop: 14, fontStyle: 'italic' },
  disclaimer: { color: NightPalette.dimText, fontSize: 11, lineHeight: 18, marginTop: 14, opacity: 0.8 },
});
