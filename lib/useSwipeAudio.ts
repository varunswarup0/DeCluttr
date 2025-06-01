import { useAudioPlayer } from 'expo-audio';
import { useEffect } from 'react';
import { useAudioSettings } from './useAudioSettings';

/**
 * Hook for managing delete sound effect
 */
export const useDeleteAudio = () => {
  const { settings } = useAudioSettings();
  const player = useAudioPlayer(require('../assets/sounds/delete.mp3'));

  useEffect(() => {
    if (player) {
      player.volume = settings.volume;
    }
  }, [player, settings.volume]);

  const playDeleteSound = () => {
    if (settings.enabled && player) {
      try {
        player.seekTo(0);
        player.play();
      } catch (error) {
        console.warn('Failed to play delete sound:', error);
      }
    }
  };

  return { playDeleteSound };
};

/**
 * Hook for managing keep sound effect
 */
export const useKeepAudio = () => {
  const { settings } = useAudioSettings();
  const player = useAudioPlayer(require('../assets/sounds/keep.mp3'));

  useEffect(() => {
    if (player) {
      player.volume = settings.volume;
    }
  }, [player, settings.volume]);

  const playKeepSound = () => {
    if (settings.enabled && player) {
      try {
        player.seekTo(0);
        player.play();
      } catch (error) {
        console.warn('Failed to play keep sound:', error);
      }
    }
  };

  return { playKeepSound };
};

/**
 * Combined hook for both audio effects
 */
export const useSwipeAudio = () => {
  const { playDeleteSound } = useDeleteAudio();
  const { playKeepSound } = useKeepAudio();

  return {
    playDeleteSound,
    playKeepSound,
  };
};
