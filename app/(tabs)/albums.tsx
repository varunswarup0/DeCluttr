import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { fetchAlbums, MediaAlbum } from '~/lib/mediaLibrary';

export default function Albums() {
  const [albums, setAlbums] = useState<MediaAlbum[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchAlbums()
      .then(setAlbums)
      .catch((err) => {
        console.error('Failed to load albums', err);
        Alert.alert('Error', 'Failed to load albums.');
      });
  }, []);

  const handleSelect = (album: MediaAlbum) => {
    router.push({ pathname: '/album/[name]', params: { name: album.title } });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Albums' }} />
      <Container>
        <ScrollView className="flex-1 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              onPress={() => handleSelect(album)}
              className="mb-4 rounded-md border border-border p-4">
              <Text>{album.title}</Text>
            </TouchableOpacity>
          ))}
          {albums.length === 0 && (
            <View className="flex-1 items-center justify-center">
              <Text color="secondary">No albums found</Text>
            </View>
          )}
        </ScrollView>
      </Container>
    </>
  );
}
