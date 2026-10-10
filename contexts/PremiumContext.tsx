import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidLifetimeCode } from '@/lib/redeemCodes';
import { fetchAppConfig, DEFAULT_CONFIG, type AppConfig } from '@/lib/remoteConfig';
import {
  configurePurchases,
  hasActiveEntitlement,
  getPurchasablePlans,
  onEntitlementChange,
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
  /**
   * Redeem a lifetime code typed into the paywall. Returns whether the code was
   * valid; the caller owns the message, since a wrong code is a normal typo and
   * not an error worth throwing.
   */
  redeemLifetimeCode: (code: string) => Promise<boolean>;
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

  // Bring up the store SDK, then sync entitlement + real prices. There is no
  // app-level account to alias to: RevenueCat keys the entitlement to the store
  // account (Apple ID / Google account), which is what "Restore purchases"
  // reads. All calls no-op safely when IAP isn't configured (Expo Go).
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: () => void = () => undefined;
    (async () => {
      const ok = await configurePurchases(); // idempotent
      if (!ok || cancelled) return;
      // Live updates: subscribing anywhere flips premium (and removes ads) at once.
      unsubscribe = onEntitlementChange((active) => {
        if (!cancelled) setStorePremium(active);
      });
      const [active, plans] = await Promise.all([hasActiveEntitlement(), getPurchasablePlans()]);
      if (cancelled) return;
      setStorePremium(active);
      setPurchasablePlans(plans);
    })();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Local grant, on device. Without an app account there is no identity to hang
  // a server-side entitlement on, so the claim lives in storage and does not
  // survive a reinstall — acceptable for a giveaway, and the same trade the
  // launch offer already makes.
  const grantLifetimeFree = useCallback(async () => {
    setPlan('lifetime-free');
    await AsyncStorage.setItem(PLAN_KEY, 'lifetime-free').catch(() => undefined);
  }, []);

  const redeemLifetimeCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!isValidLifetimeCode(code)) return false;
      await grantLifetimeFree();
      return true;
    },
    [grantLifetimeFree],
  );

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
      unlockLifetimeFree: grantLifetimeFree,
      redeemLifetimeCode,
      purchase,
      restore,
      clearPlan: async () => {
        setPlan(null);
        await AsyncStorage.removeItem(PLAN_KEY).catch(() => undefined);
      },
    }),
    [
      plan,
      storePremium,
      loading,
      config,
      purchasablePlans,
      grantLifetimeFree,
      redeemLifetimeCode,
      purchase,
      restore,
    ],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}

