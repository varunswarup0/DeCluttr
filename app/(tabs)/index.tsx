import { Stack } from 'expo-router';

import { Screen } from '~/components/Screen';
import { PhotoGallery } from '~/components/PhotoGallery';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Screen>
        <PhotoGallery />
      </Screen>
    </>
  );
}
