import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useAds } from '@/contexts/AdsContext';
import { itemIdForRoute } from '@/lib/ads/items';
import { hoursLeftLabel } from '@/lib/i18n';

/**
 * The central gate every locked entry point goes through. `open(route)`
 * navigates when the user is premium OR has a live rewarded unlock for that
 * item; otherwise it shows the lock sheet (Premium / watch an ad) — or, when
 * ads aren't available, the paywall exactly as before.
 */
export function useFeatureGate() {
  const { isPremium } = usePremium();
  const { lang } = useLocale();
  const { isTemporarilyUnlocked, unlockRemainingMs, requestUnlock } = useAds();
  const router = useRouter();

  const isUnlocked = useCallback(
    (route: string) => isPremium || isTemporarilyUnlocked(itemIdForRoute(route)),
    [isPremium, isTemporarilyUnlocked],
  );

  /** "18h left" badge for an item opened by a rewarded ad; null otherwise. */
  const unlockBadge = useCallback(
    (route: string): string | null => {
      if (isPremium) return null;
      const ms = unlockRemainingMs(itemIdForRoute(route));
      return ms > 0 ? hoursLeftLabel(ms, lang) : null;
    },
    [isPremium, unlockRemainingMs, lang],
  );

  const open = useCallback(
    (route: string) => {
      if (isUnlocked(route)) router.push(route as never);
      else requestUnlock(route);
    },
    [isUnlocked, requestUnlock, router],
  );

  return { isPremium, isUnlocked, unlockBadge, open };
}

/**
 * Warm up a rewarded ad while a screen with locked content is focused, so
 * "watch an ad" starts quickly. No-op for premium users, and until the user
 * has gone through consent once (preloading never triggers a prompt).
 */
export function usePreloadRewardedOnFocus(): void {
  const { isPremium } = usePremium();
  const { preloadRewarded } = useAds();
  useFocusEffect(
    useCallback(() => {
      if (!isPremium) preloadRewarded();
    }, [isPremium, preloadRewarded]),
  );
}
