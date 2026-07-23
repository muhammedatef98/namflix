import Svg, { Defs, LinearGradient, Stop, Mask, Rect, Circle } from 'react-native-svg';

/**
 * Namflix mark — an amber crescent cradling a star (reads like a soft "ن").
 * The crescent is a disc with an offset disc masked out, so it renders reliably
 * at any size instead of relying on a hand-tuned arc path.
 */
export function Logo({ size = 40, color }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="moon" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor={color ?? '#C24E1A'} />
          <Stop offset="1" stopColor="#E9A567" />
        </LinearGradient>
        <Mask id="crescent">
          <Rect x="0" y="0" width="48" height="48" fill="#fff" />
          <Circle cx="30" cy="18" r="16" fill="#000" />
        </Mask>
      </Defs>
      <Circle cx="22" cy="25" r="18" fill="url(#moon)" mask="url(#crescent)" />
      <Circle cx="31" cy="14" r="3" fill="#F2C9A6" />
    </Svg>
  );
}
