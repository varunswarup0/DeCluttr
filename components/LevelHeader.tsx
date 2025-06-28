import React, { useRef, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { useRecycleBinStore } from '~/store/store';
import { cn } from '~/lib/cn';

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
    <Animated.View
      style={animatedStyle}
      className={cn(
        'items-center rounded-2xl bg-[rgb(var(--android-card))] px-4 py-2 shadow-md dark:bg-[rgb(var(--android-card))]',
        className
      )}>
      <Text className="font-arcade text-lg text-[rgb(var(--android-primary))]">Lv {level}</Text>
      <ProgressIndicator
        value={progress}
        className="mt-1 h-1 w-16 bg-[rgb(var(--android-primary))]"
      />
    </Animated.View>
  );
};
