import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { releaseWorry } from '@/lib/worry';
import { useLocale } from '@/contexts/LocaleContext';
import { NightPalette, FONT } from '@/constants/theme';
import { useRecordTool } from '@/hooks/useRecordTool';

export default function WorryScreen() {
  useRecordTool('worry');
  const { t, isRTL } = useLocale();
  const [text, setText] = useState('');
  const [releasing, setReleasing] = useState(false);
  const p = useSharedValue(0); // 0 = at rest, 1 = burned up

  const reset = () => {
    setText('');
    setReleasing(false);
    p.value = 0;
  };

  const release = () => {
    if (!text.trim()) return;
    Keyboard.dismiss();
    setReleasing(true);
    releaseWorry(text).catch(() => undefined); // persist, but never block the ritual
    p.value = withTiming(1, { duration: 1600, easing: Easing.in(Easing.quad) }, (done) => {
      if (done) runOnJS(reset)();
    });
  };

  // Shoot up and to the right, shrinking and fading — a burning shooting star.
  const starStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.7, 1], [1, 1, 0]),
    transform: [
      { translateX: interpolate(p.value, [0, 1], [0, 180]) },
      { translateY: interpolate(p.value, [0, 1], [0, -220]) },
      { scale: interpolate(p.value, [0, 1], [1, 0.25]) },
      { rotate: `${interpolate(p.value, [0, 1], [0, 12])}deg` },
    ],
  }));

  // A faint trail that stretches as the thought leaves.
  const trailStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.2, 0.9, 1], [0, 0.5, 0.3, 0]),
    transform: [{ scaleX: interpolate(p.value, [0, 1], [0.2, 1.4]) }],
  }));

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <BackButton />
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('worryTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('worrySub')}</Text>

          <View style={styles.stage}>
            <Animated.View style={[styles.trail, trailStyle]} />
            <Animated.View style={[styles.thought, starStyle]}>
              <Text style={styles.thoughtText} numberOfLines={4}>
                {text || ' '}
              </Text>
            </Animated.View>
          </View>

          {!releasing && (
            <TextInput
              style={[styles.input, isRTL && styles.textRTL]}
              placeholder={t('worryPlaceholder')}
              placeholderTextColor={NightPalette.dimText}
              multiline
              value={text}
              onChangeText={setText}
            />
          )}

          <Pressable
            style={[styles.button, (!text.trim() || releasing) && styles.buttonOff]}
            onPress={release}
            disabled={!text.trim() || releasing}
          >
            <Text style={styles.buttonText}>{t('worryRelease')}</Text>
          </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, padding: 24 },
  title: {
    marginTop: 40,
    fontSize: 28,
    lineHeight: 42,
    fontFamily: FONT.light,

    color: NightPalette.textPrimary,
  },
  sub: { marginTop: 4, fontSize: 13, lineHeight: 20, color: NightPalette.dimText },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  stage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  trail: {
    position: 'absolute',
    width: 160,
    height: 2,
    backgroundColor: NightPalette.amber,
    borderRadius: 2,
  },
  thought: {
    maxWidth: 260,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(36,17,9,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.4)',
  },
  thoughtText: { color: NightPalette.textPrimary, fontSize: 15, textAlign: 'center' },
  input: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.6)',
    borderRadius: 14,
    padding: 16,
    color: NightPalette.textPrimary,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: NightPalette.amber,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonOff: { opacity: 0.4 },
  buttonText: { color: NightPalette.voidBlack, fontFamily: FONT.bold, fontSize: 15 },
});
