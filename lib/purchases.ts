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
 * ── ACTIVATION — iOS (once, to start charging) ───────────────────────────────
 *   1. RevenueCat: create the project + iOS app, copy the PUBLIC iOS API key
 *      into .env  →  EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
 *   2. App Store Connect → create auto-renewable subscriptions in ONE group:
 *        namflix.premium.monthly   ($4.99 / month)
 *        namflix.premium.yearly    ($39.99 / year)
 *   3. RevenueCat: entitlement "premium"; one offering ("default") whose
 *      packages point at the two products above.
 *   4. Sign the Paid Applications Agreement + banking/tax in App Store Connect.
 *   5. New EAS build, submit WITH the IAP products for review.
 *
 * ── ACTIVATION — Android (Google Play) ───────────────────────────────────────
 *   1. Google Play Console → create the two subscriptions with the SAME ids
 *      (namflix.premium.monthly / .yearly). Product ids are shared across
 *      stores in RevenueCat's offering, so reuse them.
 *   2. RevenueCat: add a Play Store app to the same project, connect it with a
 *      Google Play service-account credential, and attach BOTH products to the
 *      existing "premium" entitlement + "default" offering.
 *   3. Copy the PUBLIC Android API key (starts goog_) into .env  →
 *        EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
 *   4. EAS build (android) + `eas submit --platform android`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// RevenueCat's native billing module can't reach the store inside Expo Go, so
// `configure()` throws "Invalid API key" and spams a red console error. Detect
// Expo Go and skip the SDK there entirely — the free Lifetime offer is
// app-side and still works. Dev-client and production builds are unaffected.
const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === 'expo';

// `lifetime` is a NON-consumable one-off, not a subscription — it rides the same
// purchase path because RevenueCat serves it as just another package in the
// current offering. Keep it last in PLAN_ORDER so the paywall reads
// yearly → monthly → lifetime.
export type PaidPlan = 'monthly' | 'yearly' | 'lifetime';

export const PRODUCT_IDS: Record<PaidPlan, string> = {
  monthly: 'namflix.premium.monthly',
  yearly: 'namflix.premium.yearly',
  lifetime: 'namflix.premium.lifetime',
};

/** Display order on the paywall — best value first. */
const PLAN_ORDER: readonly PaidPlan[] = ['yearly', 'monthly', 'lifetime'];

/** The RevenueCat entitlement that means "premium unlocked". */
export const ENTITLEMENT_ID = 'premium';

/**
 * An introductory free trial, as the store reports it. Only ever populated from
 * StoreKit/Play — never assumed — so the paywall cannot advertise a trial that
 * the product does not actually carry (Guideline 3.1.2(a) / 2.3.1).
 */
export type FreeTrial = {
  /** How many units the trial runs for, e.g. 7. */
  count: number;
  /** The unit the store reported. */
  unit: 'day' | 'week' | 'month' | 'year';
};

/** A plan the user can actually buy right now, with its store-formatted price. */
export type PurchasablePlan = {
  plan: PaidPlan;
  priceString: string; // ALWAYS from StoreKit, never hardcoded
  /**
   * The same amount as a number, in the store's local currency. Carried only so
   * the paywall can DERIVE a saving ("save 58%") by comparing two real store
   * prices. Never rendered directly — `priceString` is the formatted one.
   */
  price: number;
  /** Present only when the store offers a zero-price introductory period. */
  trial?: FreeTrial;
};

/** Read a free (price 0) introductory offer off a store product, if any. */
function readFreeTrial(product: {
  introPrice?: { price: number; periodUnit?: string; periodNumberOfUnits?: number } | null;
}): FreeTrial | undefined {
  const intro = product.introPrice;
  if (!intro || intro.price !== 0) return undefined;
  const unit = String(intro.periodUnit ?? '').toLowerCase();
  if (unit !== 'day' && unit !== 'week' && unit !== 'month' && unit !== 'year') return undefined;
  const count = intro.periodNumberOfUnits ?? 0;
  return count > 0 ? { count, unit } : undefined;
}

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'cancelled' | 'error'; message?: string };

// RevenueCat is a native module; require it lazily so this file can be imported
// (and bundled into an OTA update) even on a build that predates the module.
type PurchasesModule = typeof import('react-native-purchases').default;
let Purchases: PurchasesModule | null = null;
let ready = false;

function loadSdk(): PurchasesModule | null {
  if (IS_EXPO_GO) return null; // native store unavailable in Expo Go
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

/**
 * The public RevenueCat API key for the platform we're running on.
 * iOS keys start `appl_`, Android (Google Play) keys start `goog_`. Each store
 * needs its own key; using the wrong one makes `configure()` silently useless.
 */
function platformApiKey(): string | undefined {
  return Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
}

/** Initialise the store SDK. No-ops safely when key or native module is absent. */
export async function configurePurchases(): Promise<boolean> {
  if (ready) return true; // idempotent: configure once, then only re-identify
  const key = platformApiKey();
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
    for (const plan of PLAN_ORDER) {
      const pkg = packages.find((p) => p.product.identifier === PRODUCT_IDS[plan]);
      if (pkg) {
        out.push({
          plan,
          priceString: pkg.product.priceString,
          price: pkg.product.price,
          trial: readFreeTrial(pkg.product),
        });
      }
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


/**
 * Whether an offer code can be redeemed from inside the app.
 *
 * iOS only. StoreKit provides a native redemption sheet; Play has no in-app
 * equivalent, so on Android the code is redeemed in the Play Store app itself
 * and the entitlement arrives on the next entitlement sync.
 */
export function canRedeemInApp(): boolean {
  return Platform.OS === 'ios' && ready && Purchases != null;
}

/**
 * Show Apple's offer-code redemption sheet.
 *
 * Apple owns the whole flow — we never see or validate the code, which is the
 * point: codes are created, limited and REVOKED from App Store Connect, so a
 * giveaway can be switched off without shipping a build. Redemption is silent
 * to us, so the caller re-reads the entitlement afterwards rather than trusting
 * a return value.
 */
export async function redeemOfferCode(): Promise<PurchaseResult> {
  if (!canRedeemInApp() || !Purchases) return { ok: false, reason: 'unavailable' };
  try {
    await Purchases.presentCodeRedemptionSheet();
    // The sheet resolves as soon as it is dismissed, redeemed or not, so ask
    // the store what actually changed instead of assuming success.
    await Purchases.invalidateCustomerInfoCache();
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] != null
      ? { ok: true }
      : { ok: false, reason: 'cancelled' };
  } catch (e: unknown) {
    return { ok: false, reason: 'error', message: (e as { message?: string })?.message };
  }
}
