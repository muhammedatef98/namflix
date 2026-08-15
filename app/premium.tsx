import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { type PaidPlan, type FreeTrial, canRedeemInApp, redeemOfferCode } from '@/lib/purchases';
import { useCountdown } from '@/hooks/useCountdown';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { Logo } from '@/components/Logo';
import { NightPalette, FONT } from '@/constants/theme';

// How long the "claiming" state lingers so the free unlock reads as a real
// purchase rather than an instant, unremarkable toggle.
const CLAIM_PROCESSING_MS = 900;
const CLAIM_DONE_MS = 850;

type ClaimState = 'idle' | 'processing' | 'done';

/** The value list shown above the plans — same for every tier. */
const FEATURE_KEYS = ['premiumFeat1', 'premiumFeat2', 'premiumFeat3', 'premiumFeat4'] as const;

// Apple's standard EULA — satisfies the Terms-of-Use link that auto-renewable
// subscriptions must show (Guideline 3.1.2).
const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

/** i18n keys for a trial period unit, singular and plural. */
const TRIAL_UNIT_KEYS = {
  day: ['trialUnitDay1', 'trialUnitDay'],
  week: ['trialUnitWeek1', 'trialUnitWeek'],
  month: ['trialUnitMonth1', 'trialUnitMonth'],
  year: ['trialUnitYear1', 'trialUnitYear'],
} as const;

/** One two-digit segment of the countdown (days / hours / minutes / seconds). */
function CdSeg({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.cdBox}>
      <Text style={styles.cdNum}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.cdLabel}>{label}</Text>
    </View>
  );
}

export default function PremiumScreen() {
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const { accent } = useTheme();
  const { plan, isPremium, config, purchasablePlans, unlockLifetimeFree, purchase, restore } =
    usePremium();

  const lifetimeMode = config.lifetimeMode;
  const deadline = config.freeUntil ? new Date(config.freeUntil) : null;
  const countdown = useCountdown(deadline);
  // The free Lifetime offer is claimable only while its window is open. Once
  // the deadline passes the card drops away and the paid plans carry the
  // paywall — the offer "flips to paid". A null deadline means no expiry.
  const offerActive = lifetimeMode === 'free' && (deadline === null || !countdown.expired);
  const showCountdown = offerActive && deadline !== null;

  const [claim, setClaim] = useState<ClaimState>('idle');

  // Paid cards are driven entirely by what the store actually offers, so a
  // price is never shown without a working purchase behind it. The paid
  // Lifetime is additionally gated on `lifetime_mode` so it can be switched on
  // from the dashboard the day the free offer closes — no build, no review.
  const paidPlans = purchasablePlans.filter(
    (p) => p.plan !== 'lifetime' || lifetimeMode === 'paid',
  );
  const hasPaid = paidPlans.length > 0;
  // Lifetime is a one-off: no "/mo" or "/yr" suffix belongs next to its price.
  const perLabel = (p: PaidPlan) =>
    p === 'lifetime' ? '' : p === 'yearly' ? t('perYear') : t('perMonth');
  const nameLabel = (p: PaidPlan) =>
    p === 'lifetime' ? t('planLifetime') : p === 'yearly' ? t('planYearly') : t('planMonthly');
  const hasTrial = purchasablePlans.some((p) => p.trial != null);

  // "7 days free, then $39.99/yr" — built from what the store reported, so the
  // trial length and the price after it are always the real ones.
  const trialLabel = (trial: FreeTrial, priceString: string, paid: PaidPlan) => {
    const [one, many] = TRIAL_UNIT_KEYS[trial.unit];
    const unit = t(trial.count === 1 ? one : many);
    return `${trial.count} ${unit} ${t('trialThen')} ${priceString}${perLabel(paid)}`;
  };

  // Grant the free Lifetime, but dressed as a purchase: a short processing
  // beat, a success haptic, then a confirmed state before the paywall closes.
  const claimFree = async () => {
    if (claim !== 'idle') return;
    setClaim('processing');
    Haptics.selectionAsync().catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, CLAIM_PROCESSING_MS));
    await unlockLifetimeFree();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setClaim('done');
    setTimeout(() => router.back(), CLAIM_DONE_MS);
  };

  const claimLabel = claim === 'processing' ? t('claiming') : claim === 'done' ? t('claimed') : t('claimFree');

  const choosePaid = async (paid: PaidPlan) => {
    const res = await purchase(paid);
    if (res.ok) {
      router.back();
      return;
    }
    if (res.reason === 'cancelled') return; // user backed out — stay quiet
    Alert.alert(t('premiumTitle'), t('purchaseFailed'));
  };

  // Offer codes are Apple's own: we never see the code, and it is revoked from
  // App Store Connect rather than by shipping a build. Android has no in-app
  // sheet, so there we point at where Play does it.
  const onRedeem = async () => {
    if (!canRedeemInApp()) {
      Alert.alert(t('redeemCode'), t('redeemAndroid'));
      return;
    }
    const res = await redeemOfferCode();
    if (res.ok) {
      Alert.alert(t('redeemCode'), t('redeemDone'));
      await restore(); // pull the new entitlement into app state
      router.back();
      return;
    }
    if (res.reason === 'unavailable') return;
    Alert.alert(t('redeemCode'), t('redeemNone'));
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

          {/* What the price buys. Apple requires the purchase screen itself to
              describe the value delivered, not just the amount charged. */}
          <View style={styles.includes}>
            <Text style={[styles.includesTitle, isRTL && styles.rtl]}>{t('premiumIncludes')}</Text>
            {FEATURE_KEYS.map((key) => (
              <View key={key} style={[styles.featRow, isRTL && styles.rowRTL]}>
                <View style={[styles.featDot, { backgroundColor: accent }]} />
                <Text style={[styles.featText, isRTL && styles.rtl]}>{t(key)}</Text>
              </View>
            ))}
          </View>

          {plan === 'lifetime-free' && (
            <View style={[styles.activeBanner, { borderColor: accent }]}>
              <Text style={[styles.activeText, isRTL && styles.rtl]}>{t('premiumActive')}</Text>
            </View>
          )}

          {/* Lifetime — free launch offer, shown only while its window is open.
              Presented as a claimable "purchase" for $0; once the deadline
              passes it drops and the paid plans below take over. */}
          {offerActive && (
            <View style={[styles.planCard, styles.heroCard, { borderColor: accent }]}>
              <View style={[styles.planTop, isRTL && styles.rowRTL]}>
                <Text style={[styles.planName, isRTL && styles.rtl]}>{t('planLifetime')}</Text>
                <View style={[styles.ribbon, { backgroundColor: accent }]}>
                  <Text style={styles.ribbonText}>{t('bestValue')}</Text>
                </View>
              </View>
              <Text style={[styles.freePrice, { color: accent }, isRTL && styles.rtl]}>{t('planLifetimeFree')}</Text>
              <Text style={[styles.planNote, isRTL && styles.rtl]}>{t('planLifetimeNote')}</Text>

              {showCountdown && (
                <View style={styles.countdownWrap}>
                  <Text style={[styles.countdownLabel, isRTL && styles.rtl]}>{t('offerEndsIn')}</Text>
                  <View style={[styles.countdownRow, isRTL && styles.rowRTL]}>
                    <CdSeg value={countdown.days} label={t('cdDays')} />
                    <CdSeg value={countdown.hours} label={t('cdHours')} />
                    <CdSeg value={countdown.minutes} label={t('cdMins')} />
                    <CdSeg value={countdown.seconds} label={t('cdSecs')} />
                  </View>
                  <Text style={[styles.countdownFoot, isRTL && styles.rtl]}>{t('afterOfferPaid')}</Text>
                </View>
              )}

              <Pressable
                onPress={claimFree}
                disabled={claim !== 'idle'}
                style={({ pressed }) => [styles.cta, { backgroundColor: accent }, pressed && styles.pressed, claim !== 'idle' && styles.ctaBusy]}
              >
                {claim === 'processing' ? (
                  <View style={styles.ctaBusyRow}>
                    <ActivityIndicator size="small" color={NightPalette.voidBlack} />
                    <Text style={styles.ctaText}>{claimLabel}</Text>
                  </View>
                ) : (
                  <Text style={styles.ctaText}>{claimLabel}</Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Paid App Store tiers — only rendered for plans the store actually
              sells, always with the real StoreKit price. */}
          {paidPlans.map(({ plan: paid, priceString, trial }) => (
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
              {/* The trial reads as a note under the billed price — never as
                  the headline number, which stays the amount actually charged. */}
              {trial && (
                <Text style={[styles.trialNote, { color: accent }, isRTL && styles.rtl]}>
                  {trialLabel(trial, priceString, paid)}
                </Text>
              )}
              {paid === 'yearly' && (
                <Text style={[styles.planNote, isRTL && styles.rtl]}>{t('planYearlyNote')}</Text>
              )}
              {paid === 'lifetime' && (
                <Text style={[styles.planNote, isRTL && styles.rtl]}>{t('planLifetimePaidNote')}</Text>
              )}
              <View style={styles.ctaGhost}>
                <Text style={[styles.ctaGhostText, { color: accent }]}>{t('planPaidCta')}</Text>
              </View>
            </Pressable>
          ))}

          {/* Auto-renew disclosure — required next to subscription purchases. */}
          {hasTrial && (
            <Text style={[styles.disclosure, isRTL && styles.rtl]}>{t('trialDisclosure')}</Text>
          )}
          {/* Auto-renew wording applies to the subscriptions only — a Lifetime
              on its own must not carry a "renews automatically" line. */}
          {paidPlans.some((p) => p.plan !== 'lifetime') && (
            <Text style={[styles.disclosure, isRTL && styles.rtl]}>{t('subDisclosure')}</Text>
          )}

          {/* Always an explicit way out: the paywall can appear on entry, and
              nothing here is mandatory — the app is browsable without it. */}
          {router.canGoBack() && claim === 'idle' && (
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.skipBtn}>
              <Text style={[styles.skipText, isRTL && styles.rtl]}>{t('notNow')}</Text>
            </Pressable>
          )}

          {/* Restore + legal links (Apple requires restore + Terms + Privacy).
              The line above it matters more than it looks: with no account, a
              reinstall gets a fresh anonymous store id and premium reads as
              locked until the subscriber taps restore. This is the only thing
              telling them why — without it a paying user thinks they were
              charged for nothing. Hidden once premium is already active. */}
          {!isPremium && (
            <Text style={[styles.restorePrompt, isRTL && styles.rtl]}>{t('restorePrompt')}</Text>
          )}
          <Pressable onPress={onRestore} hitSlop={8} style={styles.restoreBtn}>
            <Text style={[styles.restoreText, { color: accent }]}>{t('restorePurchases')}</Text>
          </Pressable>
          {/* Hidden once premium is active — nothing left to redeem. */}
          {!isPremium && (
            <Pressable onPress={onRedeem} hitSlop={8} style={styles.redeemBtn}>
              <Text style={styles.redeemText}>{t('redeemCode')}</Text>
            </Pressable>
          )}
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

  includes: { marginBottom: 20 },
  includesTitle: {
    color: NightPalette.amber,
    fontSize: 11,
    fontFamily: FONT.bold,
    lineHeight: 16,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  featRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 9 },
  featDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 8 },
  featText: { flex: 1, color: NightPalette.textPrimary, fontSize: 13, lineHeight: 21 },

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
  trialNote: { fontSize: 13, fontFamily: FONT.medium, lineHeight: 20, marginTop: 8 },
  cta: { borderRadius: 999, paddingVertical: 15, alignItems: 'center', marginTop: 18 },
  ctaText: { color: NightPalette.voidBlack, fontSize: 15, fontFamily: FONT.bold, lineHeight: 22 },
  ctaBusy: { opacity: 0.92 },
  ctaBusyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },

  countdownWrap: { marginTop: 16 },
  countdownLabel: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18, marginBottom: 8 },
  countdownRow: { flexDirection: 'row', gap: 8 },
  cdBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(242,201,166,0.25)',
    backgroundColor: 'rgba(10,5,3,0.5)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  cdNum: { color: '#F2C9A6', fontSize: 22, fontFamily: FONT.bold, lineHeight: 28 },
  cdLabel: { color: NightPalette.dimText, fontSize: 10, lineHeight: 14, marginTop: 2 },
  countdownFoot: { color: NightPalette.dimText, fontSize: 11, lineHeight: 16, marginTop: 10 },
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
  skipBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 6 },
  skipText: { color: NightPalette.dimText, fontSize: 14, fontFamily: FONT.medium, lineHeight: 20 },
  restorePrompt: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: NightPalette.dimText,
    paddingHorizontal: 12,
  },
  restoreBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  redeemBtn: { alignItems: 'center', paddingVertical: 8 },
  redeemText: { fontSize: 13, lineHeight: 20, color: NightPalette.dimText },
  restoreText: { fontSize: 14, fontFamily: FONT.medium, lineHeight: 20 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 2 },
  legalLink: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18, textDecorationLine: 'underline' },
  legalDot: { color: NightPalette.dimText, fontSize: 12 },
});
