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
  const x1 = useSharedValue(0);
  const y1 = useSharedValue(0);
  const r1 = useSharedValue(0);
  const r1y = useSharedValue(0);
  const s1 = useSharedValue(1);
  const o1 = useSharedValue(0);

  const x2 = useSharedValue(0);
  const y2 = useSharedValue(0);
  const r2 = useSharedValue(0);
  const r2y = useSharedValue(0);
  const s2 = useSharedValue(1);
  const o2 = useSharedValue(0);

  const x3 = useSharedValue(0);
  const y3 = useSharedValue(0);
  const r3 = useSharedValue(0);
  const r3y = useSharedValue(0);
  const s3 = useSharedValue(1);
  const o3 = useSharedValue(0);

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
      x1.value = withTiming(curr.x, { duration: 50 });
      y1.value = withTiming(curr.y, { duration: 50 });
      r1.value = withTiming(curr.r, { duration: 50 });
      r1y.value = withTiming(curr.ry, { duration: 50 });
      s1.value = withTiming(curr.s, { duration: 50 });
      o1.value = withTiming(curr.a ? 0.15 : 0, { duration: 100 });

      x2.value = withTiming(curr.x, { duration: 100 });
      y2.value = withTiming(curr.y, { duration: 100 });
      r2.value = withTiming(curr.r, { duration: 100 });
      r2y.value = withTiming(curr.ry, { duration: 100 });
      s2.value = withTiming(curr.s, { duration: 100 });
      o2.value = withTiming(curr.a ? 0.1 : 0, { duration: 100 });

      x3.value = withTiming(curr.x, { duration: 150 });
      y3.value = withTiming(curr.y, { duration: 150 });
      r3.value = withTiming(curr.r, { duration: 150 });
      r3y.value = withTiming(curr.ry, { duration: 150 });
      s3.value = withTiming(curr.s, { duration: 150 });
      o3.value = withTiming(curr.a ? 0.05 : 0, { duration: 100 });
    }
  );

  const style1 = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS,
    opacity: o1.value,
    transform: [
      { translateX: x1.value },
      { translateY: y1.value },
      { rotateZ: `${r1.value}deg` },
      { rotateY: `${r1y.value}deg` },
      { scale: s1.value },
    ],
  }));

  const style2 = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS,
    opacity: o2.value,
    transform: [
      { translateX: x2.value },
      { translateY: y2.value },
      { rotateZ: `${r2.value}deg` },
      { rotateY: `${r2y.value}deg` },
      { scale: s2.value },
    ],
  }));

  const style3 = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS,
    opacity: o3.value,
    transform: [
      { translateX: x3.value },
      { translateY: y3.value },
      { rotateZ: `${r3.value}deg` },
      { rotateY: `${r3y.value}deg` },
      { scale: s3.value },
    ],
  }));

  return (
    <>
      <Animated.Image
        source={{ uri: imageUri }}
        style={style3}
        resizeMode="cover"
        pointerEvents="none"
      />
      <Animated.Image
        source={{ uri: imageUri }}
        style={style2}
        resizeMode="cover"
        pointerEvents="none"
      />
      <Animated.Image
        source={{ uri: imageUri }}
        style={style1}
        resizeMode="cover"
        pointerEvents="none"
      />
    </>
  );
};

export default SwipeTrail;
