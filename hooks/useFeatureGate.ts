import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useAds } from '@/contexts/AdsContext';
import { isFreeRoute } from '@/lib/freeTier';
import { itemIdForRoute } from '@/lib/ads/items';
import { hoursLeftLabel } from '@/lib/i18n';

/**
 * The single navigation gate. A route is open when the user is premium, when
 * it is part of the permanently free tier (`lib/freeTier.ts`), or when a
 * rewarded ad unlocked that one item for a while. `open(route)` navigates in
 * those cases and otherwise shows the lock sheet (Premium / watch an ad) — or,
 * when ads aren't available, the paywall exactly as before. `isLocked(route)`
 * answers the same question for padlock badges, so what a card shows and what
 * tapping it does can never disagree.
 */
export function useFeatureGate() {
  const { isPremium } = usePremium();
  const { lang } = useLocale();
  const { isTemporarilyUnlocked, unlockRemainingMs, requestUnlock } = useAds();
  const router = useRouter();

  const isUnlocked = useCallback(
    (route: string) =>
      isPremium || isFreeRoute(route) || isTemporarilyUnlocked(itemIdForRoute(route)),
    [isPremium, isTemporarilyUnlocked],
  );

  const isLocked = useCallback((route: string) => !isUnlocked(route), [isUnlocked]);

  /** "18h left" badge for an item opened by a rewarded ad; null otherwise. */
  const unlockBadge = useCallback(
    (route: string): string | null => {
      if (isPremium || isFreeRoute(route)) return null;
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

  return { isPremium, isUnlocked, isLocked, unlockBadge, open };
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
