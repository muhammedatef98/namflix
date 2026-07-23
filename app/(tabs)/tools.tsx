import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { useFeatureGate } from '@/contexts/PremiumContext';
import { SoundscapeCard } from '@/components/SoundscapeCard';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';

type ToolEntry = { titleKey: string; subKey: string; route: string; accent?: boolean };

const GROUPS: { headingKey: string; tools: ToolEntry[] }[] = [
  {
    headingKey: 'toolsGroupJourneys',
    tools: [
      { titleKey: 'toolDescentTitle', subKey: 'toolDescentSub', route: '/descent', accent: true },
      { titleKey: 'toolRescueTitle', subKey: 'toolRescueSub', route: '/rescue', accent: true },
      { titleKey: 'toolProgramTitle', subKey: 'toolProgramSub', route: '/program', accent: true },
      { titleKey: 'toolBoringTitle', subKey: 'toolBoringSub', route: '/boring', accent: true },
      { titleKey: 'toolWindowTitle', subKey: 'toolWindowSub', route: '/window' },
      { titleKey: 'toolInsightsTitle', subKey: 'toolInsightsSub', route: '/insights' },
      { titleKey: 'toolMixerTitle', subKey: 'toolMixerNewSub', route: '/mixer' },
    ],
  },
  {
    headingKey: 'toolsGroupMind',
    tools: [
      { titleKey: 'toolShuffleTitle', subKey: 'toolShuffleSub', route: '/shuffle' },
      { titleKey: 'toolImageryTitle', subKey: 'toolImagerySub', route: '/imagery' },
      { titleKey: 'toolParadoxTitle', subKey: 'toolParadoxSub', route: '/paradox' },
      { titleKey: 'toolCountTitle', subKey: 'toolCountSub', route: '/count' },
      { titleKey: 'toolWorryTitle', subKey: 'toolWorrySub', route: '/worry' },
    ],
  },
  {
    headingKey: 'toolsGroupBody',
    tools: [
      { titleKey: 'toolBreatheTitle', subKey: 'toolBreatheSub', route: '/breathe' },
      { titleKey: 'toolPmrTitle', subKey: 'toolPmrSub', route: '/pmr' },
      { titleKey: 'toolBodyscanTitle', subKey: 'toolBodyscanSub', route: '/bodyscan' },
      { titleKey: 'toolAutogenicTitle', subKey: 'toolAutogenicSub', route: '/autogenic' },
      { titleKey: 'toolGroundTitle', subKey: 'toolGroundSub', route: '/grounding' },
    ],
  },
];

export default function ToolsScreen() {
  const { open, isPremium } = useFeatureGate();
  const { t, isRTL } = useLocale();
  const locked = !isPremium;

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('toolsTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('toolsSub')}</Text>

          {GROUPS.map((group) => (
            <View key={group.headingKey}>
              <Text style={[styles.groupHeading, isRTL && styles.textRTL]}>
                {t(group.headingKey as never)}
              </Text>
              {group.tools.map((tool) => (
                <SoundscapeCard
                  key={tool.route}
                  accent={tool.accent}
                  title={t(tool.titleKey as never)}
                  subtitle={t(tool.subKey as never)}
                  locked={locked}
                  onPress={() => open(tool.route)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  title: { fontSize: 26, fontFamily: FONT.light, color: NightPalette.textPrimary },
  sub: { fontSize: 13, color: NightPalette.dimText, marginTop: 6, marginBottom: 10 },
  groupHeading: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: NightPalette.amber,
    marginTop: 14,
    marginBottom: 12,
    lineHeight: 20,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
