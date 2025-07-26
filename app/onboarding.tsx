import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import { StatusBar } from 'expo-status-bar';

import { useRecycleBinStore } from '~/store/store';
import { useColorScheme } from '~/lib/useColorScheme';
import { Text } from '~/components/nativewindui/Text';
import { lightImpact } from '~/lib/haptics';
import { px } from '~/lib/pixelPerfect';
import { Screen } from '~/components/Screen';

// Screen images
const screens = [
  {
    title: 'Declutter Photos',
    subtitle: 'Swipe left to delete forever, right to keep.',
    image: <View style={{ height: px(180) }} />,
    backgroundColor: '#025CBD',
  },
  {
    title: 'Recycle Bin',
    subtitle: 'Restore deleted photos anytime.',
    image: <View style={{ height: px(180) }} />,
    backgroundColor: '#E33131',
  },
  {
    title: 'Earn XP',
    subtitle: 'Gain points as you clean.',
    image: <View style={{ height: px(180) }} />,
    backgroundColor: '#025CBD',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useRecycleBinStore();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();
  // Function to handle onboarding completion
  const handleDone = async () => {
    await completeOnboarding();
    // Navigate to home screen
    router.replace('/(tabs)');
  };

  // Custom button components for better UI - using proper typing for React Native Onboarding Swiper
  const DoneButton = ({ isLight, onPress }: { isLight: boolean; onPress: () => void }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          lightImpact();
          onPress();
        }}
        style={[styles.buttonContainer, { backgroundColor: '#000' }]}>
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{`Let's Go!`}</Text>
      </TouchableOpacity>
    );
  };

  const SkipButton = ({
    skipLabel,
    onPress,
  }: {
    skipLabel: string | React.ReactElement;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          lightImpact();
          onPress();
        }}
        style={[styles.buttonContainer, { backgroundColor: '#E2E8F0' }]}>
        <Text style={styles.skipButtonText}>
          {typeof skipLabel === 'string' ? skipLabel : 'Skip'}
        </Text>
      </TouchableOpacity>
    );
  };

  const NextButton = ({
    nextLabel,
    onPress,
  }: {
    nextLabel?: string | React.ReactElement;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          lightImpact();
          onPress();
        }}
        style={[styles.buttonContainer, { backgroundColor: '#4F46E5' }]}>
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Next</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Screen style={styles.container}>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      <Onboarding
        pages={screens}
        onDone={handleDone}
        onSkip={handleDone} // Skip has same behavior as done
        containerStyles={styles.onboardingContainer}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        imageContainerStyles={styles.imageContainer}
        DoneButtonComponent={DoneButton}
        SkipButtonComponent={SkipButton}
        NextButtonComponent={NextButton}
        bottomBarHighlight={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  onboardingContainer: {
    paddingHorizontal: px(20),
  },
  title: {
    fontSize: px(28),
    // Use Expo's font name for Press Start 2P
    fontFamily: 'PressStart2P_400Regular',
    marginBottom: px(10),
    color: '#1A202C',
  },
  subtitle: {
    fontSize: px(18),
    lineHeight: px(26),
    fontFamily: 'PressStart2P_400Regular',
    color: '#4A5568',
    paddingHorizontal: px(20),
    textAlign: 'center',
  },
  imageContainer: {
    paddingBottom: px(20),
  },
  buttonContainer: {
    paddingHorizontal: px(24),
    paddingVertical: px(12),
    borderRadius: px(24),
    marginHorizontal: px(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: px(16),
    fontFamily: 'PressStart2P_400Regular',
  },
  skipButtonContainer: {
    backgroundColor: '#E2E8F0',
    marginHorizontal: px(20),
  },
  skipButtonText: {
    fontSize: px(16),
    fontFamily: 'PressStart2P_400Regular',
    color: '#4A5568',
  },
});
