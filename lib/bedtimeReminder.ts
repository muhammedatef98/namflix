/**
 * One gentle local notification a day, shortly before the user's bedtime from
 * the Sleep Window. Local only: nothing is sent to a server, no push token is
 * created, and it is OFF until the user turns it on.
 *
 * The notifications module is required lazily (like the ads and purchases
 * SDKs), so an OTA update landing on an older binary without the native module
 * just reports "unavailable" instead of crashing.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Lang } from '@/lib/i18n';
import { loadWindowSettings, reminderMinutes, WINDOW_DEFAULTS, type WindowSettings } from '@/lib/sleepWindow';

type NotificationsModule = typeof import('expo-notifications');

const ENABLED_KEY = 'namflix.bedtimeReminder.enabled';
const NOTIFICATION_ID = 'namflix-bedtime';
const CHANNEL_ID = 'bedtime';
/** How long before bedtime the reminder fires. */
export const REMINDER_LEAD_MIN = 30;

let mod: NotificationsModule | null | undefined;
function load(): NotificationsModule | null {
  if (mod !== undefined) return mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('expo-notifications') as NotificationsModule;
  } catch {
    mod = null;
  }
  return mod;
}

export function isReminderAvailable(): boolean {
  return load() !== null;
}

export async function isReminderEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ENABLED_KEY)) === '1';
  } catch {
    return false;
  }
}

const COPY: Record<Lang, { title: string; body: string }> = {
  en: {
    title: 'Bedtime is coming up',
    body: 'Dim the lights and start winding down. Your sleep window opens in 30 minutes.',
  },
  ar: {
    title: 'اقترب موعد نومك',
    body: 'خفّف الإضاءة وابدأ بالاسترخاء. تبدأ نافذة نومك بعد نصف ساعة.',
  },
};

async function ensurePermission(n: NotificationsModule): Promise<boolean> {
  const current = await n.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await n.requestPermissionsAsync();
  return asked.granted;
}

async function schedule(n: NotificationsModule, settings: WindowSettings, lang: Lang): Promise<void> {
  await n.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => undefined);
  if (Platform.OS === 'android') {
    await n
      .setNotificationChannelAsync(CHANNEL_ID, {
        name: lang === 'ar' ? 'تذكير موعد النوم' : 'Bedtime reminder',
        importance: n.AndroidImportance.DEFAULT,
        // A sleep app should not buzz or flash at night.
        enableVibrate: false,
        enableLights: false,
        sound: null,
      })
      .catch(() => undefined);
  }
  const mins = reminderMinutes(settings, REMINDER_LEAD_MIN);
  const copy = COPY[lang];
  await n.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: { title: copy.title, body: copy.body, sound: false },
    trigger: {
      type: n.SchedulableTriggerInputTypes.DAILY,
      hour: Math.floor(mins / 60),
      minute: mins % 60,
      channelId: CHANNEL_ID,
    },
  });
}

/**
 * Turn the reminder on: ask permission (only now, never at launch), then
 * schedule. Returns false when the module is missing or permission is denied.
 */
export async function enableReminder(lang: Lang): Promise<boolean> {
  const n = load();
  if (!n) return false;
  try {
    if (!(await ensurePermission(n))) return false;
    const settings = (await loadWindowSettings()) ?? WINDOW_DEFAULTS;
    await schedule(n, settings, lang);
    await AsyncStorage.setItem(ENABLED_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export async function disableReminder(): Promise<void> {
  await AsyncStorage.setItem(ENABLED_KEY, '0').catch(() => undefined);
  const n = load();
  if (!n) return;
  await n.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => undefined);
}

/**
 * Re-schedule after the window or language changed. No-op when the reminder
 * is off, so it never prompts for permission on its own.
 */
export async function rescheduleReminderIfEnabled(lang: Lang): Promise<void> {
  if (!(await isReminderEnabled())) return;
  const n = load();
  if (!n) return;
  try {
    const perm = await n.getPermissionsAsync();
    if (!perm.granted) return;
    const settings = (await loadWindowSettings()) ?? WINDOW_DEFAULTS;
    await schedule(n, settings, lang);
  } catch {
    // ignore — the previous schedule stays in place
  }
}
