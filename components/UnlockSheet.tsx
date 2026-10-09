import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NightPalette, FONT } from '@/constants/theme';
import { hoursPhrase } from '@/lib/i18n';

export type UnlockPhase = 'idle' | 'loading' | 'no_fill' | 'cap';

type Props = {
  phase: UnlockPhase;
  unlockHours: number;
  onPremium: () => void;
  onWatchAd: () => void;
  onClose: () => void;
};

/**
 * Bottom sheet shown when a free user taps locked content: unlock with
 * Premium, or watch one short rewarded ad to open that item for 24 hours.
 * Deliberately quiet — dark surfaces, no bright colours — because it may
 * appear at night. While an ad loads the sheet can't be dismissed (so a late
 * ad can't pop up over an unrelated screen); every load times out, so the
 * loading state always ends.
 */
export function UnlockSheet({ phase, unlockHours, onPremium, onWatchAd, onClose }: Props) {
  const { t, lang, isRTL } = useLocale();
  const { accent } = useTheme();
  const insets = useSafeAreaInsets();
  const loading = phase === 'loading';
  const capped = phase === 'cap';
  const hours = hoursPhrase(unlockHours, lang);

  // Android back closes the sheet (except mid-load, see above).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!loading) onClose();
      return true;
    });
    return () => sub.remove();
  }, [loading, onClose]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onClose} accessibilityLabel={t('adNotNow')} />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.duration(260)}
        style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}
        accessibilityViewIsModal
      >
        <View style={styles.handle} />
        <Text style={[styles.title, isRTL && styles.rtl]}>{t('lockTitle')}</Text>
        <Text style={[styles.sub, isRTL && styles.rtl]}>
          {capped ? t('adDailyCap') : t('lockSub').replace('{hours}', hours)}
        </Text>

        <Pressable
          onPress={onPremium}
          disabled={loading}
          style={({ pressed }) => [styles.primary, { borderColor: accent }, (pressed || loading) && styles.dim]}
        >
          <Text style={[styles.primaryText, { color: accent }]}>
            {capped ? t('goPremiumNoAds') : t('unlockWithPremium')}
          </Text>
        </Pressable>

        {!capped && (
          <Pressable
            onPress={onWatchAd}
            disabled={loading}
            style={({ pressed }) => [styles.ghost, pressed && styles.dim]}
            accessibilityState={{ busy: loading }}
          >
            {loading ? (
              <View style={[styles.loadingRow, isRTL && styles.rowRTL]}>
                <ActivityIndicator size="small" color={NightPalette.dimText} />
                <Text style={styles.ghostText}>{t('adLoading')}</Text>
              </View>
            ) : (
              <Text style={[styles.ghostText, styles.centered]}>{t('watchAdUnlock').replace('{hours}', hours)}</Text>
            )}
          </Pressable>
        )}

        {phase === 'no_fill' && (
          <Text style={[styles.notice, isRTL && styles.rtl]} accessibilityLiveRegion="polite">
            {t('adNoFill')}
          </Text>
        )}

        {!loading && (
          <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
            <Text style={styles.closeText}>{t('adNotNow')}</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,2,1,0.72)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#140A05',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(140,42,18,0.35)',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(242,201,166,0.18)',
    marginBottom: 18,
  },
  title: { color: '#F2C9A6', fontSize: 19, fontFamily: FONT.bold, lineHeight: 28, textAlign: 'center' },
  sub: { color: NightPalette.dimText, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  rtl: { writingDirection: 'rtl' },
  rowRTL: { flexDirection: 'row-reverse' },
  primary: {
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(74,26,10,0.55)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { fontSize: 15, fontFamily: FONT.bold, lineHeight: 22 },
  ghost: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.35)',
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  ghostText: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20, opacity: 0.85 },
  centered: { textAlign: 'center' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dim: { opacity: 0.6 },
  notice: { color: '#E0A878', fontSize: 12.5, lineHeight: 19, textAlign: 'center', marginTop: 14 },
  close: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  closeText: { color: NightPalette.dimText, fontSize: 13, lineHeight: 20 },
});
