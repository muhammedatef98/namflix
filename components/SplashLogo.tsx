import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Logo } from '@/components/Logo';
import { NightPalette, FONT } from '@/constants/theme';

const TWINKLES = [
  [-70, -50], [80, -60], [-90, 40], [95, 30], [-40, 90], [60, 95], [0, -110], [-110, 0],
] as const;

/** A brief animated intro: the crescent rises and fades in, stars twinkle. */
export function SplashLogo({ onDone }: { onDone: () => void }) {
  const appear = useSharedValue(0);
  const twinkle = useSharedValue(0.2);
  const fade = useSharedValue(1);

  useEffect(() => {
    appear.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.cubic) });
    twinkle.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.2, { duration: 700 })),
      -1,
      true,
    );
    const timeoutId = setTimeout(() => {
      fade.value = withTiming(0, { duration: 550 }, (done) => {
        if (done) runOnJS(onDone)();
      });
    }, 1650);
    return () => clearTimeout(timeoutId);
  }, [appear, twinkle, fade, onDone]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [
      { scale: interpolate(appear.value, [0, 1], [0.7, 1]) },
      { translateY: interpolate(appear.value, [0, 1], [14, 0]) },
    ],
  }));
  const brandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(appear.value, [0.5, 1], [0, 1], 'clamp'),
  }));
  const twinkleStyle = useAnimatedStyle(() => ({ opacity: twinkle.value }));

  return (
    <Animated.View style={[styles.fill, containerStyle]}>
      <View style={styles.center}>
        {TWINKLES.map(([x, y], i) => (
          <Animated.View
            key={i}
            style={[
              styles.star,
              { transform: [{ translateX: x }, { translateY: y }], width: 2 + (i % 2), height: 2 + (i % 2) },
              twinkleStyle,
            ]}
          />
        ))}
        <Animated.View style={logoStyle}>
          <Logo size={96} />
        </Animated.View>
        <Animated.Text style={[styles.brand, brandStyle]}>Namflix</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, backgroundColor: NightPalette.voidBlack, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  star: { position: 'absolute', borderRadius: 2, backgroundColor: '#F2C9A6' },
  brand: {
    marginTop: 22,
    fontSize: 26,
    fontFamily: FONT.light,
    color: NightPalette.textPrimary,
    letterSpacing: 6,
  },
});
