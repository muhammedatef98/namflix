/**
 * Personal n-of-1 tracking: which techniques actually help THIS user sleep.
 *
 * Model: every tool open is recorded against a "night" (a night spans
 * 18:00 → 18:00, so 2 a.m. usage belongs to the evening before). The next
 * morning the user answers one question — how easily they fell asleep — and
 * over time each tool accumulates its own honest success record.
 *
 * All local, all on-device (AsyncStorage). No analytics, nothing leaves the
 * phone — consistent with the privacy policy.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Localized } from '@/lib/i18n';

const NIGHTS_KEY = 'namflix.nights';
const MAX_NIGHTS = 120; // ~4 months of history is plenty for the map

export type SleepRating = 'easy' | 'slow' | 'hard';

export interface NightRecord {
  /** Night key: the YYYY-MM-DD of the evening the night began. */
  night: string;
  /** Tool ids used that night (deduplicated), e.g. 'descent', 'breathe', 'sound'. */
  tools: string[];
  rating?: SleepRating;
}

export const TOOL_LABEL: Record<string, Localized> = {
  descent: { en: 'Drift', ar: 'السكينة' },
  rescue: { en: 'Night Rescue', ar: 'الإنقاذ الليلي' },
  breathe: { en: '4·7·8 Breathing', ar: 'تنفّس ٤·٧·٨' },
  pmr: { en: 'Muscle Release', ar: 'ترخية العضلات' },
  bodyscan: { en: 'Body Scan', ar: 'مسح الجسد' },
  grounding: { en: 'Sensory Grounding', ar: 'التأريض الحسّي' },
  shuffle: { en: 'Cognitive Shuffle', ar: 'الخلط الذهني' },
  imagery: { en: 'Imagery', ar: 'التخيّل' },
  paradox: { en: 'Stay Awake', ar: 'النية المتناقضة' },
  count: { en: 'Descending Count', ar: 'العدّ التنازلي' },
  worry: { en: 'Worry Release', ar: 'إطلاق القلق' },
  boring: { en: 'Boring on Purpose', ar: 'مُملّ عن قصد' },
  sound: { en: 'Sleep sounds', ar: 'أصوات النوم' },
  mixer: { en: 'Sound Mixer', ar: 'مازج الأصوات' },
  program: { en: '14 Nights Program', ar: 'برنامج ١٤ ليلة' },
  autogenic: { en: 'Heavy & Warm', ar: 'ثِقل ودفء' },
  window: { en: 'Sleep Window', ar: 'نافذة النوم' },
};

/** The night (YYYY-MM-DD of its evening) a given moment belongs to. */
export function nightKey(d: Date = new Date()): string {
  const shifted = new Date(d.getTime());
  // Before 18:00 counts as the previous evening's night.
  if (shifted.getHours() < 18) shifted.setDate(shifted.getDate() - 1);
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function loadNights(): Promise<NightRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(NIGHTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NightRecord[]) : [];
  } catch {
    return [];
  }
}

async function saveNights(nights: NightRecord[]): Promise<void> {
  const trimmed = nights.slice(-MAX_NIGHTS);
  await AsyncStorage.setItem(NIGHTS_KEY, JSON.stringify(trimmed)).catch(() => undefined);
}

/** Record that a tool was used tonight (idempotent per night). */
export async function recordToolUse(toolId: string): Promise<void> {
  const key = nightKey();
  const nights = await loadNights();
  const existing = nights.find((n) => n.night === key);
  if (existing) {
    if (!existing.tools.includes(toolId)) {
      const updated = nights.map((n) =>
        n.night === key ? { ...n, tools: [...n.tools, toolId] } : n,
      );
      await saveNights(updated);
    }
    return;
  }
  await saveNights([...nights, { night: key, tools: [toolId] }]);
}

/** The most recent unrated night with recorded tools — the check-in target. */
export async function pendingCheckIn(): Promise<NightRecord | null> {
  const nights = await loadNights();
  const current = nightKey();
  const candidates = nights.filter(
    (n) => n.rating === undefined && n.tools.length > 0 && n.night < current,
  );
  return candidates.length > 0 ? candidates[candidates.length - 1] : null;
}

export async function rateNight(night: string, rating: SleepRating): Promise<void> {
  const nights = await loadNights();
  await saveNights(nights.map((n) => (n.night === night ? { ...n, rating } : n)));
}

export interface ToolStats {
  toolId: string;
  nightsUsed: number;
  ratedNights: number;
  /** 0..100 — easy = 100, slow = 50, hard = 0, averaged. */
  score: number;
}

const RATING_SCORE: Record<SleepRating, number> = { easy: 100, slow: 50, hard: 0 };

/** Per-tool aggregation over all rated nights, best score first. */
export async function toolStats(): Promise<{ stats: ToolStats[]; totalRated: number }> {
  const nights = await loadNights();
  const byTool = new Map<string, { used: number; scores: number[] }>();
  let totalRated = 0;

  for (const n of nights) {
    if (n.rating !== undefined) totalRated += 1;
    for (const toolId of n.tools) {
      const entry = byTool.get(toolId) ?? { used: 0, scores: [] };
      const scores =
        n.rating !== undefined ? [...entry.scores, RATING_SCORE[n.rating]] : entry.scores;
      byTool.set(toolId, { used: entry.used + 1, scores });
    }
  }

  const stats: ToolStats[] = [...byTool.entries()].map(([toolId, v]) => ({
    toolId,
    nightsUsed: v.used,
    ratedNights: v.scores.length,
    score:
      v.scores.length > 0
        ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length)
        : 0,
  }));

  const sorted = [...stats].sort((a, b) => b.score - a.score || b.ratedNights - a.ratedNights);
  return { stats: sorted, totalRated };
}

/** Recent nights, newest first (for the history list). */
export async function recentNights(limit = 14): Promise<NightRecord[]> {
  const nights = await loadNights();
  return [...nights].reverse().slice(0, limit);
}
