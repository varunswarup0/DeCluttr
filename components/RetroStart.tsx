import React, { useEffect, useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';

interface RetroStartProps {
  onDone?: () => void;
}

export const RetroStart: React.FC<RetroStartProps> = ({ onDone }) => {
  const [label, setLabel] = useState('READY');
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withTiming(1, { duration: 300 });

    const readyTimeout = setTimeout(() => {
      setLabel('GO!');
      scale.value = withTiming(1.2, { duration: 200 });
      const doneTimeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          if (onDone) runOnJS(onDone)();
        });
      }, 500);
      return () => clearTimeout(doneTimeout);
    }, 600);

    return () => clearTimeout(readyTimeout);
  }, [onDone, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: '40%',
          left: 0,
          right: 0,
          alignItems: 'center',
        },
        style,
      ]}>
      <Text className="font-arcade text-3xl text-[rgb(var(--android-primary))]">{label}</Text>
    </Animated.View>
  );
};
