import React, { useRef, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';
import { GameTile } from './GameTile';
import { useRecycleBinStore } from '~/store/store';
import { px } from '~/lib/pixelPerfect';
import { successNotification } from '~/lib/haptics';

export const ScoreHeader: React.FC = () => {
  const { xp } = useRecycleBinStore();
  const scale = useSharedValue(1);
  const prevLevel = useRef(Math.floor(xp / 100) + 1);

  const level = Math.floor(xp / 100) + 1;

  useEffect(() => {
    if (level > prevLevel.current) {
      scale.value = 1.2;
      scale.value = withTiming(1, { duration: 300 });
      successNotification();
    }
    prevLevel.current = level;
  }, [level, xp, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ flexDirection: 'row', gap: px(6) }, animatedStyle]}>
      <GameTile className="min-w-[60px] items-center px-2 py-1">
        <Text className="font-arcade text-sm text-[rgb(var(--android-primary))]">Lv {level}</Text>
      </GameTile>
      <GameTile className="min-w-[60px] items-center px-2 py-1">
        <Text className="font-arcade text-sm text-[rgb(var(--android-primary))]">{xp} XP</Text>
      </GameTile>
    </Animated.View>
  );
};
