import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const MAX_TINT = 0.34; // strongest warm veil at full intensity

/**
 * A warm veil laid over the entire app, in the active comfort theme's tone.
 * Its opacity tracks the screen-warmth slider (ThemeContext.intensity) plus the
 * theme's baseline warmth boost, so both choosing a warmer theme and raising
 * warmth genuinely dim and warm every screen — the melatonin-friendly effect an
 * app can do in software. Never intercepts touches.
 */
export function WarmthOverlay() {
  const { intensity, theme } = useTheme();
  const opacity = Math.min(1, intensity + theme.boost) * MAX_TINT;
  return (
    <View
      pointerEvents="none"
      style={[styles.veil, { backgroundColor: theme.veil, opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFillObject,
  },
});
