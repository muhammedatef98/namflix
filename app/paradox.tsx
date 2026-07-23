import { useEffect, useCallback } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { NightPalette, FONT } from '@/constants/theme';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { useRecordTool } from '@/hooks/useRecordTool';

const KEEP_AWAKE_TAG = 'namflix-paradox';

export default function ParadoxScreen() {
  useRecordTool('paradox');
  const router = useRouter();
  const { t, isRTL } = useLocale();
  const cues = [t('paradoxCue1'), t('paradoxCue2'), t('paradoxCue3'), t('paradoxCue4')];
  const glow = useSharedValue(0.3);

  const start = useCallback(() => {
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    glow.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [glow]);

  useEffect(() => {
    start();
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [start]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <LinearGradient colors={[NightPalette.deepEmber, '#0A0000']} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <BackButton />

        <View style={styles.body}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('paradoxTitle')}</Text>

          <View style={styles.cues}>
            {cues.map((cue) => (
              <Text key={cue} style={[styles.cue, isRTL && styles.textRTL]}>
                {cue}
              </Text>
            ))}
          </View>

          <Animated.View style={[styles.anchor, glowStyle]} />

          <View style={styles.science}>
            <Text style={[styles.scienceLabel, isRTL && styles.textRTL]}>{t('whyThisWorks')}</Text>
            <Text style={[styles.scienceBody, isRTL && styles.textRTL]}>{t('paradoxScience')}</Text>
            <Text style={[styles.scienceBasis, isRTL && styles.textRTL]}>{t('paradoxBasis')}</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const RED = '#FF3300';

const styles = StyleSheet.create({
  fill: { flex: 1 },
  back: { paddingHorizontal: 24, paddingTop: 8, alignSelf: 'flex-start' },
  backRTL: { alignSelf: 'flex-end' },
  backText: { color: NightPalette.textPrimary, fontSize: 16 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },

  body: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
  title: { fontSize: 26, fontFamily: FONT.light, color: NightPalette.textPrimary },
  cues: { marginTop: 28, gap: 18 },
  cue: { fontSize: 16, lineHeight: 25, color: NightPalette.dimText },
  anchor: {
    alignSelf: 'center',
    marginTop: 40,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RED,
  },
  science: {
    marginTop: 'auto',
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(140,42,18,0.2)',
    paddingTop: 16,
  },
  scienceLabel: { color: NightPalette.amber, fontSize: 11,},
  scienceBody: { color: NightPalette.textPrimary, fontSize: 13, lineHeight: 20, marginTop: 10 },
  scienceBasis: {
    color: NightPalette.dimText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
