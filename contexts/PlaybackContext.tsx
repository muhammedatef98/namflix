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
import { trackById, type SoundTrack } from '@/lib/mediaLibrary';
import { recordToolUse } from '@/lib/nightTracking';

/**
 * App-wide playback. The player lives here — NOT in the player screen — so a
 * sound keeps going while the user browses the rest of the app, and only
 * stops when they stop it (or the sleep timer finishes its fade). The player
 * screen and the mini-player bar are both just views over this state.
 */

const FADE_IN_MS = 3500;
const FADE_IN_STEPS = 14;
const FADE_OUT_MS = 8000;
const FADE_OUT_STEPS = 20;

type PlaybackValue = {
  track: SoundTrack | null;
  playing: boolean;
  volume: number;
  timerMin: number | null;
  /** Start (or switch to) a track, with a gentle fade-in. */
  play: (trackId: string) => void;
  toggle: () => void;
  /** Full stop: releases audio and clears the mini player. */
  stop: () => void;
  setVolume: (v: number) => void;
  /** Sleep timer; pass null (or the active value) to cancel. */
  setTimer: (min: number | null) => void;
};

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<SoundTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [timerMin, setTimerMin] = useState<number | null>(null);

  const playerRef = useRef<AudioPlayer | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeRef = useRef(1);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(
      () => undefined,
    );
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      playerRef.current?.release();
    };
  }, []);

  const clearFade = () => {
    if (fadeRef.current) clearInterval(fadeRef.current);
    fadeRef.current = null;
  };

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setTimerMin(null);
  }, []);

  const applyVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
    if (playerRef.current) playerRef.current.volume = v;
  }, []);

  const stop = useCallback(() => {
    clearFade();
    clearTimer();
    playerRef.current?.release();
    playerRef.current = null;
    setTrack(null);
    setPlaying(false);
  }, [clearTimer]);

  const startFadeOut = useCallback(() => {
    clearFade();
    let v = volumeRef.current;
    const step = v / FADE_OUT_STEPS;
    fadeRef.current = setInterval(() => {
      v = Math.max(0, v - step);
      if (playerRef.current) playerRef.current.volume = v;
      if (v <= 0) {
        clearFade();
        playerRef.current?.pause();
        if (playerRef.current) playerRef.current.volume = volumeRef.current;
        setPlaying(false);
        setTimerMin(null);
        timerRef.current = null;
      }
    }, FADE_OUT_MS / FADE_OUT_STEPS);
  }, []);

  const play = useCallback(
    (trackId: string) => {
      const next = trackById(trackId);
      if (!next) return;
      if (track?.id === trackId && playerRef.current) {
        if (!playing) {
          playerRef.current.play();
          setPlaying(true);
        }
        return;
      }
      clearFade();
      playerRef.current?.release();
      const player = createAudioPlayer({ uri: next.audioUrl });
      player.loop = true;
      player.volume = 0; // fade in below
      player.play();
      playerRef.current = player;
      setTrack(next);
      setPlaying(true);
      void recordToolUse('sound');

      let step = 0;
      fadeRef.current = setInterval(() => {
        step += 1;
        const v = Math.min(volumeRef.current, (step / FADE_IN_STEPS) * volumeRef.current);
        if (playerRef.current) playerRef.current.volume = v;
        if (step >= FADE_IN_STEPS) clearFade();
      }, FADE_IN_MS / FADE_IN_STEPS);
    },
    [track, playing],
  );

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    clearFade();
    player.volume = volumeRef.current;
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  }, [playing]);

  const setTimer = useCallback(
    (min: number | null) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      if (min === null || min === timerMin) {
        setTimerMin(null);
        return;
      }
      setTimerMin(min);
      timerRef.current = setTimeout(startFadeOut, min * 60_000);
    },
    [timerMin, startFadeOut],
  );

  const value = useMemo<PlaybackValue>(
    () => ({ track, playing, volume, timerMin, play, toggle, stop, setVolume: applyVolume, setTimer }),
    [track, playing, volume, timerMin, play, toggle, stop, applyVolume, setTimer],
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
}
