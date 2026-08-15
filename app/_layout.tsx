// Must run before any screen renders so every <Text> inherits Tajawal.
import '@/lib/patchTextFont';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { PremiumProvider, usePremium } from '@/contexts/PremiumContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { PlaybackProvider } from '@/contexts/PlaybackContext';
import { MixerProvider } from '@/contexts/MixerContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { WarmthOverlay } from '@/components/WarmthOverlay';
import { SplashLogo } from '@/components/SplashLogo';
import { NightPalette } from '@/constants/theme';

// Set once the launch offer has been shown on entry, so it never interrupts
// again on later launches.
const OFFER_SEEN_KEY = 'namflix.offerSeen';

function RootNavigator() {
  const { isPremium, loading: premiumLoading } = usePremium();
  const segments = useSegments();
  const router = useRouter();
  const offerShown = useRef(false);

  // Surface the launch offer ONCE per install, right after first entry. It is
  // always skippable (the paywall renders a "Not now" control), and the flag
  // means we never nag on later launches — after that the offer lives in the
  // home banner and behind each locked feature.
  useEffect(() => {
    if (premiumLoading || isPremium) return;
    if (offerShown.current) return;
    if (segments[0] === 'premium') return;

    offerShown.current = true;
    AsyncStorage.getItem(OFFER_SEEN_KEY)
      .then((seen) => {
        if (seen) return;
        return AsyncStorage.setItem(OFFER_SEEN_KEY, '1').then(() => {
          router.push('/premium');
        });
      })
      .catch(() => undefined);
  }, [premiumLoading, isPremium, segments, router]);

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
      </LocaleProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: NightPalette.voidBlack, justifyContent: 'center' },
});
