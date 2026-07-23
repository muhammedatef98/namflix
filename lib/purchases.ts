/**
 * In-App Purchase abstraction (Apple StoreKit / Google Play Billing).
 *
 * Real subscription charging on iOS MUST go through Apple's In-App Purchase —
 * you cannot take card payments for digital goods in an App Store app. That
 * requires three things this codebase can't provide on its own:
 *   1. A StoreKit-backed native module (we recommend `react-native-purchases`,
 *      RevenueCat) added via its Expo config plugin, then a NEW native build
 *      (EAS build / prebuild) — it will NOT run in Expo Go or a dev client that
 *      was built before the module was added.
 *   2. Auto-renewable subscription products created in App Store Connect
 *      (product IDs below) and mapped to a RevenueCat "premium" entitlement.
 *   3. A paid Apple Developer account + sandbox tester to test the flow.
 *
 * Until those exist, `iapAvailable` is false and `buyPlan` reports
 * `unavailable`, so the paywall keeps working everywhere and the free Lifetime
 * offer is the live path. When you're ready, follow ACTIVATION below.
 *
 * ── ACTIVATION ──────────────────────────────────────────────────────────────
 *   npx expo install react-native-purchases
 *   // add the plugin to app.json → "plugins": ["react-native-purchases"]
 *   // create products in App Store Connect:
 *   //   namflix.premium.monthly  ($4.99 / month)
 *   //   namflix.premium.yearly   ($39.99 / year)
 *   // in RevenueCat: one entitlement "premium", one offering with both packages
 *   // then replace the body of configure()/buyPlan() with the RevenueCat calls
 *   //   (Purchases.configure({ apiKey }), getOfferings(), purchasePackage()),
 *   //   and set iapAvailable = true.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PaidPlan = 'monthly' | 'yearly';

export const PRODUCT_IDS: Record<PaidPlan, string> = {
  monthly: 'namflix.premium.monthly',
  yearly: 'namflix.premium.yearly',
};

export type PurchaseResult =
  | { ok: true; plan: PaidPlan }
  | { ok: false; reason: 'unavailable' | 'cancelled' | 'error'; message?: string };

/** Flip to true once react-native-purchases is installed and configured. */
export const iapAvailable = false;

/** Initialise the store SDK (no-op until IAP is activated). */
export async function configurePurchases(): Promise<void> {
  // e.g. Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY! });
}

/** Attempt to buy a paid plan through the App Store. */
export async function buyPlan(plan: PaidPlan): Promise<PurchaseResult> {
  if (!iapAvailable) return { ok: false, reason: 'unavailable' };
  // Activated implementation (RevenueCat):
  //   const offerings = await Purchases.getOfferings();
  //   const pkg = offerings.current?.availablePackages.find(p => p.product.identifier === PRODUCT_IDS[plan]);
  //   const { customerInfo } = await Purchases.purchasePackage(pkg);
  //   return customerInfo.entitlements.active['premium']
  //     ? { ok: true, plan }
  //     : { ok: false, reason: 'error' };
  return { ok: false, reason: 'unavailable' };
}

/** Restore a previous purchase (App Store "Restore Purchases"). */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!iapAvailable) return { ok: false, reason: 'unavailable' };
  return { ok: false, reason: 'unavailable' };
}
