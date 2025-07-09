import '../global.css';
import 'expo-dev-client';
import { useEffect } from 'react';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { Stack, useRouter, useSegments } from 'expo-router';
import { ErrorFallback } from '~/components/ErrorFallback';
import { StatusBar } from 'expo-status-bar';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { useRecycleBinStore } from '~/store/store';
import { useCustomFonts } from '~/lib/useCustomFonts';
import { backgroundMusicService } from '~/lib/backgroundMusic';
import { audioService } from '~/lib/audioService';
import { NAV_THEME } from '~/theme';
import { RetroOverlay } from '~/components/RetroOverlay';

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return <ErrorFallback error={error} />;
}

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const fontsLoaded = useCustomFonts();
  const {
    loadXP,
    loadDeletedPhotos,
    loadTotalDeleted,
    isXpLoaded,
    checkOnboardingStatus,
    loadZenMode,
  } = useRecycleBinStore();
  const segments = useSegments();
  const router = useRouter();

  // Load XP from AsyncStorage on app startup
  useEffect(() => {
    if (!isXpLoaded) {
      loadXP();
      loadDeletedPhotos();
      loadTotalDeleted();
      loadZenMode();
    }
  }, [loadXP, loadDeletedPhotos, loadTotalDeleted, loadZenMode, isXpLoaded]);

  // Check onboarding status only once on startup to avoid
  // repeated AsyncStorage reads when navigating between screens
  useEffect(() => {
    checkOnboardingStatus().then((completed) => {
      if (completed) {
        // If onboarding is completed, navigate to the main app
        if (segments.length < 1 || segments[0] === 'onboarding') {
          router.replace('/(tabs)');
        }
      } else {
        // If onboarding is NOT completed, redirect to onboarding
        if (segments[0] !== 'onboarding') {
          router.replace('/onboarding');
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkOnboardingStatus, router]);

  // Start background music once fonts and storage are ready
  useEffect(() => {
    if (fontsLoaded && isXpLoaded) {
      backgroundMusicService.play();
      audioService.initialize().catch(() => {});
    }
    return () => {
      backgroundMusicService.stop();
    };
  }, [fontsLoaded, isXpLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              <Stack screenOptions={SCREEN_OPTIONS}>
                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>

      {/* </ExampleProvider> */}
      <RetroOverlay />
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
} as const;
