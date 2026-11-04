import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useLocale } from '@/contexts/LocaleContext';
import { usePlayback } from '@/contexts/PlaybackContext';
import { useMixer } from '@/contexts/MixerContext';
import { BackButton } from '@/components/BackButton';
import { FONT } from '@/constants/theme';

/**
 * Night Screen — somewhere to land when you wake in the dark.
 *
 * Deliberately NO clock: checking the time at night feeds the mental
 * arithmetic ("only 4 hours left…") that keeps people awake, which is why
 * Night Rescue tells users not to look. Instead: a near-black screen with a
 * very dim warm glow that swells and fades at a slow breathing pace
 * (~6 breaths a minute) to breathe along with, and the sound controls.
 *
 * Controls fade away after a few seconds so only the glow is left; a tap
 * brings them back.
 */

const BREATH_IN_MS = 4500;
const BREATH_OUT_MS = 5500;
const CONTROLS_HIDE_MS = 6000;
const KEEP_AWAKE_TAG = 'namflix-night';
/** A free, gentle bed so this screen works for everyone. */
const FALLBACK_TRACK = 'rain-soft';

export default function NightScreen() {
  const router = useRouter();
  const { t, tc, isRTL } = useLocale();
  const playback = usePlayback();
  const mixer = useMixer();

  const glow = useSharedValue(0.35);
  const controls = useSharedValue(1);
  const [controlsShown, setControlsShown] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: BREATH_IN_MS, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: BREATH_OUT_MS, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [glow]);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      controls.value = withTiming(0, { duration: 1200 });
      setControlsShown(false);
    }, CONTROLS_HIDE_MS);
  }, [controls]);

  useEffect(() => {
    scheduleHide();
  }, [scheduleHide]);

  const wake = () => {
    controls.value = withTiming(1, { duration: 400 });
    setControlsShown(true);
    scheduleHide();
  };

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.22,
    transform: [{ scale: 0.85 + glow.value * 0.25 }],
  }));
  const controlsStyle = useAnimatedStyle(() => ({ opacity: controls.value }));

  // What's playing: a single sound, or the mixer, or nothing.
  const mixActive = mixer.hasMix;
  const soundName = playback.track
    ? tc(playback.track.title)
    : mixActive
      ? t('mixerTitle')
      : null;
  const isPlaying = playback.track ? playback.playing : mixActive && mixer.playing;

  const togglePlay = () => {
    if (playback.track) playback.toggle();
    else if (mixActive) mixer.toggle();
    else playback.play(FALLBACK_TRACK);
    scheduleHide();
  };

  return (
    <View style={styles.root}>
      {/* The breathing glow */}
      <View style={styles.glowWrap} pointerEvents="none">
        <Animated.View style={[styles.glow, glowStyle]} />
      </View>

      {/* Tapping anywhere brings the controls back */}
      <Pressable style={StyleSheet.absoluteFill} onPress={wake} accessibilityLabel={t('nightShowControls')} />

      <SafeAreaView style={styles.fill} pointerEvents="box-none">
        <Animated.View style={[styles.fill, controlsStyle]} pointerEvents={controlsShown ? 'box-none' : 'none'}>
          <BackButton />

          <View style={styles.center} pointerEvents="box-none">
            <Text style={[styles.hint, isRTL && styles.rtl]}>{t('nightBreatheHint')}</Text>
          </View>

          <View style={styles.bottom} pointerEvents="box-none">
            <Text style={[styles.now, isRTL && styles.rtl]} numberOfLines={1}>
              {soundName ?? t('nightNothingPlaying')}
            </Text>
            <Pressable
              onPress={togglePlay}
              style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
            >
              <Text style={styles.playText}>
                {soundName ? (isPlaying ? t('mixerPause') : t('mixerPlay')) : t('nightPlayRain')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/rescue')}
              hitSlop={10}
              style={({ pressed }) => [styles.rescueLink, pressed && styles.pressed]}
            >
              <Text style={[styles.rescueText, isRTL && styles.rtl]}>{t('nightNeedHelp')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// Colours are dimmer and redder than the rest of the app on purpose: this
// screen is meant to be looked at with dark-adapted eyes.
const DIM = 'rgba(176,74,40,0.55)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  fill: { flex: 1 },
  glowWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  glow: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#B2451C' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  hint: { color: DIM, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 200 },
  bottom: { alignItems: 'center', paddingBottom: 36, paddingHorizontal: 32, gap: 14 },
  now: { color: DIM, fontSize: 13, lineHeight: 20, fontFamily: FONT.medium },
  playBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(176,74,40,0.35)',
    paddingVertical: 12,
    paddingHorizontal: 34,
  },
  playText: { color: DIM, fontSize: 14, fontFamily: FONT.medium, lineHeight: 20 },
  rescueLink: { paddingVertical: 6 },
  rescueText: { color: 'rgba(176,74,40,0.4)', fontSize: 12, lineHeight: 18, textDecorationLine: 'underline' },
  pressed: { opacity: 0.6 },
  rtl: { writingDirection: 'rtl' },
});
