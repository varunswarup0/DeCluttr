import { Stack } from 'expo-router';
import { Container } from '~/components/Container';
import { PhotoGallery } from '~/components/PhotoGallery';

export default function WhatsAppPhotos() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Container>
        <PhotoGallery albumName="WhatsApp Images" />
      </Container>
    </>
  );
}
