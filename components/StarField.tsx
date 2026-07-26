import { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
  Circle,
} from 'react-native-svg';

// Fixed scatter of faint stars — [xPercent, yPercent, size].
const STARS: [number, number, number][] = [
  [8, 6, 1.5], [22, 12, 1], [37, 5, 2], [54, 10, 1], [69, 4, 1.5], [84, 9, 1], [93, 16, 2],
  [14, 20, 1], [46, 22, 1.5], [61, 26, 1], [78, 30, 1.5], [5, 34, 2], [30, 33, 1],
  [88, 40, 1], [18, 46, 1.5], [50, 44, 1], [72, 52, 2], [9, 58, 1], [40, 60, 1.5],
  [64, 66, 1], [85, 70, 1.5], [24, 72, 1], [54, 78, 1], [12, 84, 2], [76, 86, 1],
  [38, 90, 1.5], [92, 92, 1], [60, 94, 1],
  [3, 14, 1], [29, 8, 1], [43, 15, 1.5], [58, 18, 1], [74, 14, 1], [90, 26, 1],
  [11, 28, 1.5], [34, 26, 1], [67, 36, 1], [82, 48, 1], [2, 46, 1], [26, 52, 1.5],
  [45, 54, 1], [57, 60, 1], [79, 62, 1], [17, 64, 1], [33, 68, 1.5], [70, 74, 1],
  [90, 80, 1], [6, 74, 1], [48, 70, 1], [88, 58, 1.5], [20, 88, 1], [50, 88, 1],
  [66, 90, 1.5], [4, 92, 1], [83, 96, 1], [30, 96, 1],
];

// How many meteors can be streaking through the sky concurrently. Each one
// re-randomises its start point and direction on every pass, so a streak can
// appear anywhere on screen rather than from a few fixed spots.
const METEOR_COUNT = 4;

const TAIL_LEN = 118; // px — the visible streak length
const STREAK_MS = 650; // real meteors cross in well under a second

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// A fresh, random spawn: any point on screen, streaking on a downward diagonal
// (down-left or down-right — the natural look), after a long irregular rest.
function randomPass() {
  const goRight = Math.random() < 0.5;
  return {
    startX: rand(5, 95),
    startY: rand(2, 65),
    // down-right ≈ 20–55°, down-left ≈ 125–160° (screen space, y points down)
    angle: goRight ? rand(20, 55) : rand(125, 160),
    rest: rand(6000, 22000),
  };
}

/**
 * One realistic shooting star: a bright point (head) leading a tail that
 * tapers to nothing behind it, drawn as an SVG gradient. It streaks fast
 * along its travel angle, brightening then fading, then rests dark for a long,
 * irregular gap before the next pass.
 */
function Meteor({ initialDelay }: { initialDelay: number }) {
  const { width } = useWindowDimensions();
  const p = useSharedValue(0);
  const [pass, setPass] = useState(randomPass);

  const rad = (pass.angle * Math.PI) / 180;
  const dist = width * 0.8;
  const dx = Math.cos(rad) * dist;
  const dy = Math.sin(rad) * dist;

  // Self-scheduling loop: streak once, rest in the dark, then re-randomise the
  // spawn and go again — so no two passes share a place or a direction.
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const run = () => {
      if (!alive) return;
      p.value = 0;
      p.value = withTiming(1, { duration: STREAK_MS, easing: Easing.out(Easing.quad) });
      timer = setTimeout(() => {
        if (!alive) return;
        setPass(randomPass()); // fresh place + angle for the next pass
      }, STREAK_MS + pass.rest);
    };

    timer = setTimeout(run, initialDelay);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // Re-run whenever a new random pass is set.
  }, [pass, initialDelay, p]);

  const style = useAnimatedStyle(() => {
    'worklet';
    const t = p.value;
    // brightness envelope: quick flash in, lingering fade out, dark at rest
    const fadeIn = 0.1;
    const fadeOut = 0.4;
    let o: number;
    if (t < fadeIn) o = t / fadeIn;
    else if (t > 1 - fadeOut) o = (1 - t) / fadeOut;
    else o = 1;
    return {
      opacity: o * 0.9,
      transform: [
        { translateX: t * dx },
        { translateY: t * dy },
        { rotate: `${pass.angle}deg` },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.meteor, { left: `${pass.startX}%`, top: `${pass.startY}%` }, style]}
    >
      <Svg width={TAIL_LEN} height={12} viewBox={`0 0 ${TAIL_LEN} 12`}>
        <Defs>
          <SvgGradient id="tail" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FBE9D6" stopOpacity="0" />
            <Stop offset="0.7" stopColor="#FBE9D6" stopOpacity="0.35" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
          </SvgGradient>
        </Defs>
        {/* tapering tail: wide at the head (right), a point at the tail (left) */}
        <Path d={`M ${TAIL_LEN - 4} 4.4 L ${TAIL_LEN - 4} 7.6 L 4 6 Z`} fill="url(#tail)" />
        {/* soft glow + bright head */}
        <Circle cx={TAIL_LEN - 4} cy={6} r={3.4} fill="#FFFFFF" opacity={0.25} />
        <Circle cx={TAIL_LEN - 4} cy={6} r={1.7} fill="#FFFFFF" />
      </Svg>
    </Animated.View>
  );
}

/**
 * A calm field of faint stars — with a rare, realistic shooting star gliding
 * through. Absolute-fills its parent behind content; never intercepts touches.
 */
export function StarField({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {STARS.map(([x, y, s], i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: s,
            height: s,
            borderRadius: s,
            backgroundColor: '#FFF',
            opacity: opacity * (0.4 + (i % 3) * 0.3),
          }}
        />
      ))}
      {Array.from({ length: METEOR_COUNT }).map((_, i) => (
        <Meteor key={i} initialDelay={2000 + i * 4000 + Math.random() * 3000} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  meteor: { position: 'absolute', width: TAIL_LEN, height: 12 },
});
