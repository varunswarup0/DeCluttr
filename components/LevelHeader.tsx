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
        'items-center rounded-full bg-[rgb(var(--android-xp)/0.2)] px-3 py-1 dark:bg-[rgb(var(--android-xp)/0.3)]',
        className
      )}>
      <Text className="font-arcade text-xs text-[rgb(var(--android-xp))]">
        ⭐ Lv {level} • {xp} XP
      </Text>
      <ProgressIndicator value={progress} className="mt-1 bg-[rgb(var(--android-xp))]" />
    </Animated.View>
  );
};
