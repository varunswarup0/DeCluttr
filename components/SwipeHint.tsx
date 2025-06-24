import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { px } from '~/lib/pixelPerfect';

interface SwipeHintProps {
  onDone?: () => void;
}

export const SwipeHint: React.FC<SwipeHintProps> = ({ onDone }) => {
  const opacity = useSharedValue(0);
  const shift = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    shift.value = withRepeat(
      withSequence(withTiming(px(4), { duration: 400 }), withTiming(-px(4), { duration: 400 })),
      -1,
      true
    );
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        if (onDone) {
          runOnJS(onDone)();
        }
      });
    }, 2500);
    return () => clearTimeout(timeout);
  }, [onDone, opacity, shift]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shift.value }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -shift.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          marginTop: -px(20),
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: px(40),
        },
        containerStyle,
      ]}>
      <Animated.View style={leftStyle}>
        <Ionicons name="arrow-back" size={px(20)} color="rgba(255,255,255,0.9)" />
      </Animated.View>
      <Animated.View style={rightStyle}>
        <Ionicons name="arrow-forward" size={px(20)} color="rgba(255,255,255,0.9)" />
      </Animated.View>
    </Animated.View>
  );
};
