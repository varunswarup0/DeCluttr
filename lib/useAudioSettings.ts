import { useState, useEffect } from 'react';
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
            setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
          } catch {
            // ignore corrupt data
          }
        }
      } catch (error) {
        console.warn('Failed to load audio settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);
  // Save settings to AsyncStorage
  const saveSettings = async (newSettings: Partial<AudioSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      const storage = getAsyncStorage();
      await storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  };

  const toggleAudio = () => {
    saveSettings({ enabled: !settings.enabled });
  };

  const setVolume = (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    saveSettings({ volume: clampedVolume });
  };

  return {
    settings,
    isLoaded,
    toggleAudio,
    setVolume,
    saveSettings,
  };
};
