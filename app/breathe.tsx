import { useEffect, useRef, useState } from 'react';
import { FONT } from '@/constants/theme';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ORION } from '@/constants/constellations';
import { useLocale } from '@/contexts/LocaleContext';
import { useRecordTool } from '@/hooks/useRecordTool';

// Melatonin-friendly palette — no blue channel content.
const RED = '#FF3300';
const DEEP = '#CC2200';
const SKY = '#1A0000';

// 4-7-8 technique, in ms.
const INHALE = 4000;
const HOLD = 7000;
const EXHALE = 8000;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

type Phase = 'inhale' | 'hold' | 'exhale';

export default function BreatheScreen() {
  useRecordTool('breathe');
  const { t } = useLocale();
  const LABEL: Record<Phase, string> = {
    inhale: t('breatheIn'),
    hold: t('breatheHold'),
    exhale: t('breatheOut'),
  };
  const [phase, setPhase] = useState<Phase>('inhale');

  // offset LEN→0 draws the constellation; glow adds a halo; opacity fades it.
  const offset = useSharedValue(ORION.length);
  const glow = useSharedValue(0);
  const opacity = useSharedValue(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const ease = Easing.inOut(Easing.ease);

    const runInhale = () => {
      setPhase('inhale');
      opacity.value = 1;
      offset.value = ORION.length; // reset (instant) before drawing
      offset.value = withTiming(0, { duration: INHALE, easing: ease });
      glow.value = withTiming(0, { duration: INHALE / 2 });
      timers.current.push(setTimeout(runHold, INHALE));
    };
    const runHold = () => {
      setPhase('hold');
      glow.value = withTiming(1, { duration: 900, easing: ease });
      timers.current.push(setTimeout(runExhale, HOLD));
    };
    const runExhale = () => {
      setPhase('exhale');
      glow.value = withTiming(0, { duration: EXHALE });
      opacity.value = withTiming(0.15, { duration: EXHALE, easing: ease });
      timers.current.push(setTimeout(runInhale, EXHALE));
    };

    runInhale();
    return () => timers.current.forEach(clearTimeout);
  }, [glow, offset, opacity]);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));
  const glowProps = useAnimatedProps(() => ({ strokeOpacity: glow.value }));
  const groupProps = useAnimatedProps(() => ({ opacity: opacity.value }));

  return (
    <LinearGradient colors={[SKY, '#0A0000']} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <Text style={styles.phase}>{LABEL[phase]}</Text>

        <Svg viewBox="0 0 300 420" style={styles.svg}>
          <AnimatedG animatedProps={groupProps}>
            {/* halo layer — thick, low opacity, rises during hold */}
            <AnimatedPath
              d={ORION.path}
              stroke={DEEP}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={ORION.length}
              animatedProps={glowProps}
            />
            {/* crisp constellation line — draws during inhale */}
            <AnimatedPath
              d={ORION.path}
              stroke={RED}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={ORION.length}
              animatedProps={lineProps}
            />
            {ORION.stars.map(([cx, cy], i) => (
              <Circle key={i} cx={cx} cy={cy} r={3} fill={RED} />
            ))}
          </AnimatedG>
        </Svg>

        <Text style={styles.hint}>{t('breatheHint')}</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  svg: { flex: 1, alignSelf: 'stretch' },
  phase: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 22,
    lineHeight: 34,

    fontFamily: FONT.light,
    color: RED,
  },
  hint: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 12,
    lineHeight: 20,

    color: DEEP,
  },
});