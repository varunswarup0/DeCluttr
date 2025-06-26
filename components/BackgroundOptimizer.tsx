import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/nativewindui/Text';
import { px } from '~/lib/pixelPerfect';

export const BackgroundOptimizer: React.FC = () => (
  <View className="mt-4 flex-row items-center justify-center opacity-80">
    <Ionicons
      name="hardware-chip"
      size={px(14)}
      color="rgb(var(--android-muted-foreground))"
    />
    <Text className="ml-2 text-xs" color="secondary">
      Optimizing in the background…
    </Text>
  </View>
);
