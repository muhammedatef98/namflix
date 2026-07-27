import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { type PaidPlan } from '@/lib/purchases';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { Logo } from '@/components/Logo';
import { NightPalette, FONT } from '@/constants/theme';

// Apple's standard EULA — satisfies the Terms-of-Use link that auto-renewable
// subscriptions must show (Guideline 3.1.2).
const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export default function PremiumScreen() {
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const { accent } = useTheme();
  const { plan, config, purchasablePlans, unlockLifetimeFree, purchase, restore } = usePremium();

  const lifetimeMode = config.lifetimeMode;
  // Paid cards are driven entirely by what the store actually offers, so a
  // price is never shown without a working purchase behind it.
  const hasPaid = purchasablePlans.length > 0;
  const perLabel = (p: PaidPlan) => (p === 'yearly' ? t('perYear') : t('perMonth'));
  const nameLabel = (p: PaidPlan) => (p === 'yearly' ? t('planYearly') : t('planMonthly'));

  const chooseFree = async () => {
    await unlockLifetimeFree();
    router.back();
  };

  const chooseLifetime = async () => {
    if (lifetimeMode === 'free') {
      await chooseFree();
      return;
    }
    Alert.alert(t('premiumTitle'), t('planPaidSoon'));
  };

  const choosePaid = async (paid: PaidPlan) => {
    const res = await purchase(paid);
    if (res.ok) {
      router.back();
      return;
    }
    if (res.reason === 'cancelled') return; // user backed out — stay quiet
    Alert.alert(t('premiumTitle'), t('purchaseFailed'));
  };

  const onRestore = async () => {
    const res = await restore();
    if (res.ok) {
      router.back();
      return;
    }
    Alert.alert(t('premiumTitle'), t('restoreNone'));
  };

  return (
    <LinearGradient colors={['#4A1A0A', NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.head}>
            <Logo size={52} color={accent} />
            <Text style={[styles.title, isRTL && styles.rtl]}>{t('premiumTitle')}</Text>
            <Text style={[styles.sub, isRTL && styles.rtl]}>{t('premiumSub')}</Text>
          </View>

          {plan === 'lifetime-free' && (
            <View style={[styles.activeBanner, { borderColor: accent }]}>
              <Text style={[styles.activeText, isRTL && styles.rtl]}>{t('premiumActive')}</Text>
            </View>
          )}

          {/* Lifetime — hero card. Free at launch; hidden when admin sets 'off'. */}
          {lifetimeMode !== 'off' && (
            <Pressable
              onPress={chooseLifetime}
              style={({ pressed }) => [styles.planCard, styles.heroCard, { borderColor: accent }, pressed && styles.pressed]}
            >
              <View style={[styles.planTop, isRTL && styles.rowRTL]}>
                <Text style={[styles.planName, isRTL && styles.rtl]}>{t('planLifetime')}</Text>
                <View style={[styles.ribbon, { backgroundColor: accent }]}>
                  <Text style={styles.ribbonText}>{t('bestValue')}</Text>
                </View>
              </View>
              {lifetimeMode === 'free' && (
                <Text style={[styles.freePrice, { color: accent }, isRTL && styles.rtl]}>{t('planLifetimeFree')}</Text>
              )}
              <Text style={[styles.planNote, isRTL && styles.rtl]}>{t('planLifetimeNote')}</Text>
              <View style={[styles.cta, { backgroundColor: accent }]}>
                <Text style={styles.ctaText}>
                  {lifetimeMode === 'free' ? t('planLifetimeCta') : t('planPaidCta')}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Paid App Store tiers — only rendered for plans the store actually
              sells, always with the real StoreKit price. */}
          {purchasablePlans.map(({ plan: paid, priceString }) => (
            <Pressable
              key={paid}
              onPress={() => choosePaid(paid)}
              style={({ pressed }) => [styles.planCard, pressed && styles.pressed]}
            >
              <View style={[styles.planTop, isRTL && styles.rowRTL]}>
                <Text style={[styles.planName, isRTL && styles.rtl]}>{nameLabel(paid)}</Text>
                <Text style={[styles.priceRow, isRTL && styles.rtl]}>
                  <Text style={styles.price}>{priceString}</Text>
                  <Text style={styles.per}> {perLabel(paid)}</Text>
                </Text>
              </View>
              {paid === 'yearly' && (
                <Text style={[styles.planNote, isRTL && styles.rtl]}>{t('planYearlyNote')}</Text>
              )}
              <View style={styles.ctaGhost}>
                <Text style={[styles.ctaGhostText, { color: accent }]}>{t('planPaidCta')}</Text>
              </View>
            </Pressable>
          ))}

          {/* Auto-renew disclosure — required next to subscription purchases. */}
          {hasPaid && (
            <Text style={[styles.disclosure, isRTL && styles.rtl]}>{t('subDisclosure')}</Text>
          )}

          {/* Restore + legal links (Apple requires restore + Terms + Privacy). */}
          <Pressable onPress={onRestore} hitSlop={8} style={styles.restoreBtn}>
            <Text style={[styles.restoreText, { color: accent }]}>{t('restorePurchases')}</Text>
          </Pressable>
          <View style={styles.legalRow}>
            <Pressable onPress={() => Linking.openURL(EULA_URL)} hitSlop={8}>
              <Text style={styles.legalLink}>{t('termsOfUse')}</Text>
            </Pressable>
            <Text style={styles.legalDot}>·</Text>
            <Pressable onPress={() => router.push('/privacy')} hitSlop={8}>
              <Text style={styles.legalLink}>{t('privacyLink')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 36 },
  head: { alignItems: 'center', marginTop: 8, marginBottom: 22 },
  title: { fontSize: 28, fontFamily: FONT.bold, color: '#F2C9A6', lineHeight: 40, marginTop: 12 },
  sub: { fontSize: 14, lineHeight: 22, color: NightPalette.dimText, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  rowRTL: { flexDirection: 'row-reverse' },

  activeBanner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    backgroundColor: 'rgba(74,26,10,0.5)',
  },
  activeText: { color: '#F2C9A6', fontSize: 13, lineHeight: 20, textAlign: 'center' },

  planCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.35)',
    backgroundColor: 'rgba(36,17,9,0.6)',
    padding: 20,
    marginBottom: 16,
  },
  heroCard: { borderWidth: 1.5, backgroundColor: 'rgba(74,26,10,0.55)' },
  pressed: { opacity: 0.85 },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planName: { color: NightPalette.textPrimary, fontSize: 18, fontFamily: FONT.medium, lineHeight: 26 },
  ribbon: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  ribbonText: { color: NightPalette.voidBlack, fontSize: 10, fontFamily: FONT.bold, lineHeight: 14 },
  freePrice: { fontSize: 40, fontFamily: FONT.black, lineHeight: 52, marginTop: 8 },
  priceRow: { color: NightPalette.textPrimary },
  price: { color: '#F2C9A6', fontSize: 22, fontFamily: FONT.bold },
  per: { color: NightPalette.dimText, fontSize: 13 },
  planNote: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18, marginTop: 6 },
  cta: { borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 18 },
  ctaText: { color: NightPalette.voidBlack, fontSize: 15, fontFamily: FONT.bold, lineHeight: 22 },
  ctaGhost: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
  },
  ctaGhostText: { fontSize: 14, fontFamily: FONT.medium, lineHeight: 20 },

  disclosure: {
    color: NightPalette.dimText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 8,
  },
  restoreBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  restoreText: { fontSize: 14, fontFamily: FONT.medium, lineHeight: 20 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 2 },
  legalLink: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18, textDecorationLine: 'underline' },
  legalDot: { color: NightPalette.dimText, fontSize: 12 },
});
