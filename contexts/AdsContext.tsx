import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'expo-router';
import { usePremium } from '@/contexts/PremiumContext';
import { usePlayback } from '@/contexts/PlaybackContext';
import { useMixer } from '@/contexts/MixerContext';
import { UnlockSheet, type UnlockPhase } from '@/components/UnlockSheet';
import { track, type PurchaseSource } from '@/lib/analytics';
import { adUnitId } from '@/lib/ads/config';
import { runInterstitialFlow, runRewardedFlow, type AdsFlowDeps, type RewardedOutcome } from '@/lib/ads/flows';
import { itemIdForRoute } from '@/lib/ads/items';
import {
  canShowAds as canShowAdsRule,
  initialAdsState,
  interstitialBlockReason,
  isUnlockActive,
  pruneExpiredUnlocks,
  rewardedCapReached,
  unlockRemainingMs as remainingMsRule,
  type AdsState,
  type InterstitialTrigger,
} from '@/lib/ads/rules';
import {
  interstitialSlot,
  isAdsInitialized,
  isAdsSdkAvailable,
  prepareAds,
  rewardedSlot,
} from '@/lib/ads/sdk';
import { loadAdsState, saveAdsState } from '@/lib/ads/storage';

/**
 * The ads layer for FREE users only. Premium users (any subscription or
 * Lifetime) get no "watch ad" option, no SDK initialisation and no ad
 * requests — every entry point checks `isPremium` before touching the SDK,
 * and flipping to premium mid-session tears everything down immediately.
 *
 * Nothing here runs at launch beyond reading a small local blob: the SDK,
 * the consent form and the ATT prompt all wait for the first time the user
 * chooses "watch a short ad".
 */

/** A session end only counts as a "natural break" for this long. */
const NATURAL_BREAK_WINDOW_MS = 2 * 60_000;
const TICK_MS = 60_000;

type AdsValue = {
  /** Ads may be shown to this user right now (free user + SDK in the binary). */
  canShowAds: () => boolean;
  isTemporarilyUnlocked: (itemId: string) => boolean;
  /** Milliseconds left on an item's rewarded unlock (0 when locked). */
  unlockRemainingMs: (itemId: string) => number;
  /** Play a rewarded ad that unlocks `itemId` for the configured hours. */
  showRewarded: (itemId: string) => Promise<RewardedOutcome>;
  /** Warm up a rewarded ad so it starts quickly (no-op until consent was given once). */
  preloadRewarded: () => void;
  /** Consider an interstitial at a natural break. Off unless ENABLE_INTERSTITIALS. */
  maybeShowInterstitial: (trigger: InterstitialTrigger) => Promise<boolean>;
  /** A tool/session screen was closed — feeds the interstitial session rules. */
  noteSessionEnded: () => void;
  /** Show the lock sheet (Premium / watch an ad) for a gated route. */
  requestUnlock: (route: string) => void;
};

const AdsContext = createContext<AdsValue | null>(null);

type SheetState = { route: string; itemId: string; phase: UnlockPhase } | null;

export function AdsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isPremium, config } = usePremium();
  const playback = usePlayback();
  const mixer = useMixer();

  const [adsState, setAdsStateRaw] = useState<AdsState>(() => initialAdsState(new Date()));
  const [now, setNow] = useState(() => new Date());
  const [sheet, setSheet] = useState<SheetState>(null);

  // Refs give the async flows the latest values without stale closures.
  const stateRef = useRef(adsState);
  const premiumRef = useRef(isPremium);
  const policyRef = useRef(config.ads);
  const playbackRef = useRef(playback);
  const mixerRef = useRef(mixer);
  const busyRef = useRef(false);
  const sessionEndedAtRef = useRef<number | null>(null);
  premiumRef.current = isPremium;
  policyRef.current = config.ads;
  playbackRef.current = playback;
  mixerRef.current = mixer;

  const setAdsState = useCallback((next: AdsState) => {
    stateRef.current = next;
    setAdsStateRaw(next);
    void saveAdsState(next);
  }, []);

  // Local-only read at startup; no SDK involved.
  useEffect(() => {
    let cancelled = false;
    loadAdsState(new Date()).then((loaded) => {
      if (cancelled) return;
      const pruned = pruneExpiredUnlocks(loaded, new Date());
      stateRef.current = pruned;
      setAdsStateRaw(pruned);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-render once a minute while something is temporarily unlocked, so the
  // "18h left" badges count down and expired items lock again on their own.
  const hasUnlocks = Object.keys(adsState.unlocks).length > 0;
  useEffect(() => {
    if (!hasUnlocks) return;
    const id = setInterval(() => {
      const t = new Date();
      setNow(t);
      const pruned = pruneExpiredUnlocks(stateRef.current, t);
      if (pruned !== stateRef.current) setAdsState(pruned);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [hasUnlocks, setAdsState]);

  // Becoming premium removes every trace of ads immediately — no restart.
  useEffect(() => {
    if (!isPremium) return;
    setSheet(null);
    rewardedSlot.clear();
    interstitialSlot.clear();
  }, [isPremium]);

  const sdkUsable = useCallback(
    (format: 'rewarded' | 'interstitial') => adUnitId(format) != null && isAdsSdkAvailable(),
    [],
  );

  const canShowAds = useCallback(
    () => canShowAdsRule({ isPremium: premiumRef.current, sdkAvailable: sdkUsable('rewarded') }),
    [sdkUsable],
  );

  const suspendAudio = useCallback(() => {
    const restorePlayback = playbackRef.current.suspend();
    const restoreMixer = mixerRef.current.suspend();
    return () => {
      restorePlayback();
      restoreMixer();
    };
  }, []);

  const baseDeps = useMemo(
    () => ({
      isPremium: () => premiumRef.current,
      policy: () => policyRef.current,
      getState: () => stateRef.current,
      setState: setAdsState,
      prepare: prepareAds,
      suspendAudio,
      track,
      now: () => new Date(),
    }),
    [setAdsState, suspendAudio],
  );

  const showRewarded = useCallback(
    async (itemId: string): Promise<RewardedOutcome> => {
      if (busyRef.current) return 'no_fill';
      busyRef.current = true;
      try {
        const unit = adUnitId('rewarded');
        const deps: AdsFlowDeps = {
          ...baseDeps,
          sdkAvailable: () => sdkUsable('rewarded'),
          acquire: (npa) => (unit ? rewardedSlot.acquire(unit, npa) : Promise.resolve(null)),
        };
        const outcome = await runRewardedFlow(itemId, deps);
        setNow(new Date());
        return outcome;
      } finally {
        busyRef.current = false;
      }
    },
    [baseDeps, sdkUsable],
  );

  const preloadRewarded = useCallback(() => {
    // Only after consent was gathered once — preloading must never be the
    // thing that triggers a consent form or the ATT prompt.
    if (premiumRef.current || !policyRef.current.rewardedEnabled || !isAdsInitialized()) return;
    const unit = adUnitId('rewarded');
    if (!unit) return;
    prepareAds()
      .then((ready) => {
        if (ready.canRequestAds && !premiumRef.current) rewardedSlot.preload(unit, ready.nonPersonalized);
      })
      .catch(() => undefined);
  }, []);

  const noteSessionEnded = useCallback(() => {
    const t = new Date();
    sessionEndedAtRef.current = t.getTime();
    const next = { ...stateRef.current, sessionsCompleted: stateRef.current.sessionsCompleted + 1 };
    setAdsState(next);

    // If an interstitial could be due at the next natural break, warm one up
    // now (only when every time/frequency rule already passes — so this can
    // never prompt for consent during quiet hours or for premium users).
    const blocked = interstitialBlockReason({
      policy: policyRef.current,
      state: next,
      isPremium: premiumRef.current,
      context: { trigger: 'home_after_session', naturalBreak: true, audioPlaying: false, sleepTimerActive: false },
      now: t,
    });
    const unit = adUnitId('interstitial');
    if (blocked || !unit || !isAdsSdkAvailable()) return;
    prepareAds()
      .then((ready) => {
        if (ready.canRequestAds && !premiumRef.current) interstitialSlot.preload(unit, ready.nonPersonalized);
      })
      .catch(() => undefined);
  }, [setAdsState]);

  const maybeShowInterstitial = useCallback(
    async (trigger: InterstitialTrigger): Promise<boolean> => {
      const endedAt = sessionEndedAtRef.current;
      const naturalBreak = endedAt != null && Date.now() - endedAt < NATURAL_BREAK_WINDOW_MS;
      if (!naturalBreak || busyRef.current) return false;
      sessionEndedAtRef.current = null; // one chance per session end
      const pb = playbackRef.current;
      const mx = mixerRef.current;
      busyRef.current = true;
      try {
        return await runInterstitialFlow(
          {
            trigger,
            naturalBreak,
            audioPlaying: pb.playing || (mx.hasMix && mx.playing),
            sleepTimerActive: pb.timerMin != null,
          },
          {
            ...baseDeps,
            sdkAvailable: () => sdkUsable('interstitial'),
            takeIfReady: () => interstitialSlot.takeIfReady(),
          },
        );
      } finally {
        busyRef.current = false;
      }
    },
    [baseDeps, sdkUsable],
  );

  const isTemporarilyUnlocked = useCallback(
    (itemId: string) => isUnlockActive(adsState, itemId, now),
    [adsState, now],
  );
  const unlockRemainingMs = useCallback(
    (itemId: string) => remainingMsRule(adsState, itemId, now),
    [adsState, now],
  );

  const openPaywall = useCallback(
    (itemId: string, source: PurchaseSource) => {
      track('paywall_opened_from_lock', { item_id: itemId, source });
      router.push(`/premium?source=${source}` as never);
    },
    [router],
  );

  const requestUnlock = useCallback(
    (route: string) => {
      const itemId = itemIdForRoute(route);
      // No ad option (ads off remotely, no unit id, or SDK not in this build):
      // behave exactly as before — straight to the paywall.
      if (premiumRef.current || !policyRef.current.rewardedEnabled || !canShowAds()) {
        openPaywall(itemId, 'lock_screen');
        return;
      }
      const policy = policyRef.current;
      if (rewardedCapReached(stateRef.current, new Date(), policy.rewardedDailyCap)) {
        track('rewarded_daily_cap_hit', { item_id: itemId, cap: policy.rewardedDailyCap });
        setSheet({ route, itemId, phase: 'cap' });
        return;
      }
      track('rewarded_offer_shown', { item_id: itemId });
      setSheet({ route, itemId, phase: 'idle' });
      preloadRewarded();
    },
    [canShowAds, openPaywall, preloadRewarded],
  );

  const onSheetPremium = useCallback(() => {
    if (!sheet) return;
    const source: PurchaseSource = sheet.phase === 'cap' ? 'cap_message' : 'lock_screen';
    setSheet(null);
    openPaywall(sheet.itemId, source);
  }, [sheet, openPaywall]);

  const onSheetWatch = useCallback(async () => {
    if (!sheet || sheet.phase === 'loading') return;
    const { route, itemId } = sheet;
    setSheet({ route, itemId, phase: 'loading' });
    const outcome = await showRewarded(itemId);
    switch (outcome) {
      case 'rewarded':
      case 'premium':
        setSheet(null);
        router.push(route as never);
        return;
      case 'cap':
        setSheet({ route, itemId, phase: 'cap' });
        return;
      case 'dismissed':
        setSheet({ route, itemId, phase: 'idle' });
        return;
      default:
        setSheet({ route, itemId, phase: 'no_fill' });
    }
  }, [sheet, showRewarded, router]);

  const value = useMemo<AdsValue>(
    () => ({
      canShowAds,
      isTemporarilyUnlocked,
      unlockRemainingMs,
      showRewarded,
      preloadRewarded,
      maybeShowInterstitial,
      noteSessionEnded,
      requestUnlock,
    }),
    [
      canShowAds,
      isTemporarilyUnlocked,
      unlockRemainingMs,
      showRewarded,
      preloadRewarded,
      maybeShowInterstitial,
      noteSessionEnded,
      requestUnlock,
    ],
  );

  return (
    <AdsContext.Provider value={value}>
      {children}
      {sheet && !isPremium && (
        <UnlockSheet
          phase={sheet.phase}
          unlockHours={config.ads.unlockHours}
          onPremium={onSheetPremium}
          onWatchAd={onSheetWatch}
          onClose={() => setSheet(null)}
        />
      )}
    </AdsContext.Provider>
  );
}

export function useAds(): AdsValue {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
}
