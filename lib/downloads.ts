/**
 * Offline downloads — the user picks tracks they want to keep on-device, and
 * playback prefers the local file over the streaming URL. The point is a
 * sound that keeps going through a dropped network at 3 a.m.
 *
 * Why the Legacy FileSystem API: it's the one that's actually stable on
 * Expo SDK 54 across iOS and Android today (`downloadAsync`, `documentDirectory`,
 * `getInfoAsync`). The new SFA/sticker API is still moving.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { SOUND_TRACKS, type SoundTrack } from '@/lib/mediaLibrary';

/** Folder inside the app's sandbox where every downloaded sound lives. */
const DIR = (FileSystem.documentDirectory ?? '') + 'namflix-sounds/';
const INDEX_KEY = 'namflix.downloads.v1';

export type DownloadStatus = 'idle' | 'downloading' | 'ready' | 'error';

/**
 * Per-track metadata the app persists. `uri` is the local file URI, `bytes`
 * the file size on disk (so a "used 220 MB" number is honest), `savedAt` lets
 * us sort by newest.
 */
export interface DownloadRecord {
  trackId: string;
  uri: string;
  bytes: number;
  savedAt: number;
}

export type DownloadIndex = Record<string, DownloadRecord>;

async function ensureDir(): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  const info = await FileSystem.getInfoAsync(DIR).catch(() => null);
  if (!info || !info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => undefined);
  }
}

function localPath(trackId: string): string {
  // Use the raw id — all of them are ASCII slugs, so no URL escaping needed.
  // MP3 extension matches what the CDN serves.
  return DIR + trackId + '.mp3';
}

async function readIndex(): Promise<DownloadIndex> {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // Drop records whose track disappeared from the library, or whose file is
    // missing on disk — index is a cache, truth is the file + SOUND_TRACKS.
    const known = new Set(SOUND_TRACKS.map((t) => t.id));
    const out: DownloadIndex = {};
    for (const [id, rec] of Object.entries(parsed as Record<string, unknown>)) {
      if (!known.has(id) || !rec || typeof rec !== 'object') continue;
      const r = rec as DownloadRecord;
      if (typeof r.uri !== 'string' || typeof r.bytes !== 'number') continue;
      out[id] = { trackId: id, uri: r.uri, bytes: r.bytes, savedAt: r.savedAt ?? 0 };
    }
    return out;
  } catch {
    return {};
  }
}

async function writeIndex(ix: DownloadIndex): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(ix)).catch(() => undefined);
}

/**
 * Load the current index, pruning entries whose file has gone missing (the
 * user may have cleared app storage). Ensures the on-disk state is the source
 * of truth after any OS-level cleanup.
 */
export async function loadDownloadIndex(): Promise<DownloadIndex> {
  const ix = await readIndex();
  const live: DownloadIndex = {};
  for (const rec of Object.values(ix)) {
    const info = await FileSystem.getInfoAsync(rec.uri).catch(() => null);
    if (info && info.exists) live[rec.trackId] = rec;
  }
  if (Object.keys(live).length !== Object.keys(ix).length) await writeIndex(live);
  return live;
}

/**
 * Download a track. Resolves to the new record (or null on failure). Idempotent:
 * if the file is already on disk, returns the existing record instead of
 * re-downloading.
 */
export async function downloadTrack(track: SoundTrack): Promise<DownloadRecord | null> {
  if (!FileSystem.documentDirectory) return null;
  await ensureDir();
  const uri = localPath(track.id);
  const existing = await FileSystem.getInfoAsync(uri).catch(() => null);
  if (existing && existing.exists && 'size' in existing && typeof existing.size === 'number') {
    const ix = await readIndex();
    const rec: DownloadRecord = { trackId: track.id, uri, bytes: existing.size, savedAt: Date.now() };
    ix[track.id] = rec;
    await writeIndex(ix);
    return rec;
  }
  try {
    const result = await FileSystem.downloadAsync(track.audioUrl, uri);
    if (result.status < 200 || result.status >= 300) {
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
      return null;
    }
    const info = await FileSystem.getInfoAsync(uri).catch(() => null);
    const bytes = info && 'size' in info && typeof info.size === 'number' ? info.size : 0;
    const ix = await readIndex();
    const rec: DownloadRecord = { trackId: track.id, uri, bytes, savedAt: Date.now() };
    ix[track.id] = rec;
    await writeIndex(ix);
    return rec;
  } catch {
    // Network blip or permission refusal — leave nothing behind.
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
    return null;
  }
}

/** Delete one download and drop it from the index. */
export async function deleteDownload(trackId: string): Promise<void> {
  const ix = await readIndex();
  const rec = ix[trackId];
  if (rec) {
    await FileSystem.deleteAsync(rec.uri, { idempotent: true }).catch(() => undefined);
    delete ix[trackId];
    await writeIndex(ix);
  } else {
    // Still try — the index might have drifted from disk.
    await FileSystem.deleteAsync(localPath(trackId), { idempotent: true }).catch(() => undefined);
  }
}

/** Delete everything the user downloaded. Reclaims the whole folder. */
export async function clearAllDownloads(): Promise<void> {
  await FileSystem.deleteAsync(DIR, { idempotent: true }).catch(() => undefined);
  await AsyncStorage.removeItem(INDEX_KEY).catch(() => undefined);
}

/** Total bytes the user has downloaded, for an "X MB used" line. */
export function totalDownloadedBytes(ix: DownloadIndex): number {
  let total = 0;
  for (const r of Object.values(ix)) total += r.bytes;
  return total;
}

/** "220 MB" / "٢٢٠ م.ب" — localised in callers via the lang passed in. */
export function formatMb(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/**
 * Module-level map of trackId → local URI. Written to by DownloadsContext
 * whenever the index changes, read by PlaybackContext/MixerContext when they
 * create a player. This keeps the audio pipelines free of React state (they
 * are imperative) without forcing them to query AsyncStorage.
 */
const localUriCache: Map<string, string> = new Map();

export function setLocalUriCache(ix: DownloadIndex): void {
  localUriCache.clear();
  for (const rec of Object.values(ix)) localUriCache.set(rec.trackId, rec.uri);
}

/** Preferred URI for a track — local file if downloaded, else the CDN URL. */
export function uriForTrack(track: SoundTrack): string {
  return localUriCache.get(track.id) ?? track.audioUrl;
}
