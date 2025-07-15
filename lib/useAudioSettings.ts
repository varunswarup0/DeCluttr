import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getAsyncStorage } from './asyncStorageWrapper';

export interface AudioSettings {
  enabled: boolean;
  volume: number;
}

const AUDIO_SETTINGS_KEY = 'decluttr_audio_settings';

const DEFAULT_SETTINGS: AudioSettings = {
  enabled: true,
  volume: 0.8,
};

export const useAudioSettings = () => {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storage = getAsyncStorage();
        const stored = await storage.getItem(AUDIO_SETTINGS_KEY);
        if (stored) {
          try {
            const parsedSettings = JSON.parse(stored);
            setSettings({
              enabled: parsedSettings.enabled ?? DEFAULT_SETTINGS.enabled,
              volume:
                parsedSettings.volume !== undefined
                  ? Math.max(0, Math.min(1, parsedSettings.volume))
                  : DEFAULT_SETTINGS.volume,
            });
          } catch {
            // ignore corrupt data
          }
        }
      } catch (error) {
        console.warn('Failed to load audio settings:', error);
        Alert.alert('Error', 'Failed to load audio settings');
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);
  const persist = async (s: AudioSettings) => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(s));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
      Alert.alert('Error', 'Failed to save audio settings');
    }
  };

  // Save settings to AsyncStorage
  const saveSettings = (updateFn: (cur: AudioSettings) => AudioSettings) => {
    setSettings((prev) => {
      const updated = updateFn(prev);
      void persist(updated);
      return updated;
    });
  };

  const toggleAudio = () => {
    saveSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    saveSettings((prev) => ({ ...prev, volume: clampedVolume }));
  };

  return {
    settings,
    isLoaded,
    toggleAudio,
    setVolume,
    saveSettings,
  };
};
