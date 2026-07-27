/**
 * In-App Purchase layer (Apple StoreKit via RevenueCat / react-native-purchases).
 *
 * Digital subscriptions on iOS MUST go through Apple's In-App Purchase — you
 * cannot take card payments for them. This module wraps RevenueCat so the rest
 * of the app never touches the SDK directly.
 *
 * SAFE-BY-DEFAULT: every call is guarded. If the native module isn't in the
 * running binary (e.g. an OTA update landed on an older build) or the API key
 * is missing, `configure()` reports not-ready and the paywall simply shows the
 * free Lifetime offer with NO paid buttons — so Apple never sees a price with
 * no working purchase behind it (Guideline 2.1 / 3.1.2).
 *
 * ── ACTIVATION (once, to start charging) ─────────────────────────────────────
 *   1. RevenueCat: create the project + iOS app, copy the PUBLIC iOS API key
 *      into .env  →  EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
 *   2. App Store Connect → create auto-renewable subscriptions in ONE group:
 *        namflix.premium.monthly   ($4.99 / month)
 *        namflix.premium.yearly    ($39.99 / year)
 *   3. RevenueCat: entitlement "premium"; one offering ("default") whose
 *      packages point at the two products above.
 *   4. Sign the Paid Applications Agreement + banking/tax in App Store Connect.
 *   5. New EAS build, submit WITH the IAP products for review.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PaidPlan = 'monthly' | 'yearly';

export const PRODUCT_IDS: Record<PaidPlan, string> = {
  monthly: 'namflix.premium.monthly',
  yearly: 'namflix.premium.yearly',
};

/** The RevenueCat entitlement that means "premium unlocked". */
export const ENTITLEMENT_ID = 'premium';

/** A plan the user can actually buy right now, with its store-formatted price. */
export type PurchasablePlan = {
  plan: PaidPlan;
  priceString: string; // ALWAYS from StoreKit, never hardcoded
};

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'cancelled' | 'error'; message?: string };

// RevenueCat is a native module; require it lazily so this file can be imported
// (and bundled into an OTA update) even on a build that predates the module.
type PurchasesModule = typeof import('react-native-purchases').default;
let Purchases: PurchasesModule | null = null;
let ready = false;

function loadSdk(): PurchasesModule | null {
  if (Purchases) return Purchases;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Purchases = require('react-native-purchases').default as PurchasesModule;
    return Purchases;
  } catch {
    return null;
  }
}

/** True once configure() has succeeded against a real key + native module. */
export function isIapReady(): boolean {
  return ready;
}

/** Initialise the store SDK. No-ops safely when key or native module is absent. */
export async function configurePurchases(): Promise<boolean> {
  const key = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  if (!key) return false;
  const sdk = loadSdk();
  if (!sdk) return false;
  try {
    sdk.configure({ apiKey: key });
    ready = true;
    return true;
  } catch {
    return false;
  }
}

/** Whether the signed-in user currently holds the premium entitlement. */
export async function hasActiveEntitlement(): Promise<boolean> {
  if (!ready || !Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] != null;
  } catch {
    return false;
  }
}

/**
 * The plans the user can buy right now, each with its real StoreKit price.
 * Returns [] when the store isn't ready — so the paywall hides paid buttons
 * rather than ever showing a price that can't be purchased.
 */
export async function getPurchasablePlans(): Promise<PurchasablePlan[]> {
  if (!ready || !Purchases) return [];
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    const out: PurchasablePlan[] = [];
    for (const plan of ['yearly', 'monthly'] as PaidPlan[]) {
      const pkg = packages.find((p) => p.product.identifier === PRODUCT_IDS[plan]);
      if (pkg) out.push({ plan, priceString: pkg.product.priceString });
    }
    return out;
  } catch {
    return [];
  }
}

/** Buy a plan through the App Store. */
export async function buyPlan(plan: PaidPlan): Promise<PurchaseResult> {
  if (!ready || !Purchases) return { ok: false, reason: 'unavailable' };
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.product.identifier === PRODUCT_IDS[plan],
    );
    if (!pkg) return { ok: false, reason: 'unavailable' };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID]
      ? { ok: true }
      : { ok: false, reason: 'error' };
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err?.userCancelled) return { ok: false, reason: 'cancelled' };
    return { ok: false, reason: 'error', message: err?.message };
  }
}

/** Restore a previous purchase (Apple requires this control on the paywall). */
export async function restorePurchases(): Promise<PurchaseResult> {
  if (!ready || !Purchases) return { ok: false, reason: 'unavailable' };
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID]
      ? { ok: true }
      : { ok: false, reason: 'error' };
  } catch (e: unknown) {
    return { ok: false, reason: 'error', message: (e as { message?: string })?.message };
  }
}
