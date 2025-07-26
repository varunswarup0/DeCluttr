import { Stack } from 'expo-router';
import { Screen } from '~/components/Screen';
import { PhotoGallery } from '~/components/PhotoGallery';

export default function Videos() {
  return (
    <>
      <Stack.Screen options={{ title: 'Videos' }} />
      <Screen>
        <PhotoGallery mediaType="video" />
      </Screen>
    </>
  );
}
