/** On-device persistence for the ads layer (AsyncStorage, never leaves the phone). */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialAdsState, type AdsState } from './rules';

const ADS_KEY = 'namflix.ads';

function isNumberRecord(v: unknown): v is Record<string, number> {
  return (
    typeof v === 'object' &&
    v !== null &&
    Object.values(v).every((x) => typeof x === 'number' && Number.isFinite(x))
  );
}

/** Validate a stored blob field by field; anything malformed resets to defaults. */
export function parseAdsState(raw: string | null, now: Date): AdsState {
  const base = initialAdsState(now);
  if (!raw) return base;
  try {
    const p = JSON.parse(raw) as Partial<Record<keyof AdsState, unknown>>;
    return {
      unlocks: isNumberRecord(p.unlocks) ? p.unlocks : base.unlocks,
      rewardedDay: typeof p.rewardedDay === 'string' ? p.rewardedDay : base.rewardedDay,
      rewardedCount: typeof p.rewardedCount === 'number' ? p.rewardedCount : 0,
      installedAt: typeof p.installedAt === 'number' ? p.installedAt : base.installedAt,
      sessionsCompleted: typeof p.sessionsCompleted === 'number' ? p.sessionsCompleted : 0,
      lastInterstitialAt: typeof p.lastInterstitialAt === 'number' ? p.lastInterstitialAt : null,
    };
  } catch {
    return base;
  }
}

export async function loadAdsState(now: Date): Promise<AdsState> {
  try {
    const state = parseAdsState(await AsyncStorage.getItem(ADS_KEY), now);
    // Persist installedAt on first run so "first N days" survives restarts.
    await AsyncStorage.setItem(ADS_KEY, JSON.stringify(state));
    return state;
  } catch {
    return initialAdsState(now);
  }
}

export async function saveAdsState(state: AdsState): Promise<void> {
  await AsyncStorage.setItem(ADS_KEY, JSON.stringify(state)).catch(() => undefined);
}
