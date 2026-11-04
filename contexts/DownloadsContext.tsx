import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  clearAllDownloads,
  deleteDownload,
  downloadTrack,
  loadDownloadIndex,
  setLocalUriCache,
  totalDownloadedBytes,
  type DownloadIndex,
  type DownloadRecord,
} from '@/lib/downloads';
import { SOUND_TRACKS, type SoundTrack } from '@/lib/mediaLibrary';

/**
 * Downloads manager — tracks which sounds the user keeps on-device. The
 * module-level URI cache in lib/downloads.ts is updated alongside this state,
 * so the Playback and Mixer contexts can read the right URI without needing
 * to be plumbed into React.
 */

type DownloadsValue = {
  /** The on-device catalogue: trackId → record. Empty by default. */
  index: DownloadIndex;
  /** Track ids currently downloading. */
  downloading: Set<string>;
  /** Total bytes used on disk by all downloaded sounds. */
  totalBytes: number;
  isDownloaded: (trackId: string) => boolean;
  isDownloading: (trackId: string) => boolean;
  /** Start a download. Resolves when the file is on disk (or failed). */
  download: (track: SoundTrack) => Promise<DownloadRecord | null>;
  remove: (trackId: string) => Promise<void>;
  /** Wipe every downloaded file. Prompts the caller before using. */
  clearAll: () => Promise<void>;
};

const DownloadsContext = createContext<DownloadsValue | null>(null);

export function DownloadsProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<DownloadIndex>({});
  // A Set would be ideal for identity; we use a plain object to keep React
  // happy with structural equality checks across renders.
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  // Suppress in-flight races: if the user taps download twice, the second one
  // short-circuits instead of spawning a parallel downloader.
  const activeRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadDownloadIndex()
      .then((loaded) => {
        setIndex(loaded);
        setLocalUriCache(loaded);
      })
      .catch(() => undefined);
  }, []);

  const applyIndex = useCallback((next: DownloadIndex) => {
    setIndex(next);
    setLocalUriCache(next);
  }, []);

  const download = useCallback(
    async (track: SoundTrack) => {
      // Already downloaded or already downloading → skip.
      if (index[track.id] || activeRef.current.has(track.id)) return index[track.id] ?? null;
      activeRef.current.add(track.id);
      setDownloadingIds((prev) => (prev.includes(track.id) ? prev : [...prev, track.id]));
      try {
        const rec = await downloadTrack(track);
        if (rec) applyIndex({ ...index, [track.id]: rec });
        return rec;
      } finally {
        activeRef.current.delete(track.id);
        setDownloadingIds((prev) => prev.filter((id) => id !== track.id));
      }
    },
    [index, applyIndex],
  );

  const remove = useCallback(
    async (trackId: string) => {
      await deleteDownload(trackId);
      const next = { ...index };
      delete next[trackId];
      applyIndex(next);
    },
    [index, applyIndex],
  );

  const clearAll = useCallback(async () => {
    await clearAllDownloads();
    applyIndex({});
  }, [applyIndex]);

  const downloading = useMemo(() => new Set(downloadingIds), [downloadingIds]);
  const totalBytes = useMemo(() => totalDownloadedBytes(index), [index]);

  const value = useMemo<DownloadsValue>(
    () => ({
      index,
      downloading,
      totalBytes,
      isDownloaded: (id) => Boolean(index[id]),
      isDownloading: (id) => downloading.has(id),
      download,
      remove,
      clearAll,
    }),
    [index, downloading, totalBytes, download, remove, clearAll],
  );

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
}

export function useDownloads(): DownloadsValue {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error('useDownloads must be used within DownloadsProvider');
  return ctx;
}

/** Downloaded records with their track metadata, newest first. */
export function useDownloadedTracks(): { track: SoundTrack; record: DownloadRecord }[] {
  const { index } = useDownloads();
  return useMemo(() => {
    const out: { track: SoundTrack; record: DownloadRecord }[] = [];
    for (const rec of Object.values(index)) {
      const track = SOUND_TRACKS.find((t) => t.id === rec.trackId);
      if (track) out.push({ track, record: rec });
    }
    return out.sort((a, b) => b.record.savedAt - a.record.savedAt);
  }, [index]);
}
