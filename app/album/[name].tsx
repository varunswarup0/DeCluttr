import { Stack, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { PhotoGallery } from '~/components/PhotoGallery';

export default function AlbumGallery() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const albumName = Array.isArray(name) ? name[0] : name;
  return (
    <>
      <Stack.Screen options={{ title: albumName }} />
      <Container>
        <PhotoGallery albumName={albumName} />
      </Container>
    </>
  );
}
