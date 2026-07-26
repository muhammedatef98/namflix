// Must run before any screen renders so every <Text> inherits Tajawal.
import '@/lib/patchTextFont';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Tajawal_300Light,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
} from '@expo-google-fonts/tajawal';
import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PremiumProvider, usePremium } from '@/contexts/PremiumContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { PlaybackProvider } from '@/contexts/PlaybackContext';
import { MixerProvider } from '@/contexts/MixerContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { WarmthOverlay } from '@/components/WarmthOverlay';
import { SplashLogo } from '@/components/SplashLogo';
import { NightPalette } from '@/constants/theme';

function RootNavigator() {
  const { session, loading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const segments = useSegments();
  const router = useRouter();
  const shownPaywall = useRef(false);

  useEffect(() => {
    if (loading) return;
    const onLogin = segments[0] === 'login';
    // The privacy policy must be readable before creating an account.
    const onPublic = onLogin || segments[0] === 'privacy';
    if (!session && !onPublic) router.replace('/login');
    else if (session && onLogin) router.replace('/');
  }, [session, loading, segments, router]);

  // Show the subscription page once right after login (unless already premium).
  useEffect(() => {
    if (loading || premiumLoading) return;
    if (!session) {
      shownPaywall.current = false; // reset so the next login shows it again
      return;
    }
    const onGate = segments[0] === 'login' || segments[0] === 'premium';
    if (session && !isPremium && !shownPaywall.current && !onGate) {
      shownPaywall.current = true;
      router.push('/premium');
    }
  }, [session, loading, premiumLoading, isPremium, segments, router]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={NightPalette.amber} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: NightPalette.voidBlack },
        animation: 'fade',
        animationDuration: 260,
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Tajawal_300Light,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={NightPalette.amber} />
      </View>
    );
  }

  return <AppTree />;
}

function AppTree() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <PremiumProvider>
            <FavoritesProvider>
              <PlaybackProvider>
                <MixerProvider>
                  <StatusBar style="light" />
                  <RootNavigator />
                  <WarmthOverlay />
                  {!splashDone && <SplashLogo onDone={() => setSplashDone(true)} />}
                </MixerProvider>
              </PlaybackProvider>
            </FavoritesProvider>
          </PremiumProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: NightPalette.voidBlack, justifyContent: 'center' },
});
