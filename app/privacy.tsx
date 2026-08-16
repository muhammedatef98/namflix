import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '@/contexts/LocaleContext';
import { BackButton } from '@/components/BackButton';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT } from '@/constants/theme';
import type { Localized } from '@/lib/i18n';

// The full policy, shown in the user's app language. Content mirrors the
// hosted page (functions/v1/privacy) that App Store Connect links to.
const UPDATED: Localized = { en: 'Last updated: 9 August 2026', ar: 'آخر تحديث: ٩ أغسطس ٢٠٢٦' };
const INTRO: Localized = {
  en: 'Namflix is a sleep-support app. We collect as little as possible.',
  ar: 'نامفلكس تطبيق للمساعدة على النوم، ونجمع أقلّ قدر ممكن من البيانات.',
};

const SECTIONS: { title: Localized; body: Localized }[] = [
  {
    title: { en: 'What we collect', ar: 'ما الذي نجمعه؟' },
    body: {
      en: 'Nothing that identifies you. Namflix has no accounts, no sign-in and no email address to give us. Everything you do here — preferences, favourite sounds, your nightly check-ins and their history — is stored only on your device.',
      ar: 'لا شيء يعرّف بك. نامفلكس بلا حسابات ولا تسجيل دخول ولا بريد إلكتروني تعطينا إياه. كل ما تفعله هنا — التفضيلات، والأصوات المفضّلة، وتسجيلاتك الصباحية وسجلّها — محفوظ على جهازك وحده.',
    },
  },
  {
    title: { en: 'What we do NOT collect', ar: 'ما الذي لا نجمعه' },
    body: {
      en: 'No ads, no ad identifiers, no analytics trackers, no location, no contacts, no health data, and no selling of data to third parties — ever.',
      ar: 'لا إعلانات، ولا معرّفات إعلانية، ولا أدوات تتبّع، ولا موقع، ولا جهات اتصال، ولا بيانات صحية، ولا بيع للبيانات لأطراف ثالثة — أبدًا.',
    },
  },
  {
    title: { en: 'Where data lives', ar: 'أين تُحفظ البيانات؟' },
    body: {
      en: 'On your phone. We hold no account and no personal data on any server. The sound library is streamed from our provider Supabase (EU region, London), which serves audio files — it receives no personal data from you. The one exception is the purchase record described below.',
      ar: 'على هاتفك. لا نحتفظ بحساب لك ولا ببيانات شخصية على أي خادم. مكتبة الأصوات تُبثّ من مزوّدنا Supabase (منطقة الاتحاد الأوروبي — لندن)، وهو يقدّم ملفات صوتية فقط ولا يستقبل منك أي بيانات شخصية. والاستثناء الوحيد هو سجلّ الشراء الموضّح أدناه.',
    },
  },
  {
    title: { en: 'Deleting your data', ar: 'حذف بياناتك' },
    body: {
      en: 'Because everything lives on your device, deleting the app deletes all of it. There is no account of yours for us to hold, and nothing for you to request back.',
      ar: 'بما أنّ كل شيء على جهازك، فحذف التطبيق يحذفه بالكامل. لا يوجد حساب لك لدينا، ولا شيء تحتاج لطلب استرجاعه.',
    },
  },
  {
    title: { en: 'Purchases', ar: 'المشتريات' },
    body: {
      en: 'Subscriptions are processed by Apple or Google, never by us, and we never see your payment details. To unlock premium we use RevenueCat, which keeps a record of the purchase itself — which plan, and whether it is still active — against a random identifier created on your device. It never receives your name, your email or any way to contact you, because we never ask you for those. This purchase record is the only data of yours that exists off your device, and it is what makes "Restore purchases" work.',
      ar: 'الاشتراكات تعالجها Apple أو Google لا نحن، ولا نرى بيانات الدفع إطلاقًا. ولفتح المزايا المدفوعة نستخدم RevenueCat، وهو يحتفظ بسجلّ عملية الشراء نفسها — أي باقة، وهل ما زالت فعّالة — مرتبطًا بمعرّف عشوائي يُنشأ على جهازك. ولا يصله اسمك ولا بريدك الإلكتروني ولا أي وسيلة للتواصل معك، لأننا لا نطلب منك شيئًا من ذلك أصلًا. وسجلّ الشراء هذا هو البيانات الوحيدة الخاصة بك خارج جهازك، وهو ما يجعل زرّ «استرجاع المشتريات» يعمل.',
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
      en: 'Questions or help: Namflix.sleep@gmail.com',
      ar: 'للأسئلة أو المساعدة: Namflix.sleep@gmail.com',
    },
  },
];

export default function PrivacyScreen() {
  const { t, tc, isRTL } = useLocale();

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
});
