import '../global.css';
import 'expo-dev-client';
import { useEffect } from 'react';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { useRecycleBinStore } from '~/store/store';
import { NAV_THEME } from '~/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const { loadXP, loadDeletedPhotos, isXpLoaded, checkOnboardingStatus } = useRecycleBinStore();
  const segments = useSegments();
  const router = useRouter();

  // Load XP from AsyncStorage on app startup
  useEffect(() => {
    if (!isXpLoaded) {
      loadXP();
      loadDeletedPhotos();
    }
  }, [loadXP, loadDeletedPhotos, isXpLoaded]);

  // Check onboarding status on startup
  useEffect(() => {
    checkOnboardingStatus().then((completed) => {
      if (completed) {
        // If onboarding is completed, navigate to the main app
        if (segments.length < 1 || segments[0] === 'onboarding') {
          router.replace('/(drawer)/(tabs)');
        }
      } else {
        // If onboarding is NOT completed, redirect to onboarding
        if (segments[0] !== 'onboarding') {
          router.replace('/onboarding');
        }
      }
    });
  }, [checkOnboardingStatus, segments, router]);

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
                <Stack.Screen name="(drawer)" options={DRAWER_OPTIONS} />
              </Stack>
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>

      {/* </ExampleProvider> */}
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
} as const;

const DRAWER_OPTIONS = {
  headerShown: false,
} as const;
