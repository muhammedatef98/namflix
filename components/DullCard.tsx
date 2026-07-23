import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useLocale } from '@/contexts/LocaleContext';
import { NightPalette } from '@/constants/theme';
import { ScienceNote } from '@/components/ScienceNote';
import type { DullActivity } from '@/lib/dullContent';

/**
 * One wind-down activity in the Boring-on-Purpose hub. Routes to its own
 * interactive screen and carries a tap-to-expand science note. Bilingual.
 */
export function DullCard({ item }: { item: DullActivity }) {
  const router = useRouter();
  const { tc, isRTL } = useLocale();

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => router.push(item.route)}
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
  title: { fontSize: 16, color: NightPalette.textPrimary },
  subtitle: { fontSize: 12, color: NightPalette.dimText, marginTop: 3, lineHeight: 17 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  notePad: { paddingHorizontal: 18, paddingBottom: 16 },
});
