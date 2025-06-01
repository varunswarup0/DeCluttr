import { Stack } from 'expo-router';
import { View } from 'react-native';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';

export default function Tree() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tree' }} />
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text variant="title2" className="mb-4">
            🌳 Your Impact Tree
          </Text>
          <Text color="secondary" className="mb-6 px-8 text-center">
            See how decluttering your photos helps the environment by reducing storage usage and
            energy consumption.
          </Text>

          <View className="mx-4 rounded-xl bg-green-50 p-6 dark:bg-green-950">
            <View className="items-center">
              <Text variant="title3" className="mb-2 text-green-700 dark:text-green-300">
                Photos Cleaned
              </Text>
              <Text variant="largeTitle" className="mb-4 text-green-600 dark:text-green-400">
                0
              </Text>
              <Text variant="caption1" color="secondary" className="text-center">
                Every deleted photo saves storage space and reduces energy consumption!
              </Text>
            </View>
          </View>
        </View>
      </Container>
    </>
  );
}
