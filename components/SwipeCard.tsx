import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSwipeAudio } from '~/lib/useSwipeAudio';
import { px } from '~/lib/pixelPerfect';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = px(screenWidth * 0.7);
const CARD_HEIGHT = px(screenWidth * 0.8);
const BORDER_RADIUS = px(20);
// Slightly easier swipe threshold for smoother feel
const SWIPE_THRESHOLD = px(screenWidth * 0.15);

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
  const { playDeleteSound, playKeepSound, playTapSound } = useSwipeAudio();

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      if (!disabled) {
        scale.value = withSpring(0.95);
        runOnJS(playTapSound)();
      }
    },
    onActive: (event) => {
      if (!disabled) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.05; // Reduce vertical movement
      }
    },
    onEnd: (event) => {
      if (disabled) return;

      scale.value = withSpring(1);

      const velocityX = event.velocityX;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD || velocityX < -1000;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD || velocityX > 1000;

      if (shouldSwipeLeft) {
        // Swipe left - delete
        translateX.value = withTiming(-px(screenWidth * 1.5), {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(px(0), {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        });
        // Play delete sound and trigger callback
        runOnJS(playDeleteSound)();
        if (onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }
      } else if (shouldSwipeRight) {
        // Swipe right - keep
        translateX.value = withTiming(px(screenWidth * 1.5), {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(px(0), {
          duration: 180,
          easing: Easing.out(Easing.cubic),
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
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [1, 0.8]);

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
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
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      enabled={!disabled}
      activeOffsetX={[-8, 8]}
      failOffsetY={[-8, 8]}
      shouldCancelWhenOutside={false}>
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
        <Image
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
            <View className="rounded-full bg-white" style={{ padding: px(4) }}>
              <View
                className="items-center justify-center"
                style={{ height: px(32), width: px(32) }}>
                <View
                  className="absolute rotate-45 bg-red-500"
                  style={{ height: px(2), width: px(24) }}
                />
                <View
                  className="absolute -rotate-45 bg-red-500"
                  style={{ height: px(2), width: px(24) }}
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
            <View className="rounded-full bg-white" style={{ padding: px(4) }}>
              <View
                className="items-center justify-center"
                style={{ height: px(32), width: px(32) }}>
                <View
                  className="rotate-45 border-b-2 border-r-2 border-green-500"
                  style={{ marginTop: -px(4), height: px(16), width: px(8) }}
                />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};
