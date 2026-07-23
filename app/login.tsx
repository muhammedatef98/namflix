import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Logo } from '@/components/Logo';
import { StarField } from '@/components/StarField';
import { NightPalette, FONT, WORDMARK } from '@/constants/theme';

type Step = 'email' | 'code';

// Supabase's email OTP length is configurable (6–10). Accept the whole range
// so the field never truncates a longer code than we expect.
const OTP_MIN_LENGTH = 6;
const OTP_MAX_LENGTH = 10;

export default function LoginScreen() {
  const { sendCode, verifyCode, signInGuest } = useAuth();
  const { t, isRTL } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [busy, setBusy] = useState(false);

  const requestCode = async () => {
    if (!email.trim()) return Alert.alert('—', t('emailMissing'));
    setBusy(true);
    try {
      await sendCode(email);
      setStep('code');
    } catch (e) {
      Alert.alert(t('loginFailed'), e instanceof Error ? e.message : '—');
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async () => {
    if (code.trim().length < OTP_MIN_LENGTH) return Alert.alert('—', t('codeMissing'));
    setBusy(true);
    try {
      await verifyCode(email, code);
      // On success the auth listener swaps in the session and routes home.
    } catch (e) {
      Alert.alert(t('loginFailed'), e instanceof Error ? e.message : '—');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await sendCode(email);
      Alert.alert('—', t('codeResent'));
    } catch (e) {
      Alert.alert(t('loginFailed'), e instanceof Error ? e.message : '—');
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={[NightPalette.deepEmber, NightPalette.voidBlack]} style={styles.fill}>
      <StarField />
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.brandRow, isRTL && styles.rowRTL]}>
              <Logo size={38} />
              <Text style={styles.brand}>Namflix</Text>
            </View>
            <Text style={styles.tagline}>{step === 'email' ? t('welcomeBack') : t('restStarts')}</Text>

            <View style={styles.formSpace} />

            {step === 'email' ? (
              <>
                <Text style={[styles.hint, isRTL && styles.textRTL]}>{t('authIntro')}</Text>
                <TextInput
                  style={[styles.input, isRTL && styles.textRTL]}
                  placeholder={t('emailField')}
                  placeholderTextColor={NightPalette.dimText}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={requestCode}
                  returnKeyType="send"
                />
                <Pressable style={styles.button} onPress={requestCode} disabled={busy}>
                  {busy ? (
                    <ActivityIndicator color={NightPalette.voidBlack} />
                  ) : (
                    <Text style={styles.buttonText}>{t('sendCode')}</Text>
                  )}
                </Pressable>

                <Pressable style={styles.guestBtn} onPress={signInGuest}>
                  <Text style={styles.guestText}>{t('guestEnter')}</Text>
                </Pressable>

                <Pressable style={styles.privacyBtn} onPress={() => router.push('/privacy')}>
                  <Text style={styles.privacyText}>{t('privacyLink')}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.hint, isRTL && styles.textRTL]}>
                  {t('codeSentTo')} {email.trim().toLowerCase()}
                </Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder={t('codeField')}
                  placeholderTextColor={NightPalette.dimText}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  maxLength={OTP_MAX_LENGTH}
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/[^0-9]/g, ''))}
                  onSubmitEditing={confirmCode}
                  returnKeyType="done"
                  autoFocus
                />
                <Pressable style={styles.button} onPress={confirmCode} disabled={busy}>
                  {busy ? (
                    <ActivityIndicator color={NightPalette.voidBlack} />
                  ) : (
                    <Text style={styles.buttonText}>{t('verifyCode')}</Text>
                  )}
                </Pressable>

                <View style={[styles.codeActions, isRTL && styles.rowRTL]}>
                  <Pressable onPress={resend} disabled={busy}>
                    <Text style={styles.link}>{t('resendCode')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setStep('email');
                      setCode('');
                    }}
                  >
                    <Text style={styles.link}>{t('changeEmail')}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  rowRTL: { flexDirection: 'row-reverse' },
  brand: {
    fontSize: 26,
    fontFamily: WORDMARK.bold,
    color: '#F2C9A6',
    // Nudge the wordmark down so its optical centre lines up with the logo,
    // whose visual mass sits a touch below the SVG's geometric centre.
    lineHeight: 36,
    includeFontPadding: false,
    transform: [{ translateY: 2 }],
  },
  tagline: { marginTop: 8, fontSize: 14, lineHeight: 22, color: NightPalette.dimText, textAlign: 'center' },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  formSpace: { height: 32 },
  hint: { color: NightPalette.dimText, fontSize: 13, lineHeight: 20, marginBottom: 14, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(140,42,18,0.3)',
    backgroundColor: 'rgba(36,17,9,0.6)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
    color: NightPalette.textPrimary,
    fontSize: 15,
  },
  codeInput: { textAlign: 'center', fontSize: 22, letterSpacing: 5, fontFamily: FONT.bold },
  button: {
    backgroundColor: NightPalette.amber,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: NightPalette.voidBlack, fontFamily: FONT.bold, fontSize: 15, lineHeight: 22 },
  guestBtn: { paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  guestText: { color: NightPalette.textPrimary, fontSize: 15, lineHeight: 22 },
  privacyBtn: { paddingVertical: 6, alignItems: 'center' },
  privacyText: { color: NightPalette.dimText, fontSize: 12, lineHeight: 18, textDecorationLine: 'underline' },
  codeActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  link: { color: NightPalette.amber, fontSize: 13, lineHeight: 20 },
});
