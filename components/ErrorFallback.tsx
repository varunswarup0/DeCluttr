import { View } from 'react-native';
import { Text } from './nativewindui/Text';
import { Button } from './nativewindui/Button';
import { useRouter } from 'expo-router';

export function ErrorFallback({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text variant="title3" className="mb-2 text-center">
        Something went wrong
      </Text>
      <Text className="mb-4 text-center" color="secondary">
        {error.message}
      </Text>
      <Button onPress={() => router.replace('/')}>
        <Text>Restart</Text>
      </Button>
    </View>
  );
}
