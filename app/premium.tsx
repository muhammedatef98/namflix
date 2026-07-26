import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { buyPlan, type PaidPlan } from '@/lib/purchases';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { Logo } from '@/components/Logo';
import { NightPalette, FONT } from '@/constants/theme';

export default function PremiumScreen() {
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const { accent } = useTheme();
  const { plan, config, unlockLifetimeFree } = usePremium();

  // Prices and Lifetime behaviour come from the admin remote config.
  const MONTHLY_PRICE = config.monthlyPrice;
  const YEARLY_PRICE = config.yearlyPrice;
  const lifetimeMode = config.lifetimeMode;

  const chooseFree = async () => {
    await unlockLifetimeFree();
    router.back();
  };

  // When the admin has switched Lifetime to paid but the App Store product
  // isn't live yet, fall back to the "coming soon" notice instead of granting.
  const chooseLifetime = async () => {
    if (lifetimeMode === 'free') {
      await chooseFree();
      return;
    }
    Alert.alert(t('premiumTitle'), t('planPaidSoon'));
  };

  const choosePaid = async (plan: PaidPlan) => {
    const res = await buyPlan(plan);
    if (res.ok) {
      router.back();
      return;
    }
    // No native IAP yet — steer them to the free Lifetime offer for now.
    Alert.alert(t('premiumTitle'), t('planPaidSoon'));
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

          {/* Paid tiers — presented now, chargeable once IAP is added */}
          <Pressable onPress={() => choosePaid('yearly')} style={({ pressed }) => [styles.planCard, pressed && styles.pressed]}>
            <View style={[styles.planTop, isRTL && styles.rowRTL]}>
              <Text style={[styles.planName, isRTL && styles.rtl]}>{t('planYearly')}</Text>
              <Text style={[styles.priceRow, isRTL && styles.rtl]}>
                <Text style={styles.price}>{YEARLY_PRICE}</Text>
                <Text style={styles.per}> {t('perYear')}</Text>
              </Text>
            </View>
            <Text style={[styles.planNote, isRTL && styles.rtl]}>{t('planYearlyNote')}</Text>
            <View style={styles.ctaGhost}>
              <Text style={[styles.ctaGhostText, { color: accent }]}>{t('planPaidCta')}</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => choosePaid('monthly')} style={({ pressed }) => [styles.planCard, pressed && styles.pressed]}>
            <View style={[styles.planTop, isRTL && styles.rowRTL]}>
              <Text style={[styles.planName, isRTL && styles.rtl]}>{t('planMonthly')}</Text>
              <Text style={[styles.priceRow, isRTL && styles.rtl]}>
                <Text style={styles.price}>{MONTHLY_PRICE}</Text>
                <Text style={styles.per}> {t('perMonth')}</Text>
              </Text>
            </View>
            <View style={styles.ctaGhost}>
              <Text style={[styles.ctaGhostText, { color: accent }]}>{t('planPaidCta')}</Text>
            </View>
          </Pressable>
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
});
