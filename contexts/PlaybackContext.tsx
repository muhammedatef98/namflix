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
import { uriForTrack } from '@/lib/downloads';
import {
  channelTracks,
  radioChannelById,
  RADIO_ROTATE_MINUTES,
  type RadioChannelId,
} from '@/lib/radio';
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
  /** Active radio channel (null when the user is on a single track or silent). */
  radioChannel: RadioChannelId | null;
  /** Start a radio channel — plays its tracks in order, rotating every N min. */
  startRadio: (channelId: RadioChannelId) => void;
  /**
   * Pause for an interruption (e.g. a rewarded ad) and return a function that
   * resumes exactly where it was — unless the user or the sleep timer changed
   * playback in between, in which case it leaves things alone.
   */
  suspend: () => () => void;
};

const PlaybackContext = createContext<PlaybackValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<SoundTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [timerMin, setTimerMin] = useState<number | null>(null);
  const [radioChannel, setRadioChannel] = useState<RadioChannelId | null>(null);

  const playerRef = useRef<AudioPlayer | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Radio rotation timer + index, kept outside React state so the next
  // rotation reads the current index without stale closures.
  const radioRotationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const radioQueueRef = useRef<string[]>([]);
  const radioIndexRef = useRef(0);
  const volumeRef = useRef(1);
  const playingRef = useRef(false);
  // Bumped on every real playback change so a stale suspend() can't resume.
  const versionRef = useRef(0);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(
      () => undefined,
    );
    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (radioRotationRef.current) clearTimeout(radioRotationRef.current);
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

  const clearRadio = useCallback(() => {
    if (radioRotationRef.current) clearTimeout(radioRotationRef.current);
    radioRotationRef.current = null;
    radioQueueRef.current = [];
    radioIndexRef.current = 0;
    setRadioChannel(null);
  }, []);

  const applyVolume = useCallback((v: number) => {
    volumeRef.current = v;
    setVolumeState(v);
    if (playerRef.current) playerRef.current.volume = v;
  }, []);

  const stop = useCallback(() => {
    versionRef.current += 1;
    clearFade();
    clearTimer();
    clearRadio();
    playerRef.current?.release();
    playerRef.current = null;
    setTrack(null);
    setPlaying(false);
  }, [clearTimer, clearRadio]);

  const startFadeOut = useCallback(() => {
    clearFade();
    let v = volumeRef.current;
    const step = v / FADE_OUT_STEPS;
    fadeRef.current = setInterval(() => {
      v = Math.max(0, v - step);
      if (playerRef.current) playerRef.current.volume = v;
      if (v <= 0) {
        clearFade();
        versionRef.current += 1;
        playerRef.current?.pause();
        if (playerRef.current) playerRef.current.volume = volumeRef.current;
        setPlaying(false);
        setTimerMin(null);
        timerRef.current = null;
      }
    }, FADE_OUT_MS / FADE_OUT_STEPS);
  }, []);

  /**
   * Load a track and fade it in. Shared by single-track play() and by radio
   * rotation — both want the same fade-in, same player handling.
   */
  const loadAndFadeIn = useCallback((next: SoundTrack) => {
    versionRef.current += 1;
    clearFade();
    playerRef.current?.release();
    const player = createAudioPlayer({ uri: uriForTrack(next) });
    player.loop = true;
    player.volume = 0;
    player.play();
    playerRef.current = player;
    setTrack(next);
    setPlaying(true);

    let step = 0;
    fadeRef.current = setInterval(() => {
      step += 1;
      const v = Math.min(volumeRef.current, (step / FADE_IN_STEPS) * volumeRef.current);
      if (playerRef.current) playerRef.current.volume = v;
      if (step >= FADE_IN_STEPS) clearFade();
    }, FADE_IN_MS / FADE_IN_STEPS);
  }, []);

  const play = useCallback(
    (trackId: string) => {
      const next = trackById(trackId);
      if (!next) return;
      // Picking a specific track means leaving radio — the user chose.
      clearRadio();
      if (track?.id === trackId && playerRef.current) {
        if (!playing) {
          playerRef.current.play();
          setPlaying(true);
        }
        return;
      }
      loadAndFadeIn(next);
      void recordToolUse('sound');
    },
    [track, playing, loadAndFadeIn, clearRadio],
  );

  // Rotation walks through the channel's queue, looping it. Scheduled fresh on
  // every advance so a changed ROTATE_MINUTES or a channel switch is honoured.
  const scheduleRotation = useCallback(() => {
    if (radioRotationRef.current) clearTimeout(radioRotationRef.current);
    radioRotationRef.current = setTimeout(() => {
      const q = radioQueueRef.current;
      if (q.length === 0) return;
      radioIndexRef.current = (radioIndexRef.current + 1) % q.length;
      const next = trackById(q[radioIndexRef.current]);
      if (next) loadAndFadeIn(next);
      scheduleRotation();
    }, RADIO_ROTATE_MINUTES * 60_000);
  }, [loadAndFadeIn]);

  const startRadio = useCallback(
    (channelId: RadioChannelId) => {
      const channel = radioChannelById(channelId);
      if (!channel) return;
      const queue = channelTracks(channel);
      if (queue.length === 0) return;
      // If the channel is already on, do nothing — a second tap on the same
      // channel should not restart it.
      if (radioChannel === channelId && playerRef.current) return;

      radioQueueRef.current = queue;
      radioIndexRef.current = 0;
      setRadioChannel(channelId);
      const first = trackById(queue[0]);
      if (first) loadAndFadeIn(first);
      void recordToolUse('sound');
      scheduleRotation();
    },
    [radioChannel, loadAndFadeIn, scheduleRotation],
  );

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    versionRef.current += 1;
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

  const suspend = useCallback(() => {
    const player = playerRef.current;
    if (!player || !playingRef.current) return () => undefined;
    // Only pause — any fade or sleep timer keeps running, so a timer that ends
    // during the interruption still ends the night's sound.
    player.pause();
    const version = versionRef.current;
    return () => {
      if (versionRef.current === version && playerRef.current === player) player.play();
    };
  }, []);

  const value = useMemo<PlaybackValue>(
    () => ({
      track,
      playing,
      volume,
      timerMin,
      play,
      toggle,
      stop,
      setVolume: applyVolume,
      setTimer,
      suspend,
      radioChannel,
      startRadio,
    }),
    [track, playing, volume, timerMin, play, toggle, stop, applyVolume, setTimer, suspend, radioChannel, startRadio],
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
}
