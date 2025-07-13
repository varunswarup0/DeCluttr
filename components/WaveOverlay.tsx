import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface WaveOverlayProps {
  onDone?: () => void;
}

export const WaveOverlay: React.FC<WaveOverlayProps> = ({ onDone }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 500 }, () => {
      onDone?.();
    });
  }, [progress, onDone]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value }],
    opacity: 1 - progress.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0)"]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WaveOverlay;
