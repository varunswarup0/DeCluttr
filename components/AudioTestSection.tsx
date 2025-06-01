import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '~/components/nativewindui/Button';
import { Text } from '~/components/nativewindui/Text';
import { useSwipeAudio } from '~/lib/useSwipeAudio';

export const AudioTestSection: React.FC = () => {
  const { playDeleteSound, playKeepSound } = useSwipeAudio();

  const handleTestDeleteSound = () => {
    try {
      playDeleteSound();
    } catch (error) {
      console.warn('Failed to play delete sound in test:', error);
    }
  };

  const handleTestKeepSound = () => {
    try {
      playKeepSound();
    } catch (error) {
      console.warn('Failed to play keep sound in test:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="title3" style={styles.title}>
        🎵 Audio Test
      </Text>

      <Text variant="body" color="secondary" style={styles.description}>
        Test the swipe sound effects to ensure they're working properly.
      </Text>

      <View style={styles.buttonContainer}>
        <Button variant="secondary" onPress={handleTestDeleteSound} style={styles.button}>
          <Text>🗑️ Test Delete Sound</Text>
        </Button>

        <Button variant="secondary" onPress={handleTestKeepSound} style={styles.button}>
          <Text>✅ Test Keep Sound</Text>
        </Button>
      </View>

      <View style={styles.noteBox}>
        <Text variant="caption1" color="secondary" style={styles.noteText}>
          💡 If you don't hear sounds, check that:
          {'\n'}• Sound files are placed in assets/sounds/
          {'\n'}• Audio is enabled in settings
          {'\n'}• Device volume is turned up
          {'\n'}• Silent mode is off (iOS)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  noteBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noteText: {
    lineHeight: 18,
  },
});
