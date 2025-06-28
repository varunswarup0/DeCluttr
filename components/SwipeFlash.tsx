import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';
import { px } from '~/lib/pixelPerfect';

interface SwipeFlashProps {
  label: string;
  onDone?: () => void;
}

export const SwipeFlash: React.FC<SwipeFlashProps> = ({ label, onDone }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
    scale.value = withSequence(
      withTiming(1.3, { duration: 200 }),
      withTiming(1, { duration: 150 })
    );
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 }, () => {
        if (onDone) runOnJS(onDone)();
      });
    }, 400);
    return () => clearTimeout(timeout);
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
          top: px(100),
          alignSelf: 'center',
        },
        style,
      ]}>
      <Text className="font-arcade text-xl text-[rgb(var(--android-primary))]">{label}</Text>
    </Animated.View>
  );
};

export default SwipeFlash;
