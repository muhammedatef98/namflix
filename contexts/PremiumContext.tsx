import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAppConfig, DEFAULT_CONFIG, type AppConfig } from '@/lib/remoteConfig';
import {
  configurePurchases,
  hasActiveEntitlement,
  getPurchasablePlans,
  buyPlan as iapBuyPlan,
  restorePurchases as iapRestore,
  type PaidPlan,
  type PurchasablePlan,
  type PurchaseResult,
} from '@/lib/purchases';

const PLAN_KEY = 'namflix.plan';

/**
 * Entitlement plans. `lifetime-free` is the launch offer (granted locally).
 * `monthly`/`yearly` are the paid App Store subscriptions — premium for those
 * comes from RevenueCat's entitlement (`storePremium`), the source of truth, so
 * it survives reinstalls and works across the user's devices.
 */
export type Plan = 'monthly' | 'yearly' | 'lifetime-free';

type PremiumValue = {
  plan: Plan | null;
  isPremium: boolean;
  loading: boolean;
  /** Admin-controlled remote config (lifetime mode + display prices). */
  config: AppConfig;
  /** Paid plans that can actually be bought now, with real StoreKit prices. */
  purchasablePlans: PurchasablePlan[];
  /** Grant the free lifetime plan (the launch offer). */
  unlockLifetimeFree: () => Promise<void>;
  /** Buy a paid App Store plan; refreshes entitlement on success. */
  purchase: (plan: PaidPlan) => Promise<PurchaseResult>;
  /** Restore a previous App Store purchase. */
  restore: () => Promise<PurchaseResult>;
  /** Clear the local entitlement (used on sign-out / testing). */
  clearPlan: () => Promise<void>;
};

const PremiumContext = createContext<PremiumValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [storePremium, setStorePremium] = useState(false);
  const [purchasablePlans, setPurchasablePlans] = useState<PurchasablePlan[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(PLAN_KEY)
      .then((saved) => {
        if (saved === 'monthly' || saved === 'yearly' || saved === 'lifetime-free') setPlan(saved);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  // Pull the admin config once at launch; failures keep DEFAULT_CONFIG (free).
  useEffect(() => {
    fetchAppConfig().then(setConfig).catch(() => undefined);
  }, []);

  // Bring up the App Store SDK, then sync entitlement + real prices. All calls
  // no-op safely when IAP isn't configured, leaving the free offer intact.
  useEffect(() => {
    let cancelled = false;
    configurePurchases().then(async (ok) => {
      if (!ok || cancelled) return;
      const [active, plans] = await Promise.all([hasActiveEntitlement(), getPurchasablePlans()]);
      if (cancelled) return;
      setStorePremium(active);
      setPurchasablePlans(plans);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const purchase = useCallback(async (paid: PaidPlan): Promise<PurchaseResult> => {
    const res = await iapBuyPlan(paid);
    if (res.ok) setStorePremium(true);
    return res;
  }, []);

  const restore = useCallback(async (): Promise<PurchaseResult> => {
    const res = await iapRestore();
    if (res.ok) setStorePremium(true);
    return res;
  }, []);

  const value = useMemo<PremiumValue>(
    () => ({
      plan,
      isPremium: plan != null || storePremium,
      loading,
      config,
      purchasablePlans,
      unlockLifetimeFree: async () => {
        setPlan('lifetime-free');
        await AsyncStorage.setItem(PLAN_KEY, 'lifetime-free').catch(() => undefined);
      },
      purchase,
      restore,
      clearPlan: async () => {
        setPlan(null);
        await AsyncStorage.removeItem(PLAN_KEY).catch(() => undefined);
      },
    }),
    [plan, storePremium, loading, config, purchasablePlans, purchase, restore],
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
