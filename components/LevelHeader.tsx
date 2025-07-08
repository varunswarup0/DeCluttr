import React, { useRef, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { Ionicons } from '@expo/vector-icons';
import { GameTile } from './GameTile';
import { useRecycleBinStore } from '~/store/store';
import { cn } from '~/lib/cn';
import { px } from '~/lib/pixelPerfect';

interface LevelHeaderProps {
  className?: string;
}

export const LevelHeader: React.FC<LevelHeaderProps> = ({ className }) => {
  const { xp } = useRecycleBinStore();
  const scale = useSharedValue(1);
  const prevLevel = useRef(Math.floor(xp / 100) + 1);

  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  useEffect(() => {
    const leveledUp = level > prevLevel.current;
    if (leveledUp) {
      scale.value = 1.3;
      scale.value = withTiming(1, { duration: 300 });
    }
    prevLevel.current = level;
  }, [level, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <GameTile className={cn('px-5 py-3', className)}>
        <Animated.View className="mb-1 flex-row items-center justify-center gap-1">
          <Text className="font-arcade text-xl text-[rgb(var(--android-primary))]">
            LEVEL {level}
          </Text>
          <Ionicons name="star" size={px(14)} color="rgb(var(--android-primary))" />
        </Animated.View>
        <ProgressIndicator
          value={progress}
          className="mt-1 h-2 w-24 bg-[rgb(var(--android-primary))]"
        />
      </GameTile>
    </Animated.View>
  );
};
