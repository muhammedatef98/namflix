import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium, useFeatureGate } from '@/contexts/PremiumContext';
import { useLocale } from '@/contexts/LocaleContext';
import { NightPalette, FONT, WORDMARK } from '@/constants/theme';
import { Logo } from '@/components/Logo';
import { StarField } from '@/components/StarField';
import { SoundscapeCard } from '@/components/SoundscapeCard';
import { MorningCheckIn } from '@/components/MorningCheckIn';
import { LanguageToggle } from '@/components/LanguageToggle';
import { TrackRow } from '@/components/TrackRow';
import { tracksForLang } from '@/lib/mediaLibrary';

const HERO_STARS = [
  [14, 24], [82, 16], [40, 32], [68, 46], [24, 64], [90, 72], [54, 80], [10, 86],
] as const;

export default function HomeScreen() {
  const { intensity, setIntensity, accent, theme, setThemeId } = useTheme();
  const { signOut, deleteAccount, isGuest } = useAuth();
  const { isPremium } = usePremium();
  const { open } = useFeatureGate();
  const { lang, t, tc, isRTL } = useLocale();
  const router = useRouter();
  const locked = !isPremium;

  const sounds = tracksForLang(lang);

  const confirmDelete = () => {
    Alert.alert(t('deleteConfirmTitle'), t('deleteConfirmBody'), [
      { text: t('deleteCancel'), style: 'cancel' },
      {
        text: t('deleteConfirmYes'),
        style: 'destructive',
        onPress: () => {
          deleteAccount().catch(() => Alert.alert(t('deleteAccount'), t('deleteFailed')));
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Brand bar */}
          <View style={[styles.padded, styles.header, isRTL && styles.rowRTL]}>
            <View style={[styles.brandRow, isRTL && styles.rowRTL]}>
              <Logo size={38} color={accent} />
              <Text style={styles.brand}>Namflix</Text>
            </View>
            <View style={[styles.headerRight, isRTL && styles.rowRTL]}>
              <LanguageToggle />
              <Pressable
                onPress={signOut}
                hitSlop={12}
                style={({ pressed }) => [styles.exitBtn, pressed && styles.exitPressed]}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path
                    d="M14 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-2"
                    stroke={NightPalette.textPrimary}
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M10 12h9m0 0-3-3m3 3-3 3"
                    stroke={accent}
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </Pressable>
            </View>
          </View>

          <Text style={[styles.padded, styles.intro, isRTL && styles.textRTL]}>{t('homeIntro')}</Text>

          {!isPremium && (
            <View style={styles.padded}>
              <Pressable
                onPress={() => router.push('/premium')}
                style={({ pressed }) => [styles.premiumBanner, { borderColor: accent }, pressed && styles.heroPressed]}
              >
                <View style={[styles.premiumRow, isRTL && styles.rowRTL]}>
                  <View style={[styles.premiumBadge, { backgroundColor: accent }]}>
                    <Text style={styles.premiumBadgeText}>{t('premiumBadge')}</Text>
                  </View>
                  <Text style={[styles.premiumText, isRTL && styles.textRTL]}>{t('premiumEntry')}</Text>
                  <Text style={[styles.premiumArrow, { color: accent }]}>{isRTL ? '←' : '→'}</Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* Hero — Your Path Tonight / مسارك الليلة */}
          <View style={styles.padded}>
            <Pressable
              onPress={() => open('/descent')}
              style={({ pressed }) => [styles.hero, pressed && styles.heroPressed]}
            >
              <LinearGradient
                colors={['#4A1A0A', '#2A0D06', '#0A0503']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroInner}
              >
                {HERO_STARS.map(([x, y], i) => (
                  <View key={i} style={[styles.heroStar, { left: `${x}%`, top: `${y}%` }]} />
                ))}
                <View style={[styles.heroContent, isRTL && styles.alignEnd]}>
                  <Text style={[styles.heroKicker, { color: accent }, isRTL && styles.textRTL]}>{t('descentQuestion')}</Text>
                  <Text style={[styles.heroTitle, isRTL && styles.textRTL]}>{t('toolDescentTitle')}</Text>
                  <Text style={[styles.heroSub, isRTL && styles.textRTL]}>{t('toolDescentSub')}</Text>
                  <View style={[styles.heroCta, isRTL && styles.rowRTL]}>
                    <Text style={[styles.heroCtaText, { backgroundColor: accent }]}>{t('descentBegin')}</Text>
                    <Text style={[styles.heroArrow, { color: accent }]}>{isRTL ? '←' : '→'}</Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Morning check-in — the one question that powers the personal map */}
          <View style={styles.padded}>
            <MorningCheckIn />
          </View>

          {/* Night Rescue — the 3 a.m. mode, the app's signature differentiator */}
          <View style={styles.padded}>
            <Pressable
              onPress={() => open('/rescue')}
              style={({ pressed }) => [styles.rescue, isRTL && styles.rowRTL, pressed && styles.heroPressed]}
            >
              <View style={styles.rescueMoon}>
                <Svg width={22} height={22} viewBox="0 0 24 24">
                  <Path
                    d="M19 14.5 A 8 8 0 1 1 9.5 5 A 6.5 6.5 0 0 0 19 14.5 Z"
                    fill="rgba(255,110,60,0.55)"
                  />
                </Svg>
              </View>
              <View style={styles.rescueText}>
                <Text style={[styles.rescueTitle, isRTL && styles.textRTL]}>{t('rescueEntryTitle')}</Text>
                <Text style={[styles.rescueSub, isRTL && styles.textRTL]}>{t('rescueEntrySub')}</Text>
              </View>
            </Pressable>
          </View>

          {/* Quick tools */}
          <Text style={[styles.padded, styles.section, isRTL && styles.textRTL]}>{t('secTonight')}</Text>
          <View style={styles.padded}>
            <SoundscapeCard
              accent
              locked={locked}
              title={t('toolBoringTitle')}
              subtitle={t('toolBoringSub')}
              onPress={() => open('/boring')}
            />
            <SoundscapeCard
              locked={locked}
              title={t('toolBreatheTitle')}
              subtitle={t('toolBreatheSub')}
              onPress={() => open('/breathe')}
            />
            <SoundscapeCard
              locked={locked}
              title={t('toolWorryTitle')}
              subtitle={t('toolWorrySub')}
              onPress={() => open('/worry')}
            />
            <SoundscapeCard
              locked={locked}
              title={t('toolInsightsTitle')}
              subtitle={t('toolInsightsSub')}
              onPress={() => open('/insights')}
            />
          </View>

          {/* Real sounds */}
          <Text style={[styles.padded, styles.section, isRTL && styles.textRTL]}>{t('secListen')}</Text>
          <TrackRow title="" tracks={sounds} />

          {/* Screen warmth — actually tints the whole app */}
          <View style={[styles.padded, styles.warmth]}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('screenWarmth')}</Text>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor={accent}
              maximumTrackTintColor={NightPalette.surface}
              thumbTintColor={accent}
            />
          </View>

          {/* Comfort theme — every option is warm & low-blue */}
          <View style={[styles.padded, styles.warmth]}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('themeColour')}</Text>
            <View style={[styles.themeRow, isRTL && styles.rowRTL]}>
              {THEMES.map((th) => {
                const on = th.id === theme.id;
                return (
                  <Pressable
                    key={th.id}
                    onPress={() => setThemeId(th.id)}
                    style={[styles.themeChip, on && styles.themeChipOn, isRTL && styles.rowRTL]}
                  >
                    <View style={[styles.themeDot, { backgroundColor: th.accent }]} />
                    <Text style={[styles.themeLabel, on && styles.themeLabelOn]}>{tc(th.label)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Account — privacy link + in-app account deletion (App Store 5.1.1) */}
          <View style={[styles.padded, styles.accountArea]}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>{t('accountSection')}</Text>
            <View style={[styles.accountRow, isRTL && styles.rowRTL]}>
              <Pressable
                onPress={() => router.push('/privacy')}
                style={({ pressed }) => [styles.accountBtn, pressed && styles.accountPressed]}
              >
                <Text style={styles.accountText}>{t('privacyLink')}</Text>
              </Pressable>
              {!isGuest && (
                <Pressable
                  onPress={confirmDelete}
                  style={({ pressed }) => [styles.accountBtn, styles.dangerBtn, pressed && styles.accountPressed]}
                >
                  <Text style={styles.dangerText}>{t('deleteAccount')}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingTop: 12, paddingBottom: 28 },
  padded: { paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowRTL: { flexDirection: 'row-reverse' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  alignEnd: { alignItems: 'flex-end' },
  brand: {
    fontSize: 26,
    fontFamily: WORDMARK.bold,
    color: '#F2C9A6',
    lineHeight: 36,
    includeFontPadding: false,
    transform: [{ translateY: 2 }],
  },
  exitBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36,17,9,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
  },
  exitPressed: { opacity: 0.6 },
  intro: { marginTop: 18, fontSize: 14, lineHeight: 22, color: NightPalette.dimText },
  premiumBanner: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(74,26,10,0.45)',
  },
  premiumRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  premiumBadgeText: { color: NightPalette.voidBlack, fontSize: 10, fontFamily: FONT.bold, lineHeight: 14 },
  premiumText: { flex: 1, color: '#F2C9A6', fontSize: 13, lineHeight: 19 },
  premiumArrow: { fontSize: 18 },

  hero: {
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(194,78,26,0.45)',
  },
  heroPressed: { opacity: 0.9 },
  heroInner: { minHeight: 210, padding: 24, justifyContent: 'flex-end' },
  heroStar: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(242,201,166,0.55)' },
  heroContent: {},
  heroKicker: { color: NightPalette.amber, fontSize: 12, marginBottom: 10, lineHeight: 18 },
  heroTitle: { color: '#F2C9A6', fontSize: 40, fontFamily: FONT.bold, lineHeight: 54 },
  heroSub: { color: '#D99C6E', fontSize: 13, lineHeight: 20, marginTop: 6, maxWidth: 280 },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  heroCtaText: {
    color: NightPalette.voidBlack,
    backgroundColor: NightPalette.amber,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 22,
    fontSize: 14,
    fontFamily: FONT.bold,
    overflow: 'hidden',
    lineHeight: 20,
  },
  heroArrow: { color: NightPalette.amber, fontSize: 20 },

  rescue: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,110,60,0.22)',
    backgroundColor: '#050201',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rescueMoon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,110,60,0.07)',
  },
  rescueText: { flex: 1 },
  rescueTitle: { color: 'rgba(255,150,100,0.85)', fontSize: 15, fontFamily: FONT.medium, lineHeight: 23 },
  rescueSub: { color: 'rgba(255,110,60,0.45)', fontSize: 12, marginTop: 2, lineHeight: 18 },

  section: {
    marginTop: 28,
    marginBottom: 14,
    fontSize: 13,

    color: NightPalette.dimText,
    fontFamily: FONT.medium,
    lineHeight: 20,
  },
  warmth: { marginTop: 8 },
  label: { fontSize: 12, color: NightPalette.dimText, marginBottom: 8, lineHeight: 18 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.35)',
    backgroundColor: 'rgba(36,17,9,0.5)',
  },
  themeChipOn: { borderColor: NightPalette.amber, backgroundColor: 'rgba(74,26,10,0.6)' },
  themeDot: { width: 16, height: 16, borderRadius: 8 },
  themeLabel: { color: NightPalette.dimText, fontSize: 13, lineHeight: 18 },
  themeLabelOn: { color: '#F2C9A6', fontFamily: FONT.medium },
  accountArea: { marginTop: 26 },
  accountRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  accountBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.35)',
    backgroundColor: 'rgba(36,17,9,0.5)',
  },
  dangerBtn: { borderColor: 'rgba(180,50,40,0.5)' },
  accountPressed: { opacity: 0.6 },
  accountText: { color: NightPalette.dimText, fontSize: 13, lineHeight: 20 },
  dangerText: { color: '#D96A5A', fontSize: 13, lineHeight: 20 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
