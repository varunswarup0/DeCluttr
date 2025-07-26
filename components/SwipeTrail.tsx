import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';
import { px } from '~/lib/pixelPerfect';

interface SwipeTrailProps {
  imageUri: string;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  rotateZ: SharedValue<number>;
  rotateY: SharedValue<number>;
  scale: SharedValue<number>;
  active: SharedValue<number>;
}

const BORDER_RADIUS = px(20);

export const SwipeTrail: React.FC<SwipeTrailProps> = ({
  imageUri,
  translateX,
  translateY,
  rotateZ,
  rotateY,
  scale,
  active,
}) => {
  // Single trailing layer for better performance
  const trailX = useSharedValue(0);
  const trailY = useSharedValue(0);
  const trailRZ = useSharedValue(0);
  const trailRY = useSharedValue(0);
  const trailScale = useSharedValue(1);
  const trailOpacity = useSharedValue(0);

  useAnimatedReaction(
    () => ({
      x: translateX.value,
      y: translateY.value,
      r: rotateZ.value,
      ry: rotateY.value,
      s: scale.value,
      a: active.value,
    }),
    (curr) => {
      trailX.value = withTiming(curr.x, { duration: 100 });
      trailY.value = withTiming(curr.y, { duration: 100 });
      trailRZ.value = withTiming(curr.r, { duration: 100 });
      trailRY.value = withTiming(curr.ry, { duration: 100 });
      trailScale.value = withTiming(curr.s, { duration: 100 });
      trailOpacity.value = withTiming(curr.a ? 0.1 : 0, { duration: 100 });
    }
  );

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS,
    opacity: trailOpacity.value,
    transform: [
      { translateX: trailX.value },
      { translateY: trailY.value },
      { rotateZ: `${trailRZ.value}deg` },
      { rotateY: `${trailRY.value}deg` },
      { scale: trailScale.value },
    ],
  }));

  return (
    // pointerEvents isn't typed for Animated.Image but works at runtime
    <Animated.Image
      source={{ uri: imageUri }}
      style={style}
      resizeMode="cover"
      // @ts-expect-error pointerEvents not in ImageProps
      pointerEvents="none"
    />
  );
};

export default SwipeTrail;
