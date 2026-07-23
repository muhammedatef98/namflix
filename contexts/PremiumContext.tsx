import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAN_KEY = 'namflix.plan';

/**
 * Entitlement plans. `lifetime-free` is the launch offer — full access at no
 * cost, to get the app into people's hands fast. `monthly`/`yearly` are the
 * paid tiers; charging them requires native In-App Purchase (StoreKit /
 * RevenueCat) wired at the store level, so here they're modelled but only the
 * free lifetime unlock is granted locally.
 */
export type Plan = 'monthly' | 'yearly' | 'lifetime-free';

type PremiumValue = {
  plan: Plan | null;
  isPremium: boolean;
  loading: boolean;
  /** Grant the free lifetime plan (the launch offer). */
  unlockLifetimeFree: () => Promise<void>;
  /** Clear the entitlement (used on sign-out / testing). */
  clearPlan: () => Promise<void>;
};

const PremiumContext = createContext<PremiumValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(PLAN_KEY)
      .then((saved) => {
        if (saved === 'monthly' || saved === 'yearly' || saved === 'lifetime-free') setPlan(saved);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<PremiumValue>(
    () => ({
      plan,
      isPremium: plan != null,
      loading,
      unlockLifetimeFree: async () => {
        setPlan('lifetime-free');
        await AsyncStorage.setItem(PLAN_KEY, 'lifetime-free').catch(() => undefined);
      },
      clearPlan: async () => {
        setPlan(null);
        await AsyncStorage.removeItem(PLAN_KEY).catch(() => undefined);
      },
    }),
    [plan, loading],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}

/**
 * Returns an `open(route)` that navigates to a locked feature only when the
 * user is premium; otherwise it sends them to the paywall. Central gate so
 * every feature surface stays consistent — one tap through the free Lifetime
 * offer unlocks them all.
 */
export function useFeatureGate() {
  const { isPremium } = usePremium();
  const router = useRouter();
  return {
    isPremium,
    open: (route: string) => router.push((isPremium ? route : '/premium') as never),
  };
}
