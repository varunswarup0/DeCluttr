import { useEffect } from 'react';
import { useAudioSettings } from './useAudioSettings';
import { audioService } from './audioService';
import { heavyImpact, lightImpact } from './haptics';

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
    heavyImpact();
  };

  const playKeepSound = () => {
    audioService.playKeepSound();
    lightImpact();
  };

  const playTapSound = () => {
    audioService.playTapSound();
  };

  return {
    playDeleteSound,
    playKeepSound,
    playTapSound,
  };
};
