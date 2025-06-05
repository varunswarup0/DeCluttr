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
} from 'react-native-reanimated';
import { useSwipeAudio } from '~/lib/useSwipeAudio';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

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
  const { playDeleteSound, playKeepSound } = useSwipeAudio();

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      if (!disabled) {
        scale.value = withSpring(0.8);
      }
    },
    onActive: (event) => {
      if (!disabled) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.1; // Reduce vertical movement
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
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
        translateY.value = withTiming(0, { duration: 300 });
        // Play delete sound and trigger callback
        runOnJS(playDeleteSound)();
        if (onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }
      } else if (shouldSwipeRight) {
        // Swipe right - keep
        translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
        translateY.value = withTiming(0, { duration: 300 });
        // Play keep sound and trigger callback
        runOnJS(playKeepSound)();
        if (onSwipeRight) {
          runOnJS(onSwipeRight)();
        }
      } else {
        // Snap back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
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
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
      <Animated.View
        style={[
          {
            width: screenWidth * 0.7,
            height: screenWidth * 0.8,
            borderRadius: 20,
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
            borderRadius: 20,
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
              borderRadius: 20,
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
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              },
              deleteOverlayStyle,
            ]}>
            <View className="rounded-full bg-white p-4">
              <View className="h-8 w-8 items-center justify-center">
                <View className="absolute h-0.5 w-6 rotate-45 bg-red-500" />
                <View className="absolute h-0.5 w-6 -rotate-45 bg-red-500" />
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
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              },
              keepOverlayStyle,
            ]}>
            <View className="rounded-full bg-white p-4">
              <View className="h-8 w-8 items-center justify-center">
                <View className="-mt-1 h-4 w-2 rotate-45 border-b-2 border-r-2 border-green-500" />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};
