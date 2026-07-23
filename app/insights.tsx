import { useCallback, useState } from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import {
  toolStats,
  recentNights,
  TOOL_LABEL,
  type ToolStats,
  type NightRecord,
  type SleepRating,
} from '@/lib/nightTracking';

// Below this many rated nights a percentage would be noise, not signal.
const MIN_RATED_FOR_SCORE = 3;

const RATING_GLYPH: Record<SleepRating, string> = { easy: '●', slow: '◐', hard: '○' };
const RATING_COLOR: Record<SleepRating, string> = {
  easy: '#7FBF6A',
  slow: '#E0A84A',
  hard: '#C05A4A',
};

export default function InsightsScreen() {
  const { t, tc, isRTL, lang } = useLocale();
  const { accent } = useTheme();
  const [stats, setStats] = useState<ToolStats[]>([]);
  const [totalRated, setTotalRated] = useState(0);
  const [history, setHistory] = useState<NightRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void toolStats().then((r) => {
        if (!alive) return;
        setStats(r.stats);
        setTotalRated(r.totalRated);
      });
      void recentNights().then((n) => alive && setHistory(n));
      return () => {
        alive = false;
      };
    }, []),
  );

  const label = (toolId: string) => {
    const l = TOOL_LABEL[toolId];
    return l ? tc(l) : toolId;
  };

  const scored = stats.filter((s) => s.ratedNights >= MIN_RATED_FOR_SCORE);
  const gathering = stats.filter((s) => s.ratedNights < MIN_RATED_FOR_SCORE);

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('insightsTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('insightsSub')}</Text>

          {totalRated === 0 && (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('insightsEmpty')}</Text>
            </View>
          )}

          {scored.length > 0 && (
            <>
              <Text style={[styles.section, isRTL && styles.textRTL]}>{t('insightsWorks')}</Text>
              {scored.map((s) => (
                <View key={s.toolId} style={[styles.statCard, isRTL && styles.rowRTL]}>
                  <View style={styles.statText}>
                    <Text style={[styles.statName, isRTL && styles.textRTL]}>{label(s.toolId)}</Text>
                    <Text style={[styles.statMeta, isRTL && styles.textRTL]}>
                      {t('insightsNights')} {s.ratedNights}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.max(4, s.score)}%`, backgroundColor: accent },
                          isRTL && styles.barRTL,
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.score, { color: accent }]}>
                    {s.score}
                    <Text style={styles.scorePct}>%</Text>
                  </Text>
                </View>
              ))}
            </>
          )}

          {gathering.length > 0 && (
            <>
              <Text style={[styles.section, isRTL && styles.textRTL]}>{t('insightsGathering')}</Text>
              <View style={styles.gatherWrap}>
                {gathering.map((s) => (
                  <View key={s.toolId} style={styles.gatherChip}>
                    <Text style={styles.gatherText}>
                      {label(s.toolId)} · {s.ratedNights}/{MIN_RATED_FOR_SCORE}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {history.length > 0 && (
            <>
              <Text style={[styles.section, isRTL && styles.textRTL]}>{t('insightsHistory')}</Text>
              {history.map((n) => (
                <View key={n.night} style={[styles.nightRow, isRTL && styles.rowRTL]}>
                  <Text
                    style={[
                      styles.nightGlyph,
                      { color: n.rating ? RATING_COLOR[n.rating] : NightPalette.dimText },
                    ]}
                  >
                    {n.rating ? RATING_GLYPH[n.rating] : '·'}
                  </Text>
                  <View style={styles.nightText}>
                    <Text style={[styles.nightDate, isRTL && styles.textRTL]}>
                      {new Date(`${n.night}T12:00:00`).toLocaleDateString(
                        lang === 'ar' ? 'ar-EG' : 'en-GB',
                        { weekday: 'long', day: 'numeric', month: 'long' },
                      )}
                    </Text>
                    <Text style={[styles.nightTools, isRTL && styles.textRTL]} numberOfLines={1}>
                      {n.tools.map(label).join(' · ')}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <Text style={[styles.disclaimer, isRTL && styles.textRTL]}>{t('insightsHonesty')}</Text>
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
  section: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: NightPalette.amber,
    marginTop: 26,
    marginBottom: 12,
    lineHeight: 20,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  emptyBox: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.5)',
    padding: 18,
  },
  emptyText: { color: NightPalette.dimText, fontSize: 14, lineHeight: 23 },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    padding: 16,
    marginBottom: 12,
  },
  statText: { flex: 1 },
  statName: { color: NightPalette.textPrimary, fontSize: 15, lineHeight: 23 },
  statMeta: { color: NightPalette.dimText, fontSize: 11, marginTop: 1, lineHeight: 17 },
  barTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(140,42,18,0.25)',
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: { height: 5, borderRadius: 3 },
  barRTL: { alignSelf: 'flex-end' },
  score: { fontSize: 26, fontFamily: FONT.bold, lineHeight: 34 },
  scorePct: { fontSize: 13, fontFamily: FONT.regular },
  gatherWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gatherChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.35)',
    backgroundColor: 'rgba(36,17,9,0.5)',
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  gatherText: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18 },
  nightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(140,42,18,0.15)',
  },
  nightGlyph: { fontSize: 16, width: 18, textAlign: 'center' },
  nightText: { flex: 1 },
  nightDate: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20 },
  nightTools: { color: NightPalette.dimText, fontSize: 11, lineHeight: 17, marginTop: 1 },
  disclaimer: { color: NightPalette.dimText, fontSize: 11, lineHeight: 18, marginTop: 26, opacity: 0.8 },
});
