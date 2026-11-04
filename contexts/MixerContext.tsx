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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { SOUND_TRACKS, type SoundTrack } from '@/lib/mediaLibrary';

/**
 * App-wide sound mixer. Like PlaybackContext, the players live HERE — not in
 * the mixer screen — so a blend keeps playing while the user browses the rest
 * of the app and even after they leave the mixer, stopping only when they stop
 * it. The mixer screen and the mini-player bar are views over this state.
 */

export const MAX_LAYERS = 3;
const DEFAULT_VOLUME = 0.7;

export interface MixLayer {
  track: SoundTrack;
  volume: number;
}

/**
 * A mix the user saved: layer id + its volume, plus a nickname and a
 * monotonically increasing id. We keep it slim so it survives app upgrades.
 */
export interface SavedMix {
  id: string;
  name: string;
  layers: { trackId: string; volume: number }[];
  savedAt: number;
}

const SAVED_MIXES_KEY = 'namflix.mixer.saved';
const MAX_SAVED_MIXES = 24;

type MixerValue = {
  layers: MixLayer[];
  playing: boolean;
  hasMix: boolean;
  addLayer: (track: SoundTrack) => void;
  removeLayer: (trackId: string) => void;
  setVolume: (trackId: string, volume: number) => void;
  toggle: () => void;
  applyPreset: (trackIds: string[]) => void;
  /** Full stop: releases every layer and clears the mix. */
  clear: () => void;
  /** Pause for an interruption (e.g. an ad); returns a function restoring the exact mix. */
  suspend: () => () => void;
  /** Saved blends the user wants to launch in one tap. */
  savedMixes: SavedMix[];
  /** Save the current mix (with its volumes) under `name`. */
  saveCurrentMix: (name: string) => void;
  /** Replay a saved mix with its saved volumes. */
  playSavedMix: (id: string) => void;
  deleteSavedMix: (id: string) => void;
  renameSavedMix: (id: string, name: string) => void;
};

const MixerContext = createContext<MixerValue | null>(null);

export function MixerProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<MixLayer[]>([]);
  const [playing, setPlaying] = useState(true);
  // Imperative players live outside React state; keyed by track id.
  const playersRef = useRef<Map<string, AudioPlayer>>(new Map());
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>([]);
  const layersRef = useRef<MixLayer[]>([]);
  const playingRef = useRef(true);
  // Bumped on every real mix change so a stale suspend() can't resume.
  const versionRef = useRef(0);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // One read at startup. Malformed entries are dropped; a corrupt blob falls
  // back to an empty list so the mixer never refuses to load.
  useEffect(() => {
    AsyncStorage.getItem(SAVED_MIXES_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed: unknown = JSON.parse(raw);
          if (!Array.isArray(parsed)) return;
          const clean: SavedMix[] = parsed
            .filter((m): m is SavedMix =>
              typeof m === 'object' && m !== null &&
              typeof (m as SavedMix).id === 'string' &&
              typeof (m as SavedMix).name === 'string' &&
              Array.isArray((m as SavedMix).layers),
            )
            // Keep only layers whose track still exists — a removed sound must
            // never make a saved mix unplayable.
            .map((m) => ({
              ...m,
              layers: m.layers.filter((l) => SOUND_TRACKS.some((t) => t.id === l.trackId)),
            }))
            .filter((m) => m.layers.length > 0);
          setSavedMixes(clean);
        } catch {
          // ignore
        }
      })
      .catch(() => undefined);
  }, []);

  const persistMixes = useCallback((next: SavedMix[]) => {
    setSavedMixes(next);
    AsyncStorage.setItem(SAVED_MIXES_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(
      () => undefined,
    );
    const players = playersRef.current;
    return () => {
      for (const p of players.values()) p.release();
      players.clear();
    };
  }, []);

  const addLayer = useCallback((track: SoundTrack) => {
    setLayers((prev) => {
      if (prev.length >= MAX_LAYERS || prev.some((l) => l.track.id === track.id)) return prev;
      const player = createAudioPlayer({ uri: track.audioUrl });
      player.loop = true;
      player.volume = DEFAULT_VOLUME;
      player.play();
      playersRef.current.set(track.id, player);
      setPlaying(true);
      return [...prev, { track, volume: DEFAULT_VOLUME }];
    });
  }, []);

  const removeLayer = useCallback((trackId: string) => {
    const player = playersRef.current.get(trackId);
    if (player) {
      player.release();
      playersRef.current.delete(trackId);
    }
    setLayers((prev) => prev.filter((l) => l.track.id !== trackId));
  }, []);

  const setVolume = useCallback((trackId: string, volume: number) => {
    const player = playersRef.current.get(trackId);
    if (player) player.volume = volume;
    setLayers((prev) => prev.map((l) => (l.track.id === trackId ? { ...l, volume } : l)));
  }, []);

  const toggle = useCallback(() => {
    versionRef.current += 1;
    setPlaying((prev) => {
      const next = !prev;
      for (const p of playersRef.current.values()) {
        if (next) p.play();
        else p.pause();
      }
      return next;
    });
  }, []);

  const applyPreset = useCallback((trackIds: string[]) => {
    versionRef.current += 1;
    for (const p of playersRef.current.values()) p.release();
    playersRef.current.clear();
    const fresh: MixLayer[] = trackIds
      .map((id) => SOUND_TRACKS.find((tr) => tr.id === id))
      .filter((tr): tr is SoundTrack => tr !== undefined)
      .map((track) => {
        const player = createAudioPlayer({ uri: track.audioUrl });
        player.loop = true;
        player.volume = DEFAULT_VOLUME;
        player.play();
        playersRef.current.set(track.id, player);
        return { track, volume: DEFAULT_VOLUME };
      });
    setLayers(fresh);
    setPlaying(true);
  }, []);

  const clear = useCallback(() => {
    versionRef.current += 1;
    for (const p of playersRef.current.values()) p.release();
    playersRef.current.clear();
    setLayers([]);
    setPlaying(true);
  }, []);

  /** Build a SavedMix from the live state. Normalises order so the same */
  const saveCurrentMix = useCallback(
    (name: string) => {
      const live = layersRef.current;
      if (live.length === 0) return;
      const trimmed = name.trim().slice(0, 40) || defaultMixName(live);
      const next: SavedMix = {
        id: `mix-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmed,
        layers: live.map((l) => ({ trackId: l.track.id, volume: l.volume })),
        savedAt: Date.now(),
      };
      // Newest first; cap so the list never grows forever.
      persistMixes([next, ...savedMixes].slice(0, MAX_SAVED_MIXES));
    },
    [persistMixes, savedMixes],
  );

  const playSavedMix = useCallback(
    (id: string) => {
      const mix = savedMixes.find((m) => m.id === id);
      if (!mix) return;
      versionRef.current += 1;
      for (const p of playersRef.current.values()) p.release();
      playersRef.current.clear();
      const fresh: MixLayer[] = [];
      for (const { trackId, volume } of mix.layers) {
        const track = SOUND_TRACKS.find((t) => t.id === trackId);
        if (!track) continue;
        const v = Math.min(1, Math.max(0, volume));
        const player = createAudioPlayer({ uri: track.audioUrl });
        player.loop = true;
        player.volume = v;
        player.play();
        playersRef.current.set(track.id, player);
        fresh.push({ track, volume: v });
      }
      setLayers(fresh);
      setPlaying(true);
    },
    [savedMixes],
  );

  const deleteSavedMix = useCallback(
    (id: string) => {
      persistMixes(savedMixes.filter((m) => m.id !== id));
    },
    [persistMixes, savedMixes],
  );

  const renameSavedMix = useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim().slice(0, 40);
      if (!trimmed) return;
      persistMixes(savedMixes.map((m) => (m.id === id ? { ...m, name: trimmed } : m)));
    },
    [persistMixes, savedMixes],
  );

  const suspend = useCallback(() => {
    const players = [...playersRef.current.values()];
    if (players.length === 0 || !playingRef.current) return () => undefined;
    for (const p of players) p.pause();
    const version = versionRef.current;
    return () => {
      if (versionRef.current !== version) return;
      // Same players, same volumes — the mix comes back exactly as it was.
      for (const p of players) if ([...playersRef.current.values()].includes(p)) p.play();
    };
  }, []);

  const value = useMemo<MixerValue>(
    () => ({
      layers,
      playing,
      hasMix: layers.length > 0,
      addLayer,
      removeLayer,
      setVolume,
      toggle,
      applyPreset,
      clear,
      suspend,
      savedMixes,
      saveCurrentMix,
      playSavedMix,
      deleteSavedMix,
      renameSavedMix,
    }),
    [
      layers,
      playing,
      addLayer,
      removeLayer,
      setVolume,
      toggle,
      applyPreset,
      clear,
      suspend,
      savedMixes,
      saveCurrentMix,
      playSavedMix,
      deleteSavedMix,
      renameSavedMix,
    ],
  );

  return <MixerContext.Provider value={value}>{children}</MixerContext.Provider>;
}

export function useMixer(): MixerValue {
  const ctx = useContext(MixerContext);
  if (!ctx) throw new Error('useMixer must be used within MixerProvider');
  return ctx;
}

/** Fallback when the user saves without typing a name. */
function defaultMixName(layers: MixLayer[]): string {
  if (layers.length === 0) return 'Mix';
  const ids = layers.map((l) => l.track.id).slice(0, 2).join(' · ');
  return layers.length > 2 ? `${ids} · +${layers.length - 2}` : ids;
}
