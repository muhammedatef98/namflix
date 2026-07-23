import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Ellipse,
  Line,
  G,
} from 'react-native-svg';
import type { SoundArt as ArtType } from '@/lib/mediaLibrary';

/**
 * Living artwork per sound type — every scene actually MOVES like what you
 * hear: rain falls, waves roll, flames flicker, the fan spins, the cat
 * breathes. All motion is compositor-friendly (transform/opacity on Views
 * wrapping SVG layers), looped, and slow enough to soothe rather than wake.
 */

const A = '#C24E1A';
const A2 = '#8C2A12';
const GLOW = '#E08A4A';
const VB = '0 0 100 130';

// ── Motion wrappers ──────────────────────────────────────────────────────────

/** Endless linear scroll of a double-height layer (rain, snow, waterfall). */
function Fall({ children, duration, height }: { children: ReactNode; duration: number; height: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = 0;
    y.value = withRepeat(withTiming(height, { duration, easing: Easing.linear }), -1, false);
  }, [duration, height, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: -height, height: height * 2 }, style]}>
      {children}
    </Animated.View>
  );
}

/** Gentle side-to-side drift (waves, wind, birds). */
function Sway({ children, duration, dx, dy = 0 }: { children: ReactNode; duration: number; dx: number; dy?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [duration, p]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: p.value * dx }, { translateY: p.value * dy }],
  }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

/** Organic opacity/scale flicker (fire, fireflies, stars). */
function Flicker({
  children,
  duration,
  min = 0.55,
  max = 1,
  delay = 0,
  scale = false,
}: {
  children: ReactNode;
  duration: number;
  min?: number;
  max?: number;
  delay?: number;
  scale?: boolean;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [duration, delay, p]);
  const style = useAnimatedStyle(() => ({
    opacity: min + (max - min) * p.value,
    transform: scale ? [{ scaleY: 0.96 + 0.08 * p.value }] : [],
  }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

/** Continuous rotation (fan blades). */
function Spin({ children, duration }: { children: ReactNode; duration: number }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = 0;
    r.value = withRepeat(withTiming(360, { duration, easing: Easing.linear }), -1, false);
  }, [duration, r]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

/** Lightning: long darkness, then a double flash. */
function Flash({ children }: { children: ReactNode }) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 5200 }),
        withTiming(0.95, { duration: 90 }),
        withTiming(0.1, { duration: 160 }),
        withTiming(0.75, { duration: 90 }),
        withTiming(0, { duration: 400 }),
      ),
      -1,
      false,
    );
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

/** Slow breathing (the sleeping cat). */
function Breathe({ children, duration = 3200 }: { children: ReactNode; duration?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [duration, p]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + 0.015 * p.value }, { scaleY: 1 + 0.035 * p.value }],
  }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

const Layer = ({ children }: { children: ReactNode }) => (
  <Svg width="100%" height="100%" viewBox={VB} preserveAspectRatio="xMidYMid slice">
    {children}
  </Svg>
);

// ── Scenes ───────────────────────────────────────────────────────────────────

function RainDrops({ opacity = 0.55 }: { opacity?: number }) {
  const drops = [12, 26, 40, 54, 68, 82, 20, 48, 76, 34, 62, 90];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 260" preserveAspectRatio="xMidYMid slice">
      {[0, 130].map((off) =>
        drops.map((x, i) => (
          <Line
            key={`${off}-${i}`}
            x1={x}
            y1={off + 8 + (i % 5) * 26}
            x2={x - 4}
            y2={off + 20 + (i % 5) * 26}
            stroke={GLOW}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={opacity}
          />
        )),
      )}
    </Svg>
  );
}

function SnowFlakes() {
  const flakes = [14, 28, 42, 56, 70, 84, 22, 50, 78, 36, 64, 92];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 260" preserveAspectRatio="xMidYMid slice">
      {[0, 130].map((off) =>
        flakes.map((x, i) => (
          <Circle
            key={`${off}-${i}`}
            cx={x + (i % 2) * 3}
            cy={off + 10 + (i % 5) * 25}
            r={i % 3 === 0 ? 1.6 : 1.1}
            fill="#F2C9A6"
            opacity={0.6}
          />
        )),
      )}
    </Svg>
  );
}

function FallStreaks() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 260" preserveAspectRatio="xMidYMid slice">
      {[0, 130].map((off) =>
        [26, 38, 50, 62, 74].map((x, i) => (
          <Line
            key={`${off}-${i}`}
            x1={x}
            y1={off + (i % 3) * 12}
            x2={x}
            y2={off + 34 + (i % 3) * 12}
            stroke={GLOW}
            strokeWidth={1.3}
            strokeLinecap="round"
            opacity={0.35 + (i % 3) * 0.15}
          />
        )),
      )}
    </Svg>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function SoundArt({
  type,
  style,
  animated = true,
}: {
  type: ArtType;
  style?: object;
  animated?: boolean;
}) {
  const [h, setH] = useState(0);
  const anim = animated && h > 0;

  return (
    <View
      style={[styles.wrap, style]}
      pointerEvents="none"
      onLayout={(e) => setH(e.nativeEvent.layout.height)}
    >
      {/* Sky */}
      <Svg width="100%" height="100%" viewBox={VB} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3A1608" />
            <Stop offset="1" stopColor="#0A0503" />
          </SvgGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="130" fill="url(#sky)" />

        {/* Static scenery per type */}
        {type === 'rain' && <Circle cx="72" cy="26" r="12" fill="#4A1A0A" opacity={0.5} />}
        {type === 'waves' && <Circle cx="24" cy="30" r="9" fill="#4A1A0A" opacity={0.6} />}
        {type === 'fire' && <Rect x="34" y="104" width="32" height="4" rx="2" fill="#3A1608" />}
        {type === 'night' && (
          <Path d="M78 26 a 12 12 0 1 1 -10 -14 a 9 9 0 0 0 10 14 Z" fill={GLOW} opacity={0.85} />
        )}
        {type === 'thunder' && (
          <Path d="M20 34 q -10 0 -10 9 q 0 8 10 8 h44 q 12 0 12 -11 q 0 -10 -12 -10 q -2 -12 -18 -12 q -14 0 -16 12 Z" fill="#4A1A0A" opacity={0.7} />
        )}
        {type === 'snow' && <Path d="M-5 112 q 25 -8 52 0 t 60 0 V130 H-5 Z" fill="#4A1A0A" opacity={0.5} />}
        {type === 'train' && (
          <G>
            <Path d="M20 118 L44 66 M80 118 L56 66" stroke={A2} strokeWidth={1.4} opacity={0.5} />
            {[70, 86, 102].map((y, i) => (
              <Line key={i} x1={30 - i * 3} y1={y} x2={70 + i * 3} y2={y} stroke={A2} strokeWidth={1.4} opacity={0.4} />
            ))}
          </G>
        )}
        {type === 'forest' && (
          <G>
            <Path d="M80 24 a 11 11 0 1 1 -9 -13 a 8 8 0 0 0 9 13 Z" fill={GLOW} opacity={0.8} />
            {[12, 26, 40, 54, 68, 82, 94].map((x, i) => (
              <Path key={i} d={`M${x} ${78 - (i % 3) * 6} l 7 22 h -14 Z`} fill="#3A1608" opacity={0.85} />
            ))}
            <Path d="M0 100 H100 V130 H0 Z" fill="#2A0D06" opacity={0.7} />
          </G>
        )}
        {type === 'waterfall' && (
          <G fill={A}>
            {[30, 46, 58, 70].map((x, i) => (
              <Circle key={i} cx={x} cy={108} r={2} opacity={0.5} />
            ))}
          </G>
        )}
        {type === 'cat' && (
          <G>
            {/* moonlit window */}
            <Rect x="62" y="12" width="26" height="30" rx="3" fill="#2A0D06" opacity={0.9} />
            <Circle cx="75" cy="24" r="6" fill={GLOW} opacity={0.7} />
            {/* rug */}
            <Ellipse cx="46" cy="106" rx="34" ry="8" fill="#2A0D06" opacity={0.8} />
          </G>
        )}
        {type === 'birds' && (
          <G>
            {/* rising sun */}
            <Circle cx="50" cy="96" r="20" fill={GLOW} opacity={0.35} />
            <Circle cx="50" cy="96" r="12" fill={GLOW} opacity={0.55} />
            <Path d="M0 100 H100 V130 H0 Z" fill="#2A0D06" opacity={0.85} />
            {/* branch */}
            <Path d="M2 40 q 20 6 36 2" stroke="#3A1608" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          </G>
        )}
        {type === 'wind' && (
          <G stroke={A} fill="none" strokeWidth={1.6} strokeLinecap="round" opacity={0.35}>
            {[36, 58, 80].map((y, i) => (
              <Path key={i} d={`M8 ${y} q 40 -14 70 0`} opacity={0.4 + i * 0.2} />
            ))}
          </G>
        )}
        {type === 'fan' && (
          <G stroke={A} fill="none" opacity={0.5}>
            <Circle cx="50" cy="60" r="26" strokeWidth={1.2} />
          </G>
        )}
      </Svg>

      {/* Animated layers */}
      {type === 'rain' &&
        (anim ? (
          <>
            <Fall duration={7000} height={h}><RainDrops /></Fall>
            <Fall duration={9500} height={h}><RainDrops opacity={0.3} /></Fall>
          </>
        ) : (
          <View style={StyleSheet.absoluteFill}><Layer>
            {[12, 26, 40, 54, 68, 82].map((x, i) => (
              <Line key={i} x1={x} y1={20 + (i % 4) * 22} x2={x - 4} y2={32 + (i % 4) * 22} stroke={GLOW} strokeWidth={1} strokeLinecap="round" opacity={0.55} />
            ))}
          </Layer></View>
        ))}

      {type === 'waves' && (
        <Sway duration={anim ? 12000 : 0} dx={anim ? 6 : 0} dy={2}>
          <Layer>
            <G stroke={A} fill="none" strokeWidth={1.4} strokeLinecap="round">
              {[70, 84, 98, 112].map((y, i) => (
                <Path key={i} d={`M-15 ${y} q 15 -8 30 0 t 30 0 t 30 0 t 30 0 t 30 0`} opacity={0.3 + i * 0.15} />
              ))}
            </G>
          </Layer>
        </Sway>
      )}

      {type === 'fire' && (
        <>
          <Flicker duration={anim ? 2000 : 0} min={0.82} scale>
            <Layer>
              <Path d="M50 105 C30 95 38 78 50 58 C62 78 70 95 50 105 Z" fill={A2} opacity={0.8} />
              <Path d="M50 102 C38 95 44 82 50 68 C56 82 62 95 50 102 Z" fill={A} />
            </Layer>
          </Flicker>
          <Flicker duration={anim ? 2600 : 0} min={0.65} scale>
            <Layer>
              <Path d="M50 98 C44 93 47 86 50 78 C53 86 56 93 50 98 Z" fill={GLOW} />
            </Layer>
          </Flicker>
        </>
      )}

      {type === 'wind' && (
        <Sway duration={anim ? 8500 : 0} dx={anim ? 7 : 0}>
          <Layer>
            <G stroke={GLOW} fill="none" strokeWidth={1.4} strokeLinecap="round" opacity={0.5}>
              {[30, 52, 74].map((y, i) => (
                <Path key={i} d={`M-10 ${y + 6} q 40 -14 80 0`} opacity={0.35 + i * 0.2} />
              ))}
              <Path d="M70 36 q 12 4 0 10" />
            </G>
          </Layer>
        </Sway>
      )}

      {type === 'night' && (
        <>
          {[0, 1, 2].map((k) => (
            <Flicker key={k} duration={anim ? 3400 + k * 1200 : 0} min={0.3} delay={k * 900}>
              <Layer>
                {[[18, 24], [40, 16], [64, 28], [82, 20], [30, 40], [72, 46], [12, 54], [88, 60]]
                  .filter((_, i) => i % 3 === k)
                  .map(([x, y], i) => (
                    <Circle key={i} cx={x} cy={y} r={1} fill={GLOW} opacity={0.8} />
                  ))}
              </Layer>
            </Flicker>
          ))}
          <View style={StyleSheet.absoluteFill}>
            <Layer>
              {[16, 32, 48, 64, 80, 96].map((x, i) => (
                <Line key={i} x1={x} y1={112 - (i % 3)} x2={x + 6} y2={112 - (i % 3)} stroke={A2} strokeWidth={2} opacity={0.5} />
              ))}
            </Layer>
          </View>
        </>
      )}

      {type === 'fan' && (
        <>
          <Spin duration={anim ? 11000 : 0}>
            <Layer>
              {[0, 120, 240].map((deg) => (
                <Path
                  key={deg}
                  d="M50 60 C 44 44 52 40 62 46 C 58 56 56 58 50 60 Z"
                  fill={A2}
                  opacity={0.8}
                  transform={`rotate(${deg} 50 60)`}
                />
              ))}
            </Layer>
          </Spin>
          <View style={StyleSheet.absoluteFill}>
            <Layer><Circle cx="50" cy="60" r="3" fill={A} /></Layer>
          </View>
        </>
      )}

      {type === 'thunder' && (
        <>
          {anim ? (
            <Fall duration={7500} height={h}><RainDrops opacity={0.4} /></Fall>
          ) : null}
          <Flash>
            <Layer>
              <Path d="M50 50 L44 66 L50 66 L46 82 L60 60 L53 60 L58 50 Z" fill={GLOW} />
              <Rect x="0" y="0" width="100" height="130" fill={GLOW} opacity={0.08} />
            </Layer>
          </Flash>
          {!anim && (
            <View style={StyleSheet.absoluteFill}>
              <Layer>
                <Path d="M50 50 L44 66 L50 66 L46 82 L60 60 L53 60 L58 50 Z" fill={GLOW} opacity={0.9} />
              </Layer>
            </View>
          )}
        </>
      )}

      {type === 'waterfall' &&
        (anim ? (
          <>
            <Fall duration={4500} height={h}><FallStreaks /></Fall>
            <Fall duration={6000} height={h}><FallStreaks /></Fall>
          </>
        ) : (
          <View style={StyleSheet.absoluteFill}><Layer>
            {[26, 38, 50, 62, 74].map((x, i) => (
              <Line key={i} x1={x} y1={14} x2={x} y2={104 - (i % 3) * 8} stroke={GLOW} strokeWidth={1.3} strokeLinecap="round" opacity={0.4} />
            ))}
          </Layer></View>
        ))}

      {type === 'snow' &&
        (anim ? (
          <>
            <Fall duration={17000} height={h}><SnowFlakes /></Fall>
            <Fall duration={24000} height={h}><SnowFlakes /></Fall>
          </>
        ) : (
          <View style={StyleSheet.absoluteFill}><SnowFlakes /></View>
        ))}

      {type === 'train' && (
        <Sway duration={anim ? 3000 : 0} dx={anim ? 1 : 0} dy={0.8}>
          <Layer>
            <Rect x="38" y="40" width="24" height="20" rx="4" fill={A} opacity={0.85} />
            <Rect x="43" y="45" width="6" height="6" rx="1" fill="#160A05" />
            <Rect x="51" y="45" width="6" height="6" rx="1" fill="#160A05" />
            <Circle cx="24" cy="26" r="8" fill="#4A1A0A" opacity={0.6} />
          </Layer>
        </Sway>
      )}

      {type === 'forest' && (
        <>
          {[0, 1].map((k) => (
            <Flicker key={k} duration={anim ? 3800 + k * 1400 : 0} min={0.12} delay={k * 1100}>
              <Layer>
                {[[20, 44], [44, 38], [66, 48], [88, 34], [34, 56], [58, 30]]
                  .filter((_, i) => i % 2 === k)
                  .map(([x, y], i) => (
                    <Circle key={i} cx={x} cy={y} r={1.1} fill={GLOW} opacity={0.8} />
                  ))}
              </Layer>
            </Flicker>
          ))}
        </>
      )}

      {type === 'cat' && (
        <>
          <Breathe duration={anim ? 5200 : 0}>
            <Layer>
              {/* curled sleeping cat */}
              <Ellipse cx="46" cy="94" rx="24" ry="14" fill="#1E0E06" />
              <Ellipse cx="46" cy="94" rx="24" ry="14" fill={A2} opacity={0.35} />
              {/* head resting on body */}
              <Circle cx="30" cy="88" r="9" fill="#241109" />
              {/* ears */}
              <Path d="M24 82 l -2 -6 l 6 3 Z" fill="#241109" />
              <Path d="M33 80 l 1 -6 l 4 5 Z" fill="#241109" />
              {/* closed eye */}
              <Path d="M27 89 q 3 2 6 0" stroke={GLOW} strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.8} />
            </Layer>
          </Breathe>
          <Sway duration={anim ? 6000 : 0} dx={0} dy={anim ? 1.5 : 0}>
            <Layer>
              {/* tail wrapped around, tip rising gently */}
              <Path d="M66 98 q 10 -2 8 -12 q -1 -6 -7 -6" stroke="#241109" strokeWidth={4.5} fill="none" strokeLinecap="round" />
            </Layer>
          </Sway>
        </>
      )}

      {type === 'birds' && (
        <>
          <Sway duration={anim ? 11000 : 0} dx={anim ? 9 : 0} dy={-2}>
            <Layer>
              <Path d="M30 34 q 4 -5 8 0 q 4 -5 8 0" stroke="#241109" strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </Layer>
          </Sway>
          <Sway duration={anim ? 14000 : 0} dx={anim ? -11 : 0} dy={3}>
            <Layer>
              <Path d="M62 22 q 3 -4 6 0 q 3 -4 6 0" stroke="#241109" strokeWidth={1.5} fill="none" strokeLinecap="round" />
              <Path d="M14 52 q 3 -4 6 0 q 3 -4 6 0" stroke="#241109" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.8} />
            </Layer>
          </Sway>
          {/* perched bird on the branch */}
          <View style={StyleSheet.absoluteFill}>
            <Layer>
              <Ellipse cx="30" cy="38" rx="4.5" ry="3.5" fill="#241109" />
              <Circle cx="34.5" cy="35.5" r="2.2" fill="#241109" />
              <Path d="M36.5 35.5 l 3 0.8 l -3 1 Z" fill={GLOW} opacity={0.9} />
            </Layer>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
});
