import { Stack } from 'expo-router';
import { View, ScrollView } from 'react-native';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';

export default function Gallery() {
  return (
    <>
      <Stack.Screen options={{ title: 'Gallery' }} />
      <Container>
        <ScrollView className="flex-1">
          <View className="flex-1 items-center justify-center py-8">
            <Text variant="title2" className="mb-4">
              📸 Gallery
            </Text>
            <Text color="secondary" className="mb-8 px-8 text-center">
              Browse and manage your photo collections. View kept photos and organize them by
              albums.
            </Text>

            <View className="w-full px-4">
              <View className="mb-4 rounded-xl border border-border bg-card p-6">
                <Text variant="heading" className="mb-2">
                  📱 Recent Photos
                </Text>
                <Text color="secondary" variant="subhead">
                  Photos from the last 7 days
                </Text>
              </View>

              <View className="mb-4 rounded-xl border border-border bg-card p-6">
                <Text variant="heading" className="mb-2">
                  ⭐ Favorites
                </Text>
                <Text color="secondary" variant="subhead">
                  Your marked favorite photos
                </Text>
              </View>

              <View className="mb-4 rounded-xl border border-border bg-card p-6">
                <Text variant="heading" className="mb-2">
                  📁 Albums
                </Text>
                <Text color="secondary" variant="subhead">
                  Organized photo collections
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Container>
    </>
  );
}
