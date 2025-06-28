import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '~/components/nativewindui/Text';
import { px } from '~/lib/pixelPerfect';

export const BackgroundOptimizer: React.FC = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(100, { duration: 1200 }), -1, false);
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View className="mt-4 items-center justify-center opacity-90">
      <View className="tile px-3 py-2">
        <View className="flex-row items-center">
          <Ionicons
            name="hardware-chip"
            size={px(18)}
            color="rgb(var(--android-card-foreground))"
          />
          <Text className="ml-2 font-arcade text-xs" color="secondary">
            Optimizing
          </Text>
        </View>
        <View className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-white/20 dark:bg-white/30">
          <Animated.View style={[style]} className="h-full bg-white" />
        </View>
      </View>
    </View>
  );
};
