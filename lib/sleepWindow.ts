/**
 * Sleep-window settings, shared by the Sleep Window screen and the bedtime
 * reminder. The window is anchored to the FIXED wake time; bedtime is that
 * minus the (clamped) sleep hours.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WINDOW_STORE_KEY = 'namflix.window';
export const MIN_WINDOW_H = 5.5;

export interface WindowSettings {
  sleepHours: number;
  wakeHour: number;
  wakeMinute: number;
}

export const WINDOW_DEFAULTS: WindowSettings = { sleepHours: 7, wakeHour: 7, wakeMinute: 0 };

export function isWindowSettings(v: unknown): v is WindowSettings {
  const w = v as WindowSettings;
  return (
    typeof w === 'object' &&
    w !== null &&
    typeof w.sleepHours === 'number' &&
    typeof w.wakeHour === 'number' &&
    typeof w.wakeMinute === 'number'
  );
}

export async function loadWindowSettings(): Promise<WindowSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(WINDOW_STORE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isWindowSettings(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveWindowSettings(s: WindowSettings): Promise<void> {
  await AsyncStorage.setItem(WINDOW_STORE_KEY, JSON.stringify(s)).catch(() => undefined);
}

/** Minutes after midnight (0..1439) of the wake time. */
export function wakeMinutes(s: WindowSettings): number {
  return s.wakeHour * 60 + s.wakeMinute;
}

/** Minutes after midnight (0..1439) of the earliest bedtime, wrapping past midnight. */
export function bedMinutes(s: WindowSettings): number {
  const windowH = Math.max(MIN_WINDOW_H, s.sleepHours);
  const raw = wakeMinutes(s) - windowH * 60;
  return ((raw % 1440) + 1440) % 1440;
}

/** Minutes after midnight for a reminder `leadMin` before bedtime, wrapped into a day. */
export function reminderMinutes(s: WindowSettings, leadMin: number): number {
  return (((bedMinutes(s) - leadMin) % 1440) + 1440) % 1440;
}
