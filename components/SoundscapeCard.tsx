import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useLocale } from '@/contexts/LocaleContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NightPalette } from '@/constants/theme';

type Props = {
  title: string;
  subtitle: string;
  onPress?: () => void;
  accent?: boolean;
  locked?: boolean;
};

/** A soft circular chevron that points the way in, in the app's warm accent. */
function EnterGlyph({ color, isRTL }: { color: string; isRTL: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path
        d={isRTL ? 'M15 5 L8 12 L15 19' : 'M9 5 L16 12 L9 19'}
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** A small padlock shown on features that are locked behind a subscription. */
function LockGlyph({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Path
        d="M7 10 V7 a5 5 0 0 1 10 0 V10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Rect x="5" y="10" width="14" height="10" rx="2.5" fill={color} />
    </Svg>
  );
}

export function SoundscapeCard({ title, subtitle, onPress, accent = false, locked = false }: Props) {
  const { isRTL } = useLocale();
  const { accent: accentColor } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        accent && styles.accentCard,
        accent && { borderColor: accentColor },
        isRTL && styles.cardRTL,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{subtitle}</Text>
      </View>
      <View
        style={[
          styles.glyph,
          locked
            ? { borderColor: 'rgba(140,42,18,0.5)', borderWidth: 1 }
            : accent
              ? { backgroundColor: accentColor }
              : { borderColor: accentColor, borderWidth: 1 },
        ]}
      >
        {locked ? (
          <LockGlyph color={NightPalette.dimText} />
        ) : (
          <EnterGlyph color={accent ? NightPalette.voidBlack : accentColor} isRTL={isRTL} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(36,17,9,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
  },
  accentCard: {
    backgroundColor: 'rgba(74,26,10,0.55)',
  },
  cardRTL: { flexDirection: 'row-reverse' },
  pressed: { opacity: 0.7 },
  glyph: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 14,
    backgroundColor: 'rgba(140,42,18,0.12)',
  },
  text: { flex: 1 },
  title: { fontSize: 16, color: NightPalette.textPrimary, lineHeight: 24 },
  subtitle: { fontSize: 12, color: NightPalette.dimText, marginTop: 2, lineHeight: 18 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
