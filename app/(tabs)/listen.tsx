import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useFeatureGate, usePreloadRewardedOnFocus } from '@/hooks/useFeatureGate';
import { useTheme } from '@/contexts/ThemeContext';
import { usePlayback } from '@/contexts/PlaybackContext';
import { RADIO_CHANNELS } from '@/lib/radio';
import { LanguageToggle } from '@/components/LanguageToggle';
import { StarField } from '@/components/StarField';
import { TrackRow } from '@/components/TrackRow';
import { NightPalette, FONT } from '@/constants/theme';
import { useFavorites } from '@/contexts/FavoritesContext';
import { CATEGORY_LABEL, MEDIA_ORDER, tracksByCategory, tracksForLang, randomTrack, trackById } from '@/lib/mediaLibrary';
import { isFreeTrack } from '@/lib/freeTier';
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
  const { open, isPremium } = useFeatureGate();
  usePreloadRewardedOnFocus();
  const { accent } = useTheme();
  const { favoriteIds } = useFavorites();
  const { radioChannel, startRadio } = usePlayback();

  const startRadioGated = (channelId: typeof RADIO_CHANNELS[number]['id']) => {
    // Radio is a long overnight session — gate it exactly like the mixer.
    // For a free user the gate goes to the lock sheet; for premium it plays.
    if (!isPremium) {
      open('/mixer'); // reuse the mixer's gating surface; same outcome
      return;
    }
    startRadio(channelId);
  };

  // "Play something for me" should always actually play something: for a free
  // user it draws from the free sounds instead of bouncing them to the paywall.
  const playSomething = () => {
    if (isPremium) {
      open(`/player/${randomTrack(lang).id}`);
      return;
    }
    const free = tracksForLang(lang).filter((tr) => isFreeTrack(tr.id));
    const pick = free[Math.floor(Math.random() * free.length)];
    open(`/player/${pick ? pick.id : randomTrack(lang).id}`);
  };

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
            onPress={playSomething}
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

          {/* Sleep Radio — curated channels that rotate on their own. Tap
              one and leave the phone alone; each channel walks through its
              tracks every RADIO_ROTATE_MINUTES minutes. */}
          <View style={styles.radioSection}>
            <Text style={[styles.radioHeading, isRTL && styles.textRTL]}>{t('radioHeading')}</Text>
            <Text style={[styles.radioSub, isRTL && styles.textRTL]}>{t('radioSub')}</Text>
            <View style={styles.radioGrid}>
              {RADIO_CHANNELS.map((ch) => {
                const active = radioChannel === ch.id;
                return (
                  <Pressable
                    key={ch.id}
                    onPress={() => startRadioGated(ch.id)}
                    style={({ pressed }) => [
                      styles.radioChip,
                      active && { borderColor: accent, backgroundColor: 'rgba(74,26,10,0.55)' },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.radioChipTitle, isRTL && styles.textRTL]} numberOfLines={1}>
                      {tc(ch.title)}
                    </Text>
                    <Text style={[styles.radioChipSub, isRTL && styles.textRTL]} numberOfLines={2}>
                      {tc(ch.subtitle)}
                    </Text>
                    {active && (
                      <Text style={[styles.radioOn, { color: accent }, isRTL && styles.textRTL]}>
                        {t('radioOn')}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

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
  radioSection: { paddingHorizontal: 24, marginBottom: 22 },
  radioHeading: { fontSize: 15, fontFamily: FONT.bold, color: '#F2C9A6', marginBottom: 4, lineHeight: 22 },
  radioSub: { fontSize: 12, color: NightPalette.dimText, marginBottom: 12, lineHeight: 18 },
  radioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  radioChip: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.35)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    padding: 12,
    minHeight: 86,
  },
  radioChipTitle: { color: NightPalette.textPrimary, fontSize: 14, fontFamily: FONT.bold, lineHeight: 20 },
  radioChipSub: { color: NightPalette.dimText, fontSize: 11, lineHeight: 16, marginTop: 4 },
  radioOn: { fontSize: 10, fontFamily: FONT.bold, marginTop: 6, letterSpacing: 1 },
  downloadsPill: {
    alignSelf: 'flex-start',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(242,201,166,0.25)',
    backgroundColor: 'rgba(20,10,5,0.4)',
  },
  downloadsPillText: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18 },
});
