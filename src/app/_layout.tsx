import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useColors } from '@/design-system/theme';
import { fonts } from '@/design-system/tokens';
import { AppDeckProvider, useAppDeck } from '@/features/app-data/AppDeckProvider';
import { BrandIntro } from '@/features/onboarding/BrandIntro';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Shell({ fontsReady }: { fontsReady: boolean }) {
  const c = useColors();
  const { ready } = useAppDeck();
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsReady]);
  if (!fontsReady) return null;
  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      <StatusBar style={c.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.canvas }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="cleanup-done" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
      {!introDone ? <BrandIntro ready={ready} onDone={finishIntro} /> : null}
    </View>
  );
}

function Themed({ fontsReady }: { fontsReady: boolean }) {
  const { settings } = useAppDeck();
  return (
    <ThemeProvider preference={settings.theme}>
      <Shell fontsReady={fontsReady} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    [fonts.regular]: require('@/assets/fonts/Pretendard-Regular.otf'),
    [fonts.medium]: require('@/assets/fonts/Pretendard-Medium.otf'),
    [fonts.semibold]: require('@/assets/fonts/Pretendard-SemiBold.otf'),
    [fonts.bold]: require('@/assets/fonts/Pretendard-Bold.otf'),
  });
  return (
    <SafeAreaProvider>
      <AppDeckProvider>
        <Themed fontsReady={loaded || error != null} />
      </AppDeckProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
