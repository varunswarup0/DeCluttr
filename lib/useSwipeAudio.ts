import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useAudioSettings } from './useAudioSettings';
import { audioService } from './audioService';

/**
 * Hook providing keep/delete swipe sounds and haptic feedback.
 * Ensures audioService is initialized only once per component.
 */
export const useSwipeAudio = () => {
  const { settings, isLoaded } = useAudioSettings();

  // Initialize once after settings have loaded
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isLoaded) {
      audioService.initialize().then(() => {
        audioService.setVolume(settings.volume);
        audioService.setEnabled(settings.enabled);
      });
    }
  }, [isLoaded]);
  /* eslint-enable react-hooks/exhaustive-deps */

  // Sync volume/enabled when settings change
  useEffect(() => {
    if (isLoaded) {
      audioService.setVolume(settings.volume);
      audioService.setEnabled(settings.enabled);
    }
  }, [isLoaded, settings.enabled, settings.volume]);

  const playDeleteSound = () => {
    audioService.playDeleteSound();
    // Trigger a strong haptic impact when a photo is deleted
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  };

  const playKeepSound = () => {
    audioService.playKeepSound();
    // Provide lighter feedback for keeping a photo
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  return {
    playDeleteSound,
    playKeepSound,
  };
};
