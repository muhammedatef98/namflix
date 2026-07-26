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
};

const MixerContext = createContext<MixerValue | null>(null);

export function MixerProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<MixLayer[]>([]);
  const [playing, setPlaying] = useState(true);
  // Imperative players live outside React state; keyed by track id.
  const playersRef = useRef<Map<string, AudioPlayer>>(new Map());

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
    for (const p of playersRef.current.values()) p.release();
    playersRef.current.clear();
    setLayers([]);
    setPlaying(true);
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
    }),
    [layers, playing, addLayer, removeLayer, setVolume, toggle, applyPreset, clear],
  );

  return <MixerContext.Provider value={value}>{children}</MixerContext.Provider>;
}

export function useMixer(): MixerValue {
  const ctx = useContext(MixerContext);
  if (!ctx) throw new Error('useMixer must be used within MixerProvider');
  return ctx;
}
