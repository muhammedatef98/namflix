/**
 * Google Mobile Ads (AdMob) wrapper — the only file that touches the SDK.
 *
 * LAZY BY DESIGN: the native module is required on first use, and the SDK is
 * initialised only when an ad is first needed (the first "watch ad" tap).
 * Nothing runs at app launch, so launch time is untouched and no consent / ATT
 * dialog ever greets someone opening the app in bed.
 *
 * SAFE-BY-DEFAULT (same pattern as lib/purchases.ts): if the native module
 * isn't in the running binary (Expo Go, or an OTA update on an older build)
 * every call reports "unavailable" and the UI falls back to the paywall.
 *
 * Every load and show resolves — with a timeout — so callers can never be left
 * waiting on an SDK callback that doesn't come.
 */
import { Platform } from 'react-native';
import type * as GMA from 'react-native-google-mobile-ads';

type GmaModule = typeof GMA;
type TrackingModule = typeof import('expo-tracking-transparency');

const LOAD_TIMEOUT_MS = 15_000;
/** Safety net if CLOSED never arrives after show() (should not happen). */
const SHOW_TIMEOUT_MS = 3 * 60_000;
/** Google invalidates loaded ads after one hour; refresh a little earlier. */
const AD_MAX_AGE_MS = 55 * 60_000;

let gma: GmaModule | null | undefined;

function loadGma(): GmaModule | null {
  if (gma !== undefined) return gma;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    gma = require('react-native-google-mobile-ads') as GmaModule;
  } catch {
    gma = null;
  }
  return gma;
}

function loadTracking(): TrackingModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-tracking-transparency') as TrackingModule;
  } catch {
    return null;
  }
}

/** The ads native module is present in this binary. Does not initialise anything. */
export function isAdsSdkAvailable(): boolean {
  return loadGma() !== null;
}

// ── Consent + initialisation ────────────────────────────────────────────────

export type AdsReadiness = {
  /** UMP says ads may be requested (consent obtained or not required). */
  canRequestAds: boolean;
  /** Serve non-personalised ads only (consent or tracking declined). */
  nonPersonalized: boolean;
};

let initialized = false;
let preparing: Promise<AdsReadiness> | null = null;
let readiness: AdsReadiness | null = null;

/** True once consent was gathered and the SDK initialised in this process. */
export function isAdsInitialized(): boolean {
  return initialized;
}

export function currentReadiness(): AdsReadiness | null {
  return readiness;
}

/**
 * iOS App Tracking Transparency. Asked once, right before the first ad request
 * — never at launch. Returns whether tracking is allowed.
 */
async function ensureTrackingPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  const att = loadTracking();
  if (!att) return false;
  try {
    const current = await att.getTrackingPermissionsAsync();
    if (current.status === 'undetermined' && current.canAskAgain) {
      return (await att.requestTrackingPermissionsAsync()).granted;
    }
    return current.granted;
  } catch {
    return false;
  }
}

async function doPrepare(): Promise<AdsReadiness> {
  const sdk = loadGma();
  if (!sdk) return { canRequestAds: false, nonPersonalized: true };

  // 1) Google UMP: shows the GDPR/EEA (and US-state) message only where
  //    required, and only once — afterwards this resolves from cache.
  let canRequestAds = false;
  let personalisedAllowed = true;
  try {
    const info = await sdk.AdsConsent.gatherConsent();
    canRequestAds = info.canRequestAds;
  } catch {
    // Network hiccup: a consent decision from an earlier session still counts.
    const info = await sdk.AdsConsent.getConsentInfo().catch(() => null);
    canRequestAds = info?.canRequestAds ?? false;
  }
  try {
    if (await sdk.AdsConsent.getGdprApplies()) {
      personalisedAllowed = (await sdk.AdsConsent.getUserChoices()).selectPersonalisedAds;
    }
  } catch {
    personalisedAllowed = false;
  }

  // 2) iOS ATT, after UMP (Google's recommended order).
  const trackingAllowed = canRequestAds ? await ensureTrackingPermission() : false;

  // 3) Initialise the SDK. Declined consent/tracking still gets ads — just
  //    non-personalised ones. Nothing here ever blocks using the app.
  if (canRequestAds && !initialized) {
    try {
      await sdk.default().setRequestConfiguration({
        // A calm sleep app: keep ad content family-friendly.
        maxAdContentRating: sdk.MaxAdContentRating.PG,
      });
      await sdk.default().initialize();
      initialized = true;
    } catch {
      canRequestAds = false;
    }
  }

  return { canRequestAds, nonPersonalized: !personalisedAllowed || !trackingAllowed };
}

/** Gather consent (UMP), ask ATT (iOS), initialise the SDK. Idempotent. */
export function prepareAds(): Promise<AdsReadiness> {
  if (!preparing) {
    preparing = doPrepare().then((r) => {
      readiness = r;
      if (!r.canRequestAds) preparing = null; // allow a later retry
      return r;
    });
  }
  return preparing;
}

/** Whether to show an "Ad privacy choices" entry (required by UMP in some regions). */
export async function privacyOptionsRequired(): Promise<boolean> {
  if (!initialized) return false; // never load the SDK just to answer this
  const sdk = loadGma();
  if (!sdk) return false;
  try {
    const info = await sdk.AdsConsent.getConsentInfo();
    return info.privacyOptionsRequirementStatus === sdk.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  } catch {
    return false;
  }
}

export async function showPrivacyOptions(): Promise<void> {
  const sdk = loadGma();
  if (!sdk) return;
  try {
    await sdk.AdsConsent.showPrivacyOptionsForm();
    // Choices may have changed — re-derive personalisation on next request.
    preparing = null;
    readiness = null;
  } catch {
    // ignore
  }
}

// ── Loading / showing ───────────────────────────────────────────────────────

export type ShowResult = { shown: boolean; earned: boolean };

export type LoadedAd = {
  loadedAt: number;
  /** Present the ad full screen; resolves when it's dismissed (or fails). */
  show: () => Promise<ShowResult>;
};

type Unsubscribe = () => void;

/** Shape shared by RewardedAd and InterstitialAd that we rely on. */
type FullScreenAd = {
  load: () => void;
  show: () => Promise<void>;
  addAdEventListener: (type: never, listener: (payload?: unknown) => void) => Unsubscribe;
};

function listen(ad: FullScreenAd, type: string, fn: (payload?: unknown) => void): Unsubscribe {
  return ad.addAdEventListener(type as never, fn);
}

function wrapLoaded(sdk: GmaModule, ad: FullScreenAd, rewarded: boolean): LoadedAd {
  return {
    loadedAt: Date.now(),
    show: () =>
      new Promise<ShowResult>((resolve) => {
        let earned = false;
        let opened = false;
        const unsubs: Unsubscribe[] = [];
        const finish = (shown: boolean) => {
          clearTimeout(timer);
          unsubs.forEach((u) => u());
          resolve({ shown, earned });
        };
        const timer = setTimeout(() => finish(opened), SHOW_TIMEOUT_MS);
        if (rewarded) {
          unsubs.push(listen(ad, sdk.RewardedAdEventType.EARNED_REWARD, () => (earned = true)));
        }
        unsubs.push(listen(ad, sdk.AdEventType.OPENED, () => (opened = true)));
        unsubs.push(listen(ad, sdk.AdEventType.CLOSED, () => finish(true)));
        unsubs.push(listen(ad, sdk.AdEventType.ERROR, () => finish(opened)));
        ad.show().catch(() => finish(false));
      }),
  };
}

function loadFullScreen(
  format: 'rewarded' | 'interstitial',
  unitId: string,
  nonPersonalized: boolean,
): Promise<LoadedAd | null> {
  const sdk = loadGma();
  if (!sdk || !initialized) return Promise.resolve(null);
  return new Promise<LoadedAd | null>((resolve) => {
    const unsubs: Unsubscribe[] = [];
    let settled = false;
    const finish = (value: LoadedAd | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubs.forEach((u) => u());
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), LOAD_TIMEOUT_MS);
    try {
      const options = { requestNonPersonalizedAdsOnly: nonPersonalized };
      const ad = (
        format === 'rewarded'
          ? sdk.RewardedAd.createForAdRequest(unitId, options)
          : sdk.InterstitialAd.createForAdRequest(unitId, options)
      ) as unknown as FullScreenAd;
      const loadedEvent =
        format === 'rewarded' ? sdk.RewardedAdEventType.LOADED : sdk.AdEventType.LOADED;
      unsubs.push(listen(ad, loadedEvent, () => finish(wrapLoaded(sdk, ad, format === 'rewarded'))));
      unsubs.push(listen(ad, sdk.AdEventType.ERROR, () => finish(null)));
      ad.load();
    } catch {
      finish(null);
    }
  });
}

/**
 * One cached ad per format, so a preloaded ad starts instantly. `acquire`
 * hands out the cached ad (if fresh) or loads a new one; either way the cache
 * is emptied, because an ad can only be shown once.
 */
function createAdSlot(format: 'rewarded' | 'interstitial') {
  let pending: Promise<LoadedAd | null> | null = null;

  const fresh = (ad: LoadedAd | null) => ad != null && Date.now() - ad.loadedAt < AD_MAX_AGE_MS;

  return {
    preload(unitId: string, nonPersonalized: boolean): void {
      if (pending) return;
      const p = loadFullScreen(format, unitId, nonPersonalized);
      pending = p;
      p.then((ad) => {
        if (pending === p && !ad) pending = null; // failed preload — allow a retry
      });
    },
    async acquire(unitId: string, nonPersonalized: boolean): Promise<LoadedAd | null> {
      const cached = pending;
      pending = null;
      if (cached) {
        const ad = await cached;
        if (fresh(ad)) return ad;
      }
      return loadFullScreen(format, unitId, nonPersonalized);
    },
    /** Take the cached ad only if it is already loaded — never waits on the network. */
    async takeIfReady(): Promise<LoadedAd | null> {
      const cached = pending;
      if (!cached) return null;
      const ad = await Promise.race([cached, Promise.resolve(undefined)]);
      if (ad === undefined) return null; // still loading
      pending = null;
      return fresh(ad) ? ad : null;
    },
    clear(): void {
      pending = null;
    },
  };
}

export const rewardedSlot = createAdSlot('rewarded');
export const interstitialSlot = createAdSlot('interstitial');
