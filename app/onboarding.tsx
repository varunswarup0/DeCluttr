import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Onboarding from 'react-native-onboarding-swiper';
import { StatusBar } from 'expo-status-bar';

import { useRecycleBinStore } from '~/store/store';
import { useColorScheme } from '~/lib/useColorScheme';

// Screen images
const screens = [
  {
    title: 'Declutter Your Photos',
    subtitle: 'Swipe left to remove photos you no longer need, swipe right to keep them.',
    image: <Image source={require('../assets/onboarding/step-1.png')} />, // Using app icon
    backgroundColor: '#025CBD',
  },
  {
    title: 'Recycle Bin',
    subtitle: 'Deleted photos go to the Recycle Bin. You can restore them anytime.',
    image: <Image source={require('../assets/onboarding/step-2.png')} />, // Using app icon
    backgroundColor: '#E33131',
  },
  {
    title: 'Earn XP',
    subtitle: 'Earn experience points for decluttering your photos. Track your progress!',
    image: <Image source={require('../assets/onboarding/step-3.png')} />, // Using app icon
    backgroundColor: '#025CBD',
  },
  {
    title: 'Earn XP',
    subtitle: 'Earn experience points for decluttering your photos. Track your progress!',
    image: <Image source={require('../assets/onboarding/step-4.png')} />, // Using app icon
    backgroundColor: '#E33131',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding, onboardingCompleted } = useRecycleBinStore();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  // Check if onboarding is already completed
  useEffect(() => {
    if (onboardingCompleted) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [onboardingCompleted, router]);
  // Function to handle onboarding completion
  const handleDone = async () => {
    await completeOnboarding();
    // Navigate to home screen
    router.replace('/(drawer)/(tabs)');
  };

  // Custom button components for better UI - using proper typing for React Native Onboarding Swiper
  const DoneButton = ({ isLight, onPress }: { isLight: boolean; onPress: () => void }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
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
        onPress={onPress}
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
        onPress={onPress}
        style={[styles.buttonContainer, { backgroundColor: '#4F46E5' }]}>
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Next</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  onboardingContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: '#4A5568',
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  imageContainer: {
    paddingBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonContainer: {
    backgroundColor: '#E2E8F0',
    marginHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#4A5568',
  },
});
