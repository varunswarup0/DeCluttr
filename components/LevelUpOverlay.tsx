import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Text } from '~/components/nativewindui/Text';

interface LevelUpOverlayProps {
  onDone?: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ onDone }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 150 });
    scale.value = withSequence(
      withTiming(1.3, { duration: 250 }),
      withTiming(1, { duration: 150 })
    );
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        if (onDone) runOnJS(onDone)();
      });
    }, 800);
    return () => clearTimeout(timeout);
  }, [onDone, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, style]}>
      <Text className="font-arcade text-3xl text-[rgb(var(--android-primary))]">LEVEL UP!</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LevelUpOverlay;
