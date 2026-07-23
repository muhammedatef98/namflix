import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useFeatureGate } from '@/contexts/PremiumContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { StarField } from '@/components/StarField';
import { TrackRow } from '@/components/TrackRow';
import { NightPalette, FONT } from '@/constants/theme';
import { useFavorites } from '@/contexts/FavoritesContext';
import { CATEGORY_LABEL, MEDIA_ORDER, tracksByCategory, randomTrack, trackById } from '@/lib/mediaLibrary';
import type { SoundTrack } from '@/lib/mediaLibrary';

const ORDER = MEDIA_ORDER;

/** A small dice-style shuffle glyph for the random-track shortcut. */
function ShuffleGlyph({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Path
        d="M3 7 h4 c2 0 3 1 4.5 3 M14 17 c1 1.4 2 2 3.5 2 H21 M3 17 h4 c5 0 5.5-10 10.5-10 H21 M18 4 l3 3 -3 3 M18 14 l3 3 -3 3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function ListenScreen() {
  const { lang, t, tc, isRTL } = useLocale();
  const { open } = useFeatureGate();
  const { accent } = useTheme();
  const { favoriteIds } = useFavorites();

  const favoriteTracks = favoriteIds
    .map(trackById)
    .filter((tr): tr is SoundTrack => tr !== undefined && tr.langs.includes(lang));

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={[styles.topBar, isRTL && styles.rowRTL]}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('mediaTitle')}</Text>
            <LanguageToggle />
          </View>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('mediaSub')}</Text>

          <Pressable
            onPress={() => open(`/player/${randomTrack(lang).id}`)}
            style={({ pressed }) => [
              styles.surprise,
              { borderColor: accent },
              isRTL && styles.rowRTL,
              isRTL && styles.alignEnd,
              pressed && styles.pressed,
            ]}
          >
            <ShuffleGlyph color={accent} />
            <Text style={[styles.surpriseText, { color: accent }]}>{t('surpriseMe')}</Text>
          </Pressable>

          <Pressable
            onPress={() => open('/mixer')}
            style={({ pressed }) => [
              styles.surprise,
              styles.mixerPill,
              { borderColor: accent },
              isRTL && styles.rowRTL,
              isRTL && styles.alignEnd,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.surpriseText, { color: accent }]}>{t('mixerTitle')} — {t('toolMixerNewSub')}</Text>
          </Pressable>

          <View style={styles.rows}>
            {favoriteTracks.length > 0 && (
              <TrackRow title={t('favoritesRow')} tracks={favoriteTracks} />
            )}
            {ORDER.map((cat) => (
              <TrackRow key={cat} title={tc(CATEGORY_LABEL[cat])} tracks={tracksByCategory(lang, cat)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingTop: 16, paddingBottom: 24 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: 24, fontFamily: FONT.light, color: NightPalette.textPrimary, flexShrink: 1 },
  sub: { fontSize: 13, color: NightPalette.dimText, paddingHorizontal: 24, marginTop: 6, marginBottom: 16 },
  surprise: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 22,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(36,17,9,0.6)',
  },
  pressed: { opacity: 0.7 },
  alignEnd: { alignSelf: 'flex-end' },
  mixerPill: { marginTop: -12 },
  surpriseText: { fontSize: 13, fontFamily: FONT.medium, lineHeight: 20 },
  rows: {},
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
