import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useAudioSettings } from './useAudioSettings';
import { audioService } from './audioService';

/**
 * Hook providing keep/delete swipe sounds.
 * Ensures audioService is initialized only once per component.
 */
export const useSwipeAudio = () => {
  const { settings, isLoaded } = useAudioSettings();

  // Initialize and sync settings when they change
  useEffect(() => {
    if (!isLoaded) return;

    audioService.initialize().then(() => {
      audioService.setVolume(settings.volume);
      audioService.setEnabled(settings.enabled);
    });
  }, [isLoaded, settings.enabled, settings.volume]);

  const playDeleteSound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    audioService.playDeleteSound();
  };

  const playKeepSound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    audioService.playKeepSound();
  };

  const playTapSound = () => {
    Haptics.selectionAsync();
    audioService.playTapSound();
  };

  return {
    playDeleteSound,
    playKeepSound,
    playTapSound,
  };
};
