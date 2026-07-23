import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useLocale } from '@/contexts/LocaleContext';
import { NightPalette } from '@/constants/theme';

/**
 * Soft, rounded back control. Chevron points the correct way per language and
 * sits in a faint pill — gentler than a bare "‹ back". Aligns to the leading
 * edge (right in Arabic).
 */
export function BackButton({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  const { isRTL } = useLocale();
  const go = onPress ?? (() => router.back());

  return (
    <Pressable
      onPress={go}
      hitSlop={14}
      style={({ pressed }) => [styles.btn, isRTL && styles.btnRTL, pressed && styles.pressed]}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
          d={isRTL ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'}
          stroke={NightPalette.textPrimary}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(36,17,9,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    marginHorizontal: 20,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  btnRTL: { alignSelf: 'flex-end' },
  pressed: { opacity: 0.6 },
});
