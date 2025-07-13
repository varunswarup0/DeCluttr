import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

interface GlitchOverlayProps {
  onDone?: () => void;
}

export const GlitchOverlay: React.FC<GlitchOverlayProps> = ({ onDone }) => {
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 60 });
    offset.value = withRepeat(
      withSequence(withTiming(-4, { duration: 40 }), withTiming(4, { duration: 40 })),
      5,
      true
    );
    scale.value = withRepeat(
      withSequence(withTiming(1.02, { duration: 60 }), withTiming(1, { duration: 60 })),
      5,
      true
    );

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 120 }, () => {
        if (onDone) runOnJS(onDone)();
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [offset, scale, opacity, onDone]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: offset.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, style]} />
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});

export default GlitchOverlay;
