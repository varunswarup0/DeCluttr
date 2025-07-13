import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';

interface FlockOverlayProps {
  onDone?: () => void;
}

const BIRD_COUNT = 5;

export const FlockOverlay: React.FC<FlockOverlayProps> = ({ onDone }) => {
  const screenWidth = Dimensions.get('window').width;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      100,
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(2, { duration: 100, easing: Easing.linear }, () => {
          onDone?.();
        })
      )
    );
  }, [progress, onDone]);

  const birds = new Array(BIRD_COUNT).fill(0).map((_, i) => {
    const style = useAnimatedStyle(() => ({
      position: 'absolute',
      bottom: i * 10,
      left: -30,
      transform: [
        {
          translateX: (progress.value - i * 0.1) * screenWidth,
        },
        {
          translateY: Math.sin(progress.value * 6 + i) * 20,
        },
      ],
      opacity: progress.value < 1 ? 1 : 0,
    }));
    return (
      <Animated.Text key={i} style={[styles.bird, style]}>
        🐦
      </Animated.Text>
    );
  });

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {birds}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bird: {
    fontSize: 24,
  },
});

export default FlockOverlay;
