import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useLocale } from '@/contexts/LocaleContext';
import { useFeatureGate } from '@/contexts/PremiumContext';
import { NightPalette } from '@/constants/theme';
import { ScienceNote } from '@/components/ScienceNote';
import type { DullActivity } from '@/lib/dullContent';

/**
 * One wind-down activity in the Boring-on-Purpose hub. Routes to its own
 * interactive screen and carries a tap-to-expand science note. Bilingual.
 */
export function DullCard({ item }: { item: DullActivity }) {
  const { open, isLocked } = useFeatureGate();
  const { tc, isRTL } = useLocale();
  const locked = isLocked(item.route);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => open(item.route)}
        style={({ pressed }) => [
          styles.main,
          isRTL && styles.mainRTL,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.glyph}>
          <Text style={styles.glyphText}>◐</Text>
        </View>
        <View style={styles.text}>
          <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={1}>
            {tc(item.title)}
          </Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]} numberOfLines={2}>
            {tc(item.subtitle)}
          </Text>
        </View>
        {locked && (
          <View style={styles.lock}>
            <Svg width={13} height={13} viewBox="0 0 24 24">
              <Path
                d="M7 10 V7 a5 5 0 0 1 10 0 V10"
                stroke={NightPalette.dimText}
                strokeWidth={2.2}
                strokeLinecap="round"
                fill="none"
              />
              <Rect x="5" y="10" width="14" height="10" rx="2.5" fill={NightPalette.dimText} />
            </Svg>
          </View>
        )}
      </Pressable>
      <View style={styles.notePad}>
        <ScienceNote science={tc(item.science)} basis={tc(item.basis)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(36,17,9,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    overflow: 'hidden',
  },
  main: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 18 },
  mainRTL: { flexDirection: 'row-reverse' },
  pressed: { opacity: 0.7 },
  glyph: { width: 34, alignItems: 'center', marginHorizontal: 14 },
  glyphText: { color: NightPalette.amber, fontSize: 20 },
  text: { flex: 1 },
  lock: { marginStart: 12, opacity: 0.9 },
  title: { fontSize: 16, color: NightPalette.textPrimary },
  subtitle: { fontSize: 12, color: NightPalette.dimText, marginTop: 3, lineHeight: 17 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  notePad: { paddingHorizontal: 18, paddingBottom: 16 },
});
