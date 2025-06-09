import { Feather } from '@expo/vector-icons';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSwipeAudio } from '~/lib/useSwipeAudio';

export const BackButton = ({ onPress }: { onPress: () => void }) => {
  const { playTapSound } = useSwipeAudio();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.backButton, animatedStyle]}>
      <Pressable
        style={styles.pressable}
        onPress={(e) => {
          playTapSound();
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}>
        <Feather name="chevron-left" size={16} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#5690FF',
    marginLeft: 4,
  },
});
