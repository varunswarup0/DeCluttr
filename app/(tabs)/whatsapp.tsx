import { Stack } from 'expo-router';
import { Screen } from '~/components/Screen';
import { PhotoGallery } from '~/components/PhotoGallery';

export default function WhatsAppPhotos() {
  return (
    <>
      <Stack.Screen options={{ title: 'WhatsApp' }} />
      <Screen>
        <PhotoGallery albumName="WhatsApp Images" />
      </Screen>
    </>
  );
}
