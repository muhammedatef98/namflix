import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocale } from '@/contexts/LocaleContext';
import { useFeatureGate } from '@/contexts/PremiumContext';
import { NightPalette, FONT } from '@/constants/theme';
import { SoundArt } from '@/components/SoundArt';
import type { SoundTrack } from '@/lib/mediaLibrary';

function TrackCard({ track }: { track: SoundTrack }) {
  const { open, isPremium } = useFeatureGate();
  const { tc, isRTL } = useLocale();

  return (
    <Pressable
      onPress={() => open(`/player/${track.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <SoundArt type={track.art} />
      <LinearGradient
        colors={['rgba(10,5,3,0.05)', 'rgba(10,5,3,0.5)', 'rgba(10,5,3,0.92)']}
        locations={[0, 0.5, 1]}
        style={styles.overlay}
      >
        <View style={[styles.topRow, isRTL && styles.topRowRTL]}>
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{tc(track.duration)}</Text>
          </View>
          {!isPremium && (
            <View style={styles.lockPill}>
              <Svg width={11} height={11} viewBox="0 0 24 24">
                <Path d="M7 10 V7 a5 5 0 0 1 10 0 V10" stroke="#F2C9A6" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                <Rect x="5" y="10" width="14" height="10" rx="2.5" fill="#F2C9A6" />
              </Svg>
            </View>
          )}
        </View>
        <View>
          <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={2}>
            {tc(track.title)}
          </Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]} numberOfLines={1}>
            {tc(track.subtitle)}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function TrackRow({ title, tracks }: { title: string; tracks: SoundTrack[] }) {
  const { isRTL } = useLocale();
  if (tracks.length === 0) return null;

  return (
    <View style={styles.row}>
      {title.length > 0 && (
        <Text style={[styles.heading, isRTL && styles.headingRTL]}>{title}</Text>
      )}
      <FlatList
        data={tracks}
        keyExtractor={(m) => m.id}
        horizontal
        inverted={isRTL}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TrackCard track={item} />}
      />
    </View>
  );
}

const CARD_W = 160;
const CARD_H = 210;

const styles = StyleSheet.create({
  row: { marginBottom: 24 },
  heading: {
    color: NightPalette.textPrimary,
    fontSize: 16,
    fontFamily: FONT.bold,
    marginBottom: 12,
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  headingRTL: { textAlign: 'right', writingDirection: 'rtl' },
  list: { paddingHorizontal: 24, gap: 14 },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: NightPalette.deepEmber,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.25)',
  },
  pressed: { opacity: 0.82 },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topRowRTL: { flexDirection: 'row-reverse' },
  durationPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10,5,3,0.55)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  lockPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,5,3,0.55)',
  },
  durationText: { color: NightPalette.textPrimary, fontSize: 10, lineHeight: 15 },
  title: { color: '#F2C9A6', fontSize: 15, fontFamily: FONT.bold, lineHeight: 22 },
  subtitle: { color: '#E0A878', fontSize: 11, marginTop: 3, lineHeight: 17 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
