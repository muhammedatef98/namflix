import { useEffect, useState } from 'react';
import { Text, View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import type { Localized } from '@/lib/i18n';
import { privacyOptionsRequired, showPrivacyOptions } from '@/lib/ads/sdk';

// The full policy, shown in the user's app language. Content mirrors the
// hosted page (functions/v1/privacy) that App Store Connect links to.
const UPDATED: Localized = { en: 'Last updated: 9 October 2026', ar: 'آخر تحديث: ٩ أكتوبر ٢٠٢٦' };
const INTRO: Localized = {
  en: 'Namflix is a sleep-support app. We collect as little as possible.',
  ar: 'نامفلكس تطبيق للمساعدة على النوم، ونجمع أقلّ قدر ممكن من البيانات.',
};

const SECTIONS: { title: Localized; body: Localized }[] = [
  {
    title: { en: 'What we collect', ar: 'ما الذي نجمعه؟' },
    body: {
      en: 'Your email address — only if you sign in — used solely to send your one-time login code and identify your account. Guest mode requires no account at all. Preferences (theme, language, favourite sounds, subscription state) are stored locally on your device.',
      ar: 'بريدك الإلكتروني — فقط إذا سجّلت الدخول — ويُستخدم حصرًا لإرسال رمز الدخول ولتعريف حسابك. وضع الضيف لا يحتاج حسابًا إطلاقًا. أما التفضيلات (السِمة، اللغة، الأصوات المفضّلة، حالة الاشتراك) فتُحفظ محليًّا على جهازك.',
    },
  },
  {
    title: { en: 'What we do NOT collect', ar: 'ما الذي لا نجمعه' },
    body: {
      en: 'No analytics trackers, no precise location, no contacts, no health data, and no selling of data to third parties — ever. Premium members see no ads at all, and no ad requests are made for them.',
      ar: 'لا أدوات تحليل أو تتبّع، ولا موقع دقيق، ولا جهات اتصال، ولا بيانات صحية، ولا بيع للبيانات لأطراف ثالثة — أبدًا. ولا يرى مشتركو بريميوم أي إعلانات، ولا تُطلب لهم إعلانات أصلًا.',
    },
  },
  {
    title: { en: 'Ads in the free version', ar: 'الإعلانات في النسخة المجانية' },
    body: {
      en: 'The free version can show ads from Google AdMob — for example when you choose to watch a short ad to unlock a sound or method for 24 hours. To serve and measure ads, Google may process your device’s advertising identifier (on iOS only if you allow tracking), IP address and approximate location, device information and ad interactions. Where the law requires it (e.g. EEA/UK) we ask for your consent first; if you decline consent or tracking you still get non-personalised ads, and the app works the same. Google’s policy: policies.google.com/technologies/partner-sites',
      ar: 'قد تعرض النسخة المجانية إعلانات من Google AdMob — مثلًا عندما تختار مشاهدة إعلان قصير لفتح صوت أو أسلوب لمدة ٢٤ ساعة. ولعرض الإعلانات وقياسها قد تعالج Google المعرّف الإعلاني لجهازك (على iOS فقط إن سمحتَ بالتتبّع)، وعنوان IP والموقع التقريبي، ومعلومات الجهاز، وتفاعلك مع الإعلانات. وحيث يشترط القانون ذلك (كالاتحاد الأوروبي والمملكة المتحدة) نطلب موافقتك أولًا؛ وإن رفضتَ الموافقة أو التتبّع تصلك إعلانات غير مخصّصة ويعمل التطبيق كما هو. سياسة Google: policies.google.com/technologies/partner-sites',
    },
  },
  {
    title: { en: 'Where data lives', ar: 'أين تُحفظ البيانات؟' },
    body: {
      en: 'Account data is stored with our backend provider, Supabase (EU region, London). Sounds are streamed from the same infrastructure.',
      ar: 'بيانات الحساب محفوظة لدى مزوّد الخدمة Supabase (منطقة الاتحاد الأوروبي — لندن)، وتُبثّ الأصوات من البنية نفسها.',
    },
  },
  {
    title: { en: 'Deleting your account', ar: 'حذف حسابك' },
    body: {
      en: 'You can delete your account and its data at any time from inside the app (Home → Delete account). Deletion is immediate and permanent.',
      ar: 'يمكنك حذف حسابك وبياناته في أي وقت من داخل التطبيق (الرئيسية ← حذف الحساب). الحذف فوري ونهائي.',
    },
  },
  {
    title: { en: 'Not medical advice', ar: 'ليس نصيحة طبية' },
    body: {
      en: 'Namflix offers educational, evidence-informed content and is not a medical device or medical advice. Persistent insomnia warrants clinician-guided care.',
      ar: 'يقدّم نامفلكس محتوى تعليميًّا قائمًا على الأدلة، وليس جهازًا طبيًّا أو نصيحة طبية. الأرق المستمر يستدعي رعاية مختصّة.',
    },
  },
  {
    title: { en: 'Contact & support', ar: 'التواصل والدعم' },
    body: {
      en: 'Questions or help: muhammedatef98@gmail.com',
      ar: 'للأسئلة أو المساعدة: muhammedatef98@gmail.com',
    },
  },
];

export default function PrivacyScreen() {
  const { t, tc, isRTL } = useLocale();
  // Google UMP requires a way to revisit ad consent where it applies (EEA/UK).
  const [showAdChoices, setShowAdChoices] = useState(false);
  useEffect(() => {
    privacyOptionsRequired().then(setShowAdChoices).catch(() => undefined);
  }, []);

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <BackButton />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{t('privacyLink')}</Text>
          <Text style={[styles.updated, isRTL && styles.textRTL]}>{tc(UPDATED)}</Text>
          <Text style={[styles.body, isRTL && styles.textRTL]}>{tc(INTRO)}</Text>

          {SECTIONS.map((s, i) => (
            <View key={i}>
              <Text style={[styles.heading, isRTL && styles.textRTL]}>{tc(s.title)}</Text>
              <Text style={[styles.body, isRTL && styles.textRTL]}>{tc(s.body)}</Text>
            </View>
          ))}

          {showAdChoices && (
            <Pressable onPress={() => void showPrivacyOptions()} hitSlop={8} style={styles.adChoices}>
              <Text style={[styles.adChoicesText, isRTL && styles.textRTL]}>{t('adPrivacyChoices')}</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 14, paddingBottom: 40 },
  title: { fontSize: 26, fontFamily: FONT.bold, lineHeight: 38, color: NightPalette.textPrimary },
  updated: { fontSize: 12, color: NightPalette.dimText, marginTop: 4, marginBottom: 14, lineHeight: 18 },
  heading: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: NightPalette.amber,
    marginTop: 22,
    marginBottom: 6,
    lineHeight: 24,
  },
  body: { fontSize: 14, lineHeight: 24, color: '#E0B896' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  adChoices: { marginTop: 26, paddingVertical: 6 },
  adChoicesText: { fontSize: 14, color: NightPalette.amber, textDecorationLine: 'underline', lineHeight: 22 },
});
