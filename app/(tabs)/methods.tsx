import { useState } from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import {
  CATEGORY_META,
  METHOD_ORDER,
  methodsByCategory,
  routeForMethod,
  type SleepMethod,
} from '@/lib/sleepMethods';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function MethodCard({ method }: { method: SleepMethod }) {
  const router = useRouter();
  const { t, tc, isRTL, lang } = useLocale();
  const [open, setOpen] = useState(false);
  const route = routeForMethod(method);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={styles.cardHead}>
        <View style={styles.cardHeadText}>
          <Text style={[styles.methodName, isRTL && styles.textRTL]}>{tc(method.name)}</Text>
          <Text style={[styles.methodSummary, isRTL && styles.textRTL]}>{tc(method.summary)}</Text>
        </View>
        <Text style={styles.chevron}>{open ? '−' : '+'}</Text>
      </Pressable>

      {open && (
        <View style={styles.body}>
          <Text style={[styles.blockLabel, isRTL && styles.textRTL]}>{t('methodHow')}</Text>
          <Text style={[styles.blockText, isRTL && styles.textRTL]}>{tc(method.how)}</Text>

          <Text style={[styles.blockLabel, styles.blockLabelSpaced, isRTL && styles.textRTL]}>
            {t('methodEvidence')}
          </Text>
          <Text style={[styles.evidenceText, isRTL && styles.textRTL]}>{tc(method.evidence)}</Text>

          {route && (
            <Pressable
              style={[styles.openBtn, isRTL && styles.alignSelfEnd]}
              onPress={() => router.push(route as never)}
            >
              <Text style={styles.openBtnText}>{t('methodOpen')} {isRTL ? '←' : '→'}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export default function MethodsScreen() {
  const { t, tc, isRTL, lang } = useLocale();

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={[styles.topBar, isRTL && styles.rowRTL]}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('methodsTitle')}</Text>
            <LanguageToggle />
          </View>
          <Text style={[styles.sub, isRTL && styles.textRTL]}>{t('methodsSub')}</Text>

          {METHOD_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            const methods = methodsByCategory(cat, lang);
            return (
              <View key={cat} style={styles.group}>
                <Text style={[styles.catLabel, isRTL && styles.textRTL]}>{tc(meta.label)}</Text>
                <Text style={[styles.catBlurb, isRTL && styles.textRTL]}>{tc(meta.blurb)}</Text>
                {methods.map((m) => (
                  <MethodCard key={m.id} method={m} />
                ))}
              </View>
            );
          })}

          <View style={styles.footer}>
            <Text style={[styles.footerText, isRTL && styles.textRTL]}>{t('methodsDisclaimer')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  rowRTL: { flexDirection: 'row-reverse' },
  title: { fontSize: 24, fontFamily: FONT.bold, color: NightPalette.textPrimary, flex: 1 },
  sub: { fontSize: 13, lineHeight: 20, color: NightPalette.dimText, marginTop: 10, marginBottom: 8 },

  group: { marginTop: 26 },
  catLabel: { fontSize: 15, fontFamily: FONT.bold, color: NightPalette.amber,},
  catBlurb: { fontSize: 12, lineHeight: 18, color: NightPalette.dimText, marginTop: 4, marginBottom: 14 },

  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(36,17,9,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.28)',
    overflow: 'hidden',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  cardHeadText: { flex: 1 },
  methodName: { fontSize: 16, fontFamily: FONT.bold, color: NightPalette.textPrimary },
  methodSummary: { fontSize: 12.5, lineHeight: 18, color: NightPalette.dimText, marginTop: 3 },
  chevron: { color: NightPalette.amber, fontSize: 20, width: 18, textAlign: 'center' },

  body: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 2 },
  blockLabel: { fontSize: 11, color: NightPalette.amber, textTransform: 'uppercase' },
  blockLabelSpaced: { marginTop: 16 },
  blockText: { fontSize: 13.5, lineHeight: 21, color: NightPalette.textPrimary, marginTop: 8 },
  evidenceText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: NightPalette.dimText,
    marginTop: 8,
    fontStyle: 'italic',
  },
  openBtn: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: NightPalette.amber,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  alignSelfEnd: { alignSelf: 'flex-end' },
  openBtnText: { color: NightPalette.voidBlack, fontFamily: FONT.bold, fontSize: 13 },

  footer: { marginTop: 28, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(140,42,18,0.2)' },
  footerText: { fontSize: 11, lineHeight: 17, color: NightPalette.dimText, fontStyle: 'italic' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
});
