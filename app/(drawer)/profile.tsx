import { Stack, useRouter } from 'expo-router';
import { View, ScrollView } from 'react-native';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { Avatar, AvatarFallback } from '~/components/nativewindui/Avatar';
import { Button } from '~/components/nativewindui/Button';
import { Toggle } from '~/components/nativewindui/Toggle';
import { useRecycleBinStore } from '~/store/store';
import { AudioSettingsSection } from '~/components/AudioSettingsSection';
import { AudioTestSection } from '~/components/AudioTestSection';

export default function Profile() {
  const { resetOnboarding } = useRecycleBinStore();
  const router = useRouter();
  const handleResetOnboarding = async () => {
    await resetOnboarding();
    console.log('Resetting onboarding...');
    // Navigate back to onboarding screen
    router.replace('/onboarding');
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <Container>
        <ScrollView className="flex-1">
          <View className="flex-1 py-6">
            <View className="mb-8 items-center">
              <Avatar alt="User Profile" className="mb-4 h-24 w-24">
                <AvatarFallback>
                  <Text variant="title1">U</Text>
                </AvatarFallback>
              </Avatar>
              <Text variant="title2" className="mb-2">
                User
              </Text>
              <Text color="secondary" variant="subhead">
                Decluttr Pro User
              </Text>
            </View>
            <View className="mb-6 px-4">
              <View className="mb-4 flex-row justify-between">
                <View className="mr-2 flex-1 rounded-xl border border-border bg-card p-4">
                  <Text variant="title3" className="mb-1 text-center">
                    0
                  </Text>
                  <Text color="secondary" variant="caption1" className="text-center">
                    Photos Cleaned
                  </Text>
                </View>
                <View className="ml-2 flex-1 rounded-xl border border-border bg-card p-4">
                  <Text variant="title3" className="mb-1 text-center">
                    0 MB
                  </Text>
                  <Text color="secondary" variant="caption1" className="text-center">
                    Storage Saved
                  </Text>
                </View>
              </View>
            </View>
            <View className="px-4">
              <Text variant="heading" className="mb-4">
                Settings
              </Text>

              <View className="overflow-hidden rounded-xl border border-border bg-card">
                <View className="flex-row items-center justify-between border-b border-border p-4">
                  <View>
                    <Text variant="body">Auto-backup</Text>
                    <Text color="secondary" variant="caption1">
                      Automatically backup photos before deletion
                    </Text>
                  </View>
                  <Toggle />
                </View>

                <View className="flex-row items-center justify-between border-b border-border p-4">
                  <View>
                    <Text variant="body">Confirmation dialogs</Text>
                    <Text color="secondary" variant="caption1">
                      Ask before permanently deleting photos
                    </Text>
                  </View>
                  <Toggle value={true} />
                </View>

                <View className="flex-row items-center justify-between p-4">
                  <View>
                    <Text variant="body">Analytics</Text>
                    <Text color="secondary" variant="caption1">
                      Help improve the app by sharing usage data
                    </Text>
                  </View>
                  <Toggle />
                </View>
              </View>
              <View className="mt-6">
                <Button variant="secondary" className="mb-3" onPress={handleResetOnboarding}>
                  <Text>Reset Onboarding</Text>
                </Button>
                <Button variant="secondary">
                  <Text>Sign Out</Text>
                </Button>
              </View>

              {/* Audio Settings Section */}
              <View className="mt-6">
                <AudioSettingsSection />
              </View>

              {/* Audio Test Section */}
              <View className="mt-6">
                <AudioTestSection />
              </View>
            </View>
            <AudioSettingsSection />
            <AudioTestSection />
          </View>
        </ScrollView>
      </Container>
    </>
  );
}
