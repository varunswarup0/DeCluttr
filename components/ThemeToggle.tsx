import { Icon } from '@roninoss/icons';
import { Pressable, View } from 'react-native';
import Animated, {
  LayoutAnimationConfig,
  ZoomInRotate,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSwipeAudio } from '~/lib/useSwipeAudio';

import { cn } from '~/lib/cn';
import { useColorScheme } from '~/lib/useColorScheme';
import { COLORS } from '~/theme/colors';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { playTapSound } = useSwipeAudio();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View
        className="items-center justify-center"
        key={`toggle-${colorScheme}`}
        entering={ZoomInRotate}>
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={() => {
              playTapSound();
              toggleColorScheme();
            }}
            onPressIn={() => {
              scale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              scale.value = withSpring(1);
            }}
            className="opacity-80">
            {colorScheme === 'dark'
              ? ({ pressed }) => (
                  <View className={cn('px-0.5', pressed && 'opacity-50')}>
                    <Icon namingScheme="sfSymbol" name="moon.stars" color={COLORS.white} />
                  </View>
                )
              : ({ pressed }) => (
                  <View className={cn('px-0.5', pressed && 'opacity-50')}>
                    <Icon namingScheme="sfSymbol" name="sun.min" color={COLORS.black} />
                  </View>
                )}
          </Pressable>
        </Animated.View>
      </Animated.View>
    </LayoutAnimationConfig>
  );
}
