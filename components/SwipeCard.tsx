import React from 'react';
import { View, Dimensions } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  LongPressGestureHandler,
  State as GestureState,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { useSwipeAudio } from '~/lib/useSwipeAudio';
import { lightImpact } from '~/lib/haptics';
import { px } from '~/lib/pixelPerfect';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = px(screenWidth * 0.7);
const CARD_HEIGHT = px(screenWidth * 0.8);
const BORDER_RADIUS = px(20);
// Reduced threshold so even short drags register quickly
const SWIPE_THRESHOLD = px(screenWidth * 0.1);
// Shorter exit animation for snappier feedback
const SWIPE_EXIT_DURATION = 60;
const ICON_SIZE = px(36);
const STROKE_WIDTH = px(3);
const OVERLAY_PADDING = px(6);
// Expand touch area to make starting swipes easier
const HIT_SLOP = px(16);

export interface SwipeCardProps {
  imageUri: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: any;
  disabled?: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  imageUri,
  onSwipeLeft,
  onSwipeRight,
  style,
  disabled = false,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zoomScale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const { playDeleteSound, playKeepSound } = useSwipeAudio();
  const onTap = () => lightImpact();

  const handleLongPress = ({ nativeEvent }: { nativeEvent: { state: number } }) => {
    if (nativeEvent.state === GestureState.ACTIVE) {
      zoomScale.value = withTiming(1.5);
    } else if (
      nativeEvent.state === GestureState.END ||
      nativeEvent.state === GestureState.CANCELLED ||
      nativeEvent.state === GestureState.FAILED
    ) {
      zoomScale.value = withTiming(1);
    }
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      if (!disabled) {
        scale.value = withSpring(0.95);
        runOnJS(onTap)();
      }
    },
    onActive: (event) => {
      if (!disabled) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.05; // Reduce vertical movement
        rotateZ.value = event.translationX * 0.001;
      }
    },
    onEnd: (event) => {
      if (disabled) return;

      scale.value = withSpring(1);
      rotateZ.value = withSpring(0);

      const velocityX = event.velocityX;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD || velocityX < -1000;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD || velocityX > 1000;

      const velocityFactor = Math.min(Math.abs(velocityX) / 2000, 1);
      const exitDistance = px(screenWidth * (1.5 + velocityFactor));
      const exitDuration = SWIPE_EXIT_DURATION * (1 - velocityFactor * 0.5);
      const extraRotation = 10 * velocityFactor;

      if (shouldSwipeLeft) {
        // Swipe left - delete
        translateX.value = withTiming(-exitDistance, {
          duration: exitDuration,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(px(0), {
          duration: exitDuration,
          easing: Easing.out(Easing.cubic),
        });
        rotateZ.value = withTiming(-(20 + extraRotation), {
          duration: exitDuration,
        });
        // Play delete sound and trigger callback
        runOnJS(playDeleteSound)();
        if (onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }
      } else if (shouldSwipeRight) {
        // Swipe right - keep
        translateX.value = withTiming(exitDistance, {
          duration: exitDuration,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(px(0), {
          duration: exitDuration,
          easing: Easing.out(Easing.cubic),
        });
        rotateZ.value = withTiming(20 + extraRotation, {
          duration: exitDuration,
        });
        // Play keep sound and trigger callback
        runOnJS(playKeepSound)();
        if (onSwipeRight) {
          runOnJS(onSwipeRight)();
        }
      } else {
        // Snap back to center
        const springConfig = { damping: 15, stiffness: 200 };
        translateX.value = withSpring(0, springConfig);
        translateY.value = withSpring(0, springConfig);
        rotateZ.value = withSpring(0, springConfig);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [1, 0.8]);

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ.value}deg` },
        { scale: scale.value * zoomScale.value },
      ],
      opacity,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const leftOpacity = interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]);
    const rightOpacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]);

    return {
      opacity: Math.max(leftOpacity, rightOpacity),
    };
  });

  const deleteOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]);
    return { opacity };
  });

  const keepOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]);
    return { opacity };
  });

  return (
    <LongPressGestureHandler onHandlerStateChange={handleLongPress} minDurationMs={200}>
      <Animated.View>
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          enabled={!disabled}
          activeOffsetX={[-6, 6]}
          failOffsetY={[-6, 6]}
          shouldCancelWhenOutside={false}
          hitSlop={{ horizontal: HIT_SLOP, vertical: HIT_SLOP }}>
          <Animated.View
            style={[
              {
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: BORDER_RADIUS,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              },
              animatedStyle,
              style,
            ]}>
            <Animated.Image
              entering={FadeIn.duration(200)}
              source={{ uri: imageUri }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: BORDER_RADIUS,
              }}
              resizeMode="cover"
            />

            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: BORDER_RADIUS,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                overlayStyle,
              ]}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 59, 48, 0.8)',
                    borderRadius: BORDER_RADIUS,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  deleteOverlayStyle,
                ]}>
                <View className="rounded-full bg-white" style={{ padding: OVERLAY_PADDING }}>
                  <View
                    className="items-center justify-center"
                    style={{ height: ICON_SIZE, width: ICON_SIZE }}>
                    <View
                      className="absolute rotate-45 bg-red-500"
                      style={{ height: STROKE_WIDTH, width: ICON_SIZE * 0.8 }}
                    />
                    <View
                      className="absolute -rotate-45 bg-red-500"
                      style={{ height: STROKE_WIDTH, width: ICON_SIZE * 0.8 }}
                    />
                  </View>
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(52, 199, 89, 0.8)',
                    borderRadius: BORDER_RADIUS,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  keepOverlayStyle,
                ]}>
                <View className="rounded-full bg-white" style={{ padding: OVERLAY_PADDING }}>
                  <View
                    className="items-center justify-center"
                    style={{ height: ICON_SIZE, width: ICON_SIZE }}>
                    <View
                      className="rotate-45 border-b-2 border-r-2 border-green-500"
                      style={{
                        marginTop: -px(4),
                        height: ICON_SIZE * 0.55,
                        width: ICON_SIZE * 0.28,
                      }}
                    />
                  </View>
                </View>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </LongPressGestureHandler>
  );
};
