import { useEffect } from 'react';
import { useAudioSettings } from './useAudioSettings';
import { audioService } from './audioService';

/**
 * Hook providing keep/delete swipe sounds.
 * Ensures audioService is initialized only once per component.
 */
export const useSwipeAudio = () => {
  const { settings, isLoaded } = useAudioSettings();

  // Initialize and sync settings when they load
  useEffect(() => {
    if (isLoaded) {
      audioService.initialize().then(() => {
        audioService.setVolume(settings.volume);
        audioService.setEnabled(settings.enabled);
      });
    }
  }, [isLoaded, settings.enabled, settings.volume]);

  const playDeleteSound = () => {
    audioService.playDeleteSound();
  };

  const playKeepSound = () => {
    audioService.playKeepSound();
  };

  return {
    playDeleteSound,
    playKeepSound,
  };
};
