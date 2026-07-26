import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import { DullCard } from '@/components/DullCard';
import { DULL_ACTIVITIES } from '@/lib/dullContent';
import { useRecordTool } from '@/hooks/useRecordTool';

const MIND = DULL_ACTIVITIES.filter((a) => a.category === 'mind');
const BODY = DULL_ACTIVITIES.filter((a) => a.category === 'body');

export default function BoringScreen() {
  useRecordTool('boring');
  const { t, isRTL } = useLocale();

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('boringTitle')}</Text>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('boringSub')}</Text>

          <Text style={[styles.section, isRTL && styles.textRTL]}>{t('secMind')}</Text>
          {MIND.map((item) => (
            <DullCard key={item.id} item={item} />
          ))}

          <Text style={[styles.section, isRTL && styles.textRTL]}>{t('secBody')}</Text>
          {BODY.map((item) => (
            <DullCard key={item.id} item={item} />
          ))}

          <View style={styles.footer}>
            <Text style={[styles.footerText, isRTL && styles.textRTL]}>{t('boringDisclaimer')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 40 },
  back: { paddingVertical: 8, alignSelf: 'flex-start' },
  backRTL: { alignSelf: 'flex-end' },
  backText: { color: NightPalette.textPrimary, fontSize: 16 },
  title: {
    fontSize: 28,
    fontFamily: FONT.light,

    color: NightPalette.textPrimary,
    marginTop: 12,
  },
  sub: { fontSize: 13, color: NightPalette.dimText, lineHeight: 20, marginTop: 8, marginBottom: 12 },
  section: {
    marginTop: 24,
    marginBottom: 14,
    fontSize: 12,

    color: NightPalette.warmRed,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(140,42,18,0.2)',
  },
  footerText: { fontSize: 11, color: NightPalette.dimText, lineHeight: 17, fontStyle: 'italic' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
