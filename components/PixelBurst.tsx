import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { px } from '~/lib/pixelPerfect';

interface PixelBurstProps {
  /** Hex color or rgb string for the pixel pieces */
  color?: string;
  onDone?: () => void;
}

interface PixelProps {
  color: string;
  angle: number;
}

const Pixel: React.FC<PixelProps> = ({ color, angle }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const distance = px(20 + Math.random() * 20);
    x.value = withTiming(Math.cos(angle) * distance, { duration: 300 });
    y.value = withTiming(Math.sin(angle) * distance, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 });
  }, [angle]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
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
};

export const PixelBurst: React.FC<PixelBurstProps> = ({ color = 'white', onDone }) => {
  const angles = useMemo(
    () => Array.from({ length: 8 }).map(() => Math.random() * Math.PI * 2),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onDone?.();
    }, 300);
    return () => clearTimeout(timer);
  }, [onDone]);

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
      {angles.map((angle, i) => (
        <Pixel key={i} color={color} angle={angle} />
      ))}
    </View>
  );
};

export default PixelBurst;
