import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecycleBinStore } from '~/store/store';
import { px } from '~/lib/pixelPerfect';

export const ZenToggle: React.FC = () => {
  const { zenMode, setZenMode } = useRecycleBinStore();

  const toggle = () => {
    setZenMode(!zenMode);
  };

  return (
    <Pressable onPress={toggle} accessibilityLabel="Toggle zen mode" className="p-1">
      <Ionicons
        name={zenMode ? 'eye-off' : 'eye'}
        size={px(16)}
        color="rgb(var(--android-primary))"
      />
    </Pressable>
  );
};

export default ZenToggle;
