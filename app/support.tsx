/**
 * Voluntary support screen — the only place the Ko-fi link lives.
 *
 * Kept off the paywall on purpose: an external payment link presented next to
 * the App Store plans reads as steering around in-app purchase. Here it is
 * framed as what it is — a tip that grants nothing.
 */
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { openSupportPage } from '@/lib/support';
import { NightPalette, FONT } from '@/constants/theme';

/** A warm steaming cup — the one bit of illustration on the screen. */
function CupMark({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M30 12c-3 3-3 5 0 8s3 5 0 8M40 12c-2.4 2.4-2.4 4 0 6.4s2.4 4 0 6.4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.55}
        fill="none"
      />
      <Path
        d="M14 32h32v10a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12V32Z"
        stroke={color}
        strokeWidth={2.2}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M46 35h4a6 6 0 0 1 0 12h-4"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export default function SupportScreen() {
  const { t, isRTL } = useLocale();
  const { accent } = useTheme();

  const onSupport = async () => {
    const ok = await openSupportPage();
    if (!ok) Alert.alert(t('supportTitle'), t('supportFailed'));
  };

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.head}>
            <CupMark color={accent} />
            <Text style={[styles.title, isRTL && styles.rtl]}>{t('supportTitle')}</Text>
          </View>

          <Text style={[styles.body, isRTL && styles.rtl]}>{t('supportIntro')}</Text>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{t('supportWhy')}</Text>
            <Text style={[styles.cardBody, isRTL && styles.rtl]}>{t('supportWhyBody')}</Text>
          </View>

          <Pressable
            onPress={onSupport}
            style={({ pressed }) => [styles.cta, { backgroundColor: accent }, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>{t('supportCta')}</Text>
          </Pressable>
          <Text style={[styles.hint, isRTL && styles.rtl]}>{t('supportOpensBrowser')}</Text>

          {/* Said plainly, and true: nothing in the app is behind this. */}
          <View style={[styles.note, { borderColor: 'rgba(140,42,18,0.35)' }]}>
            <Text style={[styles.noteText, isRTL && styles.rtl]}>{t('supportUnlocksNothing')}</Text>
          </View>
          <Text style={[styles.soft, isRTL && styles.rtl]}>{t('supportNoObligation')}</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  head: { alignItems: 'center', marginTop: 4, marginBottom: 20 },
  title: { fontSize: 26, fontFamily: FONT.bold, color: '#F2C9A6', lineHeight: 38, marginTop: 10 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  body: { color: NightPalette.textPrimary, fontSize: 15, lineHeight: 26 },

  card: {
    marginTop: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.55)',
    padding: 18,
  },
  cardTitle: { color: '#F2C9A6', fontSize: 13, fontFamily: FONT.medium, lineHeight: 20 },
  cardBody: { color: NightPalette.dimText, fontSize: 13, lineHeight: 22, marginTop: 8 },

  cta: { borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 26 },
  ctaText: { color: NightPalette.voidBlack, fontSize: 15, fontFamily: FONT.bold, lineHeight: 22 },
  pressed: { opacity: 0.85 },
  hint: { color: NightPalette.dimText, fontSize: 12, lineHeight: 19, marginTop: 10, textAlign: 'center' },

  note: { marginTop: 26, borderRadius: 14, borderWidth: 1, padding: 14 },
  noteText: { color: NightPalette.dimText, fontSize: 12, lineHeight: 20 },
  soft: { color: NightPalette.dimText, fontSize: 12, lineHeight: 20, marginTop: 16, opacity: 0.85 },
});
