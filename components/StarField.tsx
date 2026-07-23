import { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withSequence,
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

// Each meteor: [startXpct, startYpct, travelAngleDeg, delayMs, restMs].
// Angles are screen-space (y points down): ~150° = down-and-left (the classic
// direction), ~28° = down-and-right. Long, irregular rests so a streak is a
// rare, quiet surprise — never a loop you can feel.
const METEORS: [number, number, number, number, number][] = [
  [84, 5, 152, 2500, 15000],
  [58, 2, 158, 9000, 24000],
  [16, 12, 28, 19000, 20000],
];

const TAIL_LEN = 118; // px — the visible streak length
const STREAK_MS = 650; // real meteors cross in well under a second

/**
 * One realistic shooting star: a bright point (head) leading a tail that
 * tapers to nothing behind it, drawn as an SVG gradient. It streaks fast
 * along its travel angle, brightening then fading, then rests dark for a long,
 * irregular gap before the next pass.
 */
function Meteor({
  startX,
  startY,
  angle,
  delay,
  rest,
}: {
  startX: number;
  startY: number;
  angle: number;
  delay: number;
  rest: number;
}) {
  const { width } = useWindowDimensions();
  const p = useSharedValue(0);
  const rad = (angle * Math.PI) / 180;
  const dist = width * 0.8;
  const dx = Math.cos(rad) * dist;
  const dy = Math.sin(rad) * dist;

  useEffect(() => {
    p.value = 0;
    p.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          // the streak — fast, slight deceleration as it burns out
          withTiming(1, { duration: STREAK_MS, easing: Easing.out(Easing.quad) }),
          // hold at the end (invisible) through the long dark rest
          withTiming(1, { duration: rest }),
          // reset instantly for the next pass
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, rest, p]);

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
        { rotate: `${angle}deg` },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.meteor, { left: `${startX}%`, top: `${startY}%` }, style]}
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
      {METEORS.map(([x, y, a, d, rest], i) => (
        <Meteor key={i} startX={x} startY={y} angle={a} delay={d} rest={rest} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  meteor: { position: 'absolute', width: TAIL_LEN, height: 12 },
});
