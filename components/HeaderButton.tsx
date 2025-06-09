import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSwipeAudio } from '~/lib/useSwipeAudio';

export const HeaderButton = forwardRef<typeof Pressable, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    const { playTapSound } = useSwipeAudio();
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
      <Animated.View style={[styles.headerRight, animatedStyle]}>
        <Pressable
          onPress={(e) => {
            playTapSound();
            onPress?.();
          }}
          onPressIn={() => {
            scale.value = withSpring(0.9);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}>
          <FontAwesome name="info-circle" size={25} color="gray" />
        </Pressable>
      </Animated.View>
    );
  }
);

HeaderButton.displayName = 'HeaderButton';

export const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
});
