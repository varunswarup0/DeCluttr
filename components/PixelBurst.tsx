import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { px } from '~/lib/pixelPerfect';

interface PixelBurstProps {
  /** Hex color or rgb string for the pixel pieces */
  color?: string;
  onDone?: () => void;
}

export const PixelBurst: React.FC<PixelBurstProps> = ({ color = 'white', onDone }) => {
  const pieces = Array.from({ length: 8 }).map(() => ({
    x: useSharedValue(0),
    y: useSharedValue(0),
    opacity: useSharedValue(1),
  }));

  useEffect(() => {
    pieces.forEach((p) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = px(20 + Math.random() * 20);
      p.x.value = withTiming(Math.cos(angle) * distance, { duration: 300 });
      p.y.value = withTiming(Math.sin(angle) * distance, { duration: 300 });
      p.opacity.value = withTiming(0, { duration: 300 });
    });
    const timer = setTimeout(() => {
      if (onDone) onDone();
    }, 300);
    return () => clearTimeout(timer);
  }, [onDone, pieces]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -px(2),
        marginTop: -px(2),
      }}>
      {pieces.map((p, i) => {
        const style = useAnimatedStyle(() => ({
          transform: [{ translateX: p.x.value }, { translateY: p.y.value }],
          opacity: p.opacity.value,
        }));
        return (
          <Animated.View
            key={i}
            style={[
              {
                width: px(4),
                height: px(4),
                backgroundColor: color,
                position: 'absolute',
              },
              style,
            ]}
          />
        );
      })}
    </View>
  );
};

export default PixelBurst;
