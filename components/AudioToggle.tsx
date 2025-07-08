import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioSettings } from '~/lib/useAudioSettings';
import { px } from '~/lib/pixelPerfect';

export const AudioToggle: React.FC = () => {
  const { settings, toggleAudio, isLoaded } = useAudioSettings();

  if (!isLoaded) return null;

  return (
    <Pressable onPress={toggleAudio} className="p-1">
      <Ionicons
        name={settings.enabled ? 'volume-high' : 'volume-mute'}
        size={px(16)}
        color="rgb(var(--android-primary))"
      />
    </Pressable>
  );
};
