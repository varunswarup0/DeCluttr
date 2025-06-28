import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GameTile } from './GameTile';
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
      <GameTile className="px-4 py-3" accessibilityLabel="Optimizing">
        <View className="flex-row items-center justify-center">
          <Ionicons
            name="hardware-chip"
            size={px(20)}
            color="rgb(var(--android-card-foreground))"
          />
        </View>
        <View className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-white/20 dark:bg-white/30">
          <Animated.View style={[style]} className="h-full bg-white" />
        </View>
      </GameTile>
    </View>
  );
};
