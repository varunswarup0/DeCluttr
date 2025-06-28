import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export const RetroOverlay: React.FC = () => {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(withTiming(-4, { duration: 800 }), -1, true);
  }, [offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.overlay, animatedStyle]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.04)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    zIndex: 100,
  },
});

export default RetroOverlay;
