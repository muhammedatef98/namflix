import { Text, View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useLocale } from '@/contexts/LocaleContext';
import { usePlayback } from '@/contexts/PlaybackContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SoundArt } from '@/components/SoundArt';
import { NightPalette, FONT } from '@/constants/theme';

/**
 * Persistent now-playing bar shown above the tab bar while a sound is loaded.
 * Tap → full player; controls: play/pause and a hard stop (the only ways a
 * sound ever ends besides the sleep timer).
 */
export function MiniPlayer({ bottom }: { bottom: number }) {
  const { track, playing, toggle, stop } = usePlayback();
  const { tc, isRTL } = useLocale();
  const { accent } = useTheme();
  const router = useRouter();

  if (!track) return null;

  return (
    <Pressable
      onPress={() => router.push(`/player/${track.id}`)}
      style={({ pressed }) => [styles.bar, { bottom }, pressed && styles.pressed]}
    >
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={styles.thumb}>
          <SoundArt type={track.art} animated={false} />
        </View>
        <Text style={[styles.title, isRTL && styles.textRTL]} numberOfLines={1}>
          {tc(track.title)}
        </Text>

        <Pressable onPress={toggle} hitSlop={10} style={[styles.ctl, { backgroundColor: accent }]}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            {playing ? (
              <>
                <Rect x="6" y="5" width="4" height="14" rx="1.5" fill={NightPalette.voidBlack} />
                <Rect x="14" y="5" width="4" height="14" rx="1.5" fill={NightPalette.voidBlack} />
              </>
            ) : (
              <Path d="M8 5.5 L18 12 L8 18.5 Z" fill={NightPalette.voidBlack} />
            )}
          </Svg>
        </Pressable>

        <Pressable onPress={stop} hitSlop={10} style={styles.stopBtn}>
          <Svg width={13} height={13} viewBox="0 0 24 24">
            <Path
              d="M6 6 L18 18 M18 6 L6 18"
              stroke={NightPalette.dimText}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 16,
    backgroundColor: '#1E0E06',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.45)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  pressed: { opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowRTL: { flexDirection: 'row-reverse' },
  thumb: { width: 36, height: 36, borderRadius: 10, overflow: 'hidden' },
  title: { flex: 1, color: '#F2C9A6', fontSize: 13, fontFamily: FONT.medium, lineHeight: 20 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  ctl: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  stopBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
  },
});
