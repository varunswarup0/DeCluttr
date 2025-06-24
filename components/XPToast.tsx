import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';
import { px } from '~/lib/pixelPerfect';

interface XPToastProps {
  amount: number;
  onDone?: () => void;
}

export const XPToast: React.FC<XPToastProps> = ({ amount, onDone }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(px(20));
  const scale = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
    translateY.value = withTiming(0, { duration: 100 });
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });

    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        if (onDone) {
          runOnJS(onDone)();
        }
      });
    }, 600);

    return () => clearTimeout(timeout);
  }, [onDone, opacity, translateY, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: px(80),
          alignSelf: 'center',
          paddingHorizontal: px(8),
          paddingVertical: px(4),
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: px(4),
        },
        style,
      ]}
      pointerEvents="none">
      <Text className="font-arcade text-white">+{amount} XP</Text>
    </Animated.View>
  );
};
