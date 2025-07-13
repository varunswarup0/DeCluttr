import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface SpeedLinesOverlayProps {
  direction: 'left' | 'right';
  onDone?: () => void;
}

const LINE_COUNT = 5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SpeedLinesOverlay: React.FC<SpeedLinesOverlayProps> = ({ direction, onDone }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 250 }, () => {
      if (onDone) runOnJS(onDone)();
    });
  }, [onDone, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: (direction === 'left' ? -1 : 1) * progress.value * SCREEN_WIDTH,
      },
    ],
    opacity: 1 - progress.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, containerStyle]}>
      {Array.from({ length: LINE_COUNT }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.line,
            {
              left: SCREEN_WIDTH / 2 + (i - LINE_COUNT / 2) * 12,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

export default SpeedLinesOverlay;
