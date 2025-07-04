import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { PhotoGallery } from '~/components/PhotoGallery';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Container>
        <PhotoGallery />
      </Container>
    </>
  );
}
