import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { Toggle } from '~/components/nativewindui/Toggle';
import { Slider } from '~/components/nativewindui/Slider';
import { useAudioSettings } from '~/lib/useAudioSettings';

export const AudioSettingsSection: React.FC = () => {
  const { settings, isLoaded, toggleAudio, setVolume } = useAudioSettings();

  if (!isLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="title3" style={styles.sectionTitle}>
        🔊 Audio Settings
      </Text>

      {/* Audio Toggle */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text variant="body">Sound Effects</Text>
          <Text variant="caption1" color="secondary">
            Play sounds when swiping photos
          </Text>
        </View>
        <Toggle value={settings.enabled} onValueChange={toggleAudio} />
      </View>

      {/* Volume Slider */}
      {settings.enabled && (
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text variant="body">Volume</Text>
            <Text variant="caption1" color="secondary">
              {Math.round(settings.volume * 100)}%
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              value={settings.volume}
              onValueChange={(value) => setVolume(Array.isArray(value) ? value[0] : value)}
              minimumValue={0}
              maximumValue={1}
              step={0.1}
            />
          </View>
        </View>
      )}

      {/* Audio Info */}
      <View style={styles.infoBox}>
        <Text variant="caption1" color="secondary" style={styles.infoText}>
          Sound effects enhance the decluttering experience with audio feedback for swipe actions.
          Disable if you prefer a silent experience.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  sliderContainer: {
    width: 120,
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    lineHeight: 18,
  },
});
