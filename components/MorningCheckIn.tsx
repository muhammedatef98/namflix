import { useCallback, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NightPalette, FONT } from '@/constants/theme';
import {
  pendingCheckIn,
  rateNight,
  TOOL_LABEL,
  type NightRecord,
  type SleepRating,
} from '@/lib/nightTracking';

// Only greet in the morning-ish hours; late at night the card would be noise.
const SHOW_FROM_HOUR = 4;
const SHOW_UNTIL_HOUR = 16;

const OPTIONS: { rating: SleepRating; labelKey: string }[] = [
  { rating: 'easy', labelKey: 'checkinEasy' },
  { rating: 'slow', labelKey: 'checkinSlow' },
  { rating: 'hard', labelKey: 'checkinHard' },
];

/**
 * The morning check-in — one gentle question that powers the personal
 * "what works for me" map. Appears on Home only when last night has recorded
 * tool use and no rating yet.
 */
export function MorningCheckIn() {
  const { t, tc, isRTL } = useLocale();
  const { accent } = useTheme();
  const router = useRouter();
  const [night, setNight] = useState<NightRecord | null>(null);
  const [thanked, setThanked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const hour = new Date().getHours();
      if (hour < SHOW_FROM_HOUR || hour >= SHOW_UNTIL_HOUR) return;
      let alive = true;
      void pendingCheckIn().then((n) => alive && setNight(n));
      return () => {
        alive = false;
      };
    }, []),
  );

  if (!night) return null;

  const toolNames = night.tools
    .map((id) => (TOOL_LABEL[id] ? tc(TOOL_LABEL[id]) : id))
    .join(' · ');

  const choose = (rating: SleepRating) => {
    void rateNight(night.night, rating);
    setThanked(true);
  };

  if (thanked) {
    return (
      <Pressable
        style={[styles.card, { borderColor: accent }]}
        onPress={() => {
          setNight(null);
          setThanked(false);
          router.push('/insights');
        }}
      >
        <Text style={[styles.thanks, isRTL && styles.textRTL]}>{t('checkinThanks')}</Text>
        <Text style={[styles.thanksLink, { color: accent }, isRTL && styles.textRTL]}>
          {t('checkinSeeMap')}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={[styles.greeting, isRTL && styles.textRTL]}>{t('checkinGreeting')}</Text>
      <Text style={[styles.used, isRTL && styles.textRTL]} numberOfLines={2}>
        {t('checkinUsed')} {toolNames}
      </Text>
      <Text style={[styles.question, isRTL && styles.textRTL]}>{t('checkinQuestion')}</Text>
      <View style={[styles.options, isRTL && styles.rowRTL]}>
        {OPTIONS.map((o) => (
          <Pressable
            key={o.rating}
            onPress={() => choose(o.rating)}
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <Text style={styles.optionText}>{t(o.labelKey as never)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(74,26,10,0.5)',
    padding: 18,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  greeting: { color: '#F2C9A6', fontSize: 16, fontFamily: FONT.bold, lineHeight: 24 },
  used: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18, marginTop: 4 },
  question: { color: NightPalette.textPrimary, fontSize: 14, lineHeight: 22, marginTop: 12 },
  options: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  option: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.45)',
    backgroundColor: 'rgba(36,17,9,0.6)',
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  pressed: { opacity: 0.6 },
  optionText: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20 },
  thanks: { color: '#F2C9A6', fontSize: 14, lineHeight: 22 },
  thanksLink: { fontSize: 13, lineHeight: 20, marginTop: 6 },
});
