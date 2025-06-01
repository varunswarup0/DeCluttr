import { Stack } from 'expo-router';
import { View, ScrollView } from 'react-native';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { useRecycleBinStore, XP_CONFIG } from '~/store/store';

export default function Stats() {
  const { deletedPhotos, xp } = useRecycleBinStore();

  // Calculate XP level (simple level system)
  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;
  const xpToNextLevel = 100 - xpInCurrentLevel;

  return (
    <>
      <Stack.Screen options={{ title: 'Statistics' }} />
      <Container>
        <ScrollView className="flex-1">
          <View className="flex-1 py-6">
            <View className="mb-8 px-4">
              <Text variant="title2" className="mb-6">
                📊 Your Decluttering Stats
              </Text>

              <View className="mb-4 rounded-xl border border-border bg-card p-6">
                <Text variant="heading" className="mb-4">
                  ⭐ Experience Level
                </Text>
                <View className="mb-4 flex-row items-center justify-between">
                  <View>
                    <Text variant="title1" className="text-yellow-600 dark:text-yellow-400">
                      Level {level}
                    </Text>
                    <Text color="secondary" variant="caption1">
                      {xp} Total XP
                    </Text>
                  </View>
                  <View className="rounded-full bg-yellow-100 px-4 py-2 dark:bg-yellow-900">
                    <Text
                      variant="caption1"
                      className="font-bold text-yellow-700 dark:text-yellow-300">
                      {xpToNextLevel} XP to next level
                    </Text>
                  </View>
                </View>
                <View className="mb-2">
                  <ProgressIndicator value={xpInCurrentLevel / 100} />
                </View>
                <Text color="secondary" variant="caption2" className="text-center">
                  {xpInCurrentLevel}/100 XP in current level
                </Text>
              </View>

              {/* XP Earning Guide */}
              <View className="mb-4 rounded-xl border border-border bg-card p-6">
                <Text variant="heading" className="mb-4">
                  💡 XP Earning Guide
                </Text>
                <View className="space-y-3">
                  <View className="flex-row items-center justify-between">
                    <Text variant="subhead">Delete Photo</Text>
                    <Text variant="subhead" className="text-green-600">
                      +{XP_CONFIG.DELETE_PHOTO} XP
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text variant="subhead">Permanent Delete</Text>
                    <Text variant="subhead" className="text-green-600">
                      +{XP_CONFIG.PERMANENT_DELETE} XP
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text variant="subhead">Clear All (per photo)</Text>
                    <Text variant="subhead" className="text-green-600">
                      +{XP_CONFIG.CLEAR_ALL} XP
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text variant="subhead">Restore Photo</Text>
                    <Text variant="subhead" className="text-red-600">
                      {XP_CONFIG.RESTORE_PHOTO} XP
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mb-4 rounded-xl border border-border bg-card p-6">
                <Text variant="heading" className="mb-4">
                  Today&apos;s Progress
                </Text>
                <View className="mb-4">
                  <View className="mb-2 flex-row justify-between">
                    <Text variant="subhead">Photos Reviewed</Text>
                    <Text variant="subhead">{deletedPhotos.length}/50</Text>
                  </View>
                  <ProgressIndicator value={Math.min(deletedPhotos.length / 50, 1)} />
                </View>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text variant="title3" className="text-green-600">
                      0
                    </Text>
                    <Text color="secondary" variant="caption1">
                      Kept
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text variant="title3" className="text-red-600">
                      {deletedPhotos.length}
                    </Text>
                    <Text color="secondary" variant="caption1">
                      Deleted
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Weekly Stats */}
            <View className="mb-8 px-4">
              <Text variant="heading" className="mb-4">
                This Week
              </Text>

              <View className="mb-4 rounded-xl border border-border bg-card p-6">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text variant="subhead">Storage Cleaned</Text>
                  <Text variant="title3">0 MB</Text>
                </View>
                <View className="mb-4 flex-row items-center justify-between">
                  <Text variant="subhead">Photos Processed</Text>
                  <Text variant="title3">0</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text variant="subhead">Days Active</Text>
                  <Text variant="title3">0/7</Text>
                </View>
              </View>
            </View>

            {/* Environmental Impact */}
            <View className="mb-8 px-4">
              <Text variant="heading" className="mb-4">
                🌱 Environmental Impact
              </Text>

              <View className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
                <View className="mb-4 items-center">
                  <Text variant="title1" className="mb-2 text-green-600 dark:text-green-400">
                    🌳
                  </Text>
                  <Text
                    variant="subhead"
                    className="text-center text-green-700 dark:text-green-300">
                    CO₂ Saved by Reducing Storage
                  </Text>
                </View>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text variant="title3" className="text-green-600 dark:text-green-400">
                      0g
                    </Text>
                    <Text color="secondary" variant="caption1">
                      This Week
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text variant="title3" className="text-green-600 dark:text-green-400">
                      0g
                    </Text>
                    <Text color="secondary" variant="caption1">
                      Total
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Achievements */}
            <View className="px-4">
              <Text variant="heading" className="mb-4">
                🏆 Achievements
              </Text>

              <View className="overflow-hidden rounded-xl border border-border bg-card">
                <View className="border-b border-border p-4 opacity-50">
                  <View className="flex-row items-center">
                    <Text variant="title2" className="mr-3">
                      🏁
                    </Text>
                    <View className="flex-1">
                      <Text variant="subhead">First Steps</Text>
                      <Text color="secondary" variant="caption1">
                        Delete your first photo
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="border-b border-border p-4 opacity-50">
                  <View className="flex-row items-center">
                    <Text variant="title2" className="mr-3">
                      💯
                    </Text>
                    <View className="flex-1">
                      <Text variant="subhead">Century Club</Text>
                      <Text color="secondary" variant="caption1">
                        Process 100 photos
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="p-4 opacity-50">
                  <View className="flex-row items-center">
                    <Text variant="title2" className="mr-3">
                      🌟
                    </Text>
                    <View className="flex-1">
                      <Text variant="subhead">Storage Saver</Text>
                      <Text color="secondary" variant="caption1">
                        Save 1GB of storage space
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </Container>
    </>
  );
}
