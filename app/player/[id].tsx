import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Svg, { Path, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useLocale } from '@/contexts/LocaleContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { usePlayback } from '@/contexts/PlaybackContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BackButton } from '@/components/BackButton';
import { NightPalette, FONT } from '@/constants/theme';
import { SoundArt } from '@/components/SoundArt';
import { trackById } from '@/lib/mediaLibrary';
import { SLEEP_TIPS } from '@/lib/sleepTips';

function PlayPauseIcon({ playing }: { playing: boolean }) {
  return (
    <Svg width={30} height={30} viewBox="0 0 24 24">
      {playing ? (
        <>
          <Rect x="6" y="5" width="4" height="14" rx="1.5" fill={NightPalette.voidBlack} />
          <Rect x="14" y="5" width="4" height="14" rx="1.5" fill={NightPalette.voidBlack} />
        </>
      ) : (
        <Path d="M8 5.5 L18 12 L8 18.5 Z" fill={NightPalette.voidBlack} />
      )}
    </Svg>
  );
}

/** A heart that fills when the sound is saved to favourites. */
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M12 20.5 C7 16.5 3.5 13.2 3.5 9.4 A4.6 4.6 0 0 1 12 6.6 A4.6 4.6 0 0 1 20.5 9.4 C20.5 13.2 17 16.5 12 20.5 Z"
        fill={filled ? RED : 'none'}
        stroke={filled ? RED : 'rgba(242,201,166,0.75)'}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const TIMER_OPTIONS = [15, 30, 60, 120] as const; // minutes
const TIP_MS = 11000;
const KEEP_AWAKE_TAG = 'namflix-player';

/**
 * Full-screen view over the global PlaybackContext. Leaving this screen never
 * stops the sound — playback only ends from the stop control, the mini
 * player's ✕, or the sleep timer's fade.
 */
export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, tc, isRTL } = useLocale();
  const { accent } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const playback = usePlayback();

  const screenTrack = trackById(id);

  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * SLEEP_TIPS.length));
  const tipRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [blackout, setBlackout] = useState(false);
  const blackoutOpacity = useSharedValue(0);
  const tipOpacity = useSharedValue(0);

  // Hand this track to the global player (no-op if it's already the one playing).
  useEffect(() => {
    if (screenTrack) playback.play(screenTrack.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenTrack?.id]);

  const isThisTrack = playback.track?.id === screenTrack?.id;
  const playing = isThisTrack && playback.playing;

  // Keep the screen awake only while this sound actually plays and we're here.
  useEffect(() => {
    if (playing) void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    else void deactivateKeepAwake(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [playing]);

  // Rotate the calming tip captions while playing.
  useEffect(() => {
    if (!playing) return;
    tipOpacity.value = withTiming(1, { duration: 1200 });
    tipRef.current = setInterval(() => {
      tipOpacity.value = withSequence(
        withTiming(0, { duration: 900 }),
        withTiming(1, { duration: 1400 }),
      );
      setTipIndex((i) => {
        if (SLEEP_TIPS.length < 2) return 0;
        let n = i;
        while (n === i) n = Math.floor(Math.random() * SLEEP_TIPS.length);
        return n;
      });
    }, TIP_MS);
    return () => {
      if (tipRef.current) clearInterval(tipRef.current);
    };
  }, [playing, tipOpacity]);

  const toggleBlackout = () => {
    const next = !blackout;
    setBlackout(next);
    blackoutOpacity.value = withTiming(next ? 1 : 0, { duration: 600 });
  };

  const blackoutStyle = useAnimatedStyle(() => ({ opacity: blackoutOpacity.value }));
  const tipStyle = useAnimatedStyle(() => ({ opacity: tipOpacity.value }));

  if (!screenTrack) {
    return (
      <View style={styles.missingFill}>
        <Text style={styles.missing}>—</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <SoundArt type={screenTrack.art} />
      <LinearGradient
        colors={['rgba(10,5,3,0.25)', 'rgba(10,5,3,0.75)', NightPalette.voidBlack]}
        locations={[0, 0.55, 1]}
        style={styles.fill}
      >
        <SafeAreaView style={styles.fill}>
          <View style={[styles.topRow, isRTL && styles.rowRTL]}>
            <BackButton />
            <Pressable
              onPress={() => toggleFavorite(screenTrack.id)}
              hitSlop={10}
              style={({ pressed }) => [styles.heartBtn, pressed && styles.heartPressed]}
            >
              <HeartIcon filled={isFavorite(screenTrack.id)} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <View style={styles.head}>
              <Text style={styles.title}>{tc(screenTrack.title)}</Text>
              <Text style={styles.subtitle}>{tc(screenTrack.subtitle)}</Text>
            </View>

            {/* Rotating, calming caption drawn from the app's methods. */}
            <View style={styles.tipArea}>
              <Animated.Text style={[styles.tip, tipStyle]}>{tc(SLEEP_TIPS[tipIndex])}</Animated.Text>
            </View>

            <Pressable
              style={styles.playBtn}
              onPress={() => (isThisTrack ? playback.toggle() : playback.play(screenTrack.id))}
            >
              <PlayPauseIcon playing={playing} />
            </Pressable>

            {/* Volume */}
            <View style={[styles.volumeRow, isRTL && styles.rowRTL]}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path d="M4 9v6h4l5 4V5L8 9H4z" fill="rgba(242,201,166,0.5)" />
              </Svg>
              <Slider
                style={styles.volumeSlider}
                value={playback.volume}
                onValueChange={playback.setVolume}
                minimumTrackTintColor={accent}
                maximumTrackTintColor={NightPalette.surface}
                thumbTintColor={accent}
              />
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M4 9v6h4l5 4V5L8 9H4z M16 8a5 5 0 0 1 0 8 M18.5 5.5a9 9 0 0 1 0 13"
                  stroke="rgba(242,201,166,0.7)"
                  strokeWidth={1.6}
                  fill="rgba(242,201,166,0.5)"
                  strokeLinecap="round"
                />
              </Svg>
            </View>

            <Text style={styles.controlLabel}>{t('sleepTimer')}</Text>
            <View style={[styles.timerRow, isRTL && styles.rowRTL]}>
              {TIMER_OPTIONS.map((min) => (
                <Pressable
                  key={min}
                  onPress={() => playback.setTimer(min)}
                  style={[styles.chip, playback.timerMin === min && styles.chipOn]}
                >
                  <Text style={[styles.chipText, playback.timerMin === min && styles.chipTextOn]}>
                    {min < 60 ? `${min}m` : `${min / 60}h`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.blackoutBtn} onPress={toggleBlackout}>
              <Text style={styles.blackoutText}>{t('screenOff')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View pointerEvents={blackout ? 'auto' : 'none'} style={[styles.blackout, blackoutStyle]}>
        <Pressable style={styles.blackoutFill} onPress={toggleBlackout}>
          <Text style={styles.wakeHint}>{t('tapToWake')}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const RED = '#FF3300';

const styles = StyleSheet.create({
  fill: { flex: 1 },
  missingFill: { flex: 1, backgroundColor: NightPalette.voidBlack, alignItems: 'center', justifyContent: 'center' },
  missing: { color: NightPalette.dimText, fontSize: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowRTL: { flexDirection: 'row-reverse' },
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36,17,9,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
    marginHorizontal: 20,
    marginTop: 6,
  },
  heartPressed: { opacity: 0.7 },
  body: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  head: { alignItems: 'center' },
  title: { color: '#F2C9A6', fontSize: 28, fontFamily: FONT.bold, lineHeight: 40, textAlign: 'center' },
  subtitle: { color: NightPalette.dimText, fontSize: 14, marginTop: 6, lineHeight: 22, textAlign: 'center' },
  tipArea: { minHeight: 72, justifyContent: 'center', marginTop: 20, marginBottom: 6 },
  tip: { color: NightPalette.textPrimary, fontSize: 17, lineHeight: 28, fontFamily: FONT.medium, textAlign: 'center' },
  playBtn: {
    alignSelf: 'center',
    marginTop: 10,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 8,
  },
  volumeSlider: { flex: 1, height: 32 },
  controlLabel: { color: NightPalette.dimText, fontSize: 12, marginTop: 18, marginBottom: 12, lineHeight: 18, textAlign: 'center' },
  timerRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
  },
  chipOn: { backgroundColor: NightPalette.amber, borderColor: NightPalette.amber },
  chipText: { color: NightPalette.dimText, fontSize: 14, lineHeight: 20 },
  chipTextOn: { color: NightPalette.voidBlack, fontFamily: FONT.bold },
  blackoutBtn: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
    alignItems: 'center',
  },
  blackoutText: { color: NightPalette.textPrimary, fontSize: 15, lineHeight: 22 },
  blackout: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000' },
  blackoutFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  wakeHint: { color: 'rgba(255,51,0,0.14)', fontSize: 13, lineHeight: 20 },
});
