import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecycleBinStore } from '~/store/store';
import { px } from '~/lib/pixelPerfect';

export const NavigationToggle: React.FC = () => {
  const { navigationMode, setNavigationMode } = useRecycleBinStore();

  const toggle = () => {
    setNavigationMode(!navigationMode);
  };

  return (
    <Pressable
      onPress={toggle}
      accessibilityLabel={navigationMode ? 'Switch to delete mode' : 'Switch to navigation mode'}
      className="p-1">
      <Ionicons
        name={navigationMode ? 'swap-horizontal' : 'trash'}
        size={px(16)}
        color="rgb(var(--android-primary))"
      />
    </Pressable>
  );
};

export default NavigationToggle;
