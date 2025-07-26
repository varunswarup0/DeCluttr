import { Stack, useLocalSearchParams } from 'expo-router';
import { Screen } from '~/components/Screen';
import { PhotoGallery } from '~/components/PhotoGallery';
import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteAllAssetsFromAlbum } from '~/lib/mediaLibrary';

export default function AlbumGallery() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const albumName = Array.isArray(name) ? name[0] : name;
  const handleDeleteAll = () => {
    Alert.alert('Delete All', `Remove all items in ${albumName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteAllAssetsFromAlbum(albumName);
          if (success) {
            Alert.alert('Deleted', 'Album cleared.');
          } else {
            Alert.alert('Error', 'Failed to delete album.');
          }
        },
      },
    ]);
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: albumName,
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteAll} className="mr-2">
              <Ionicons name="trash" size={20} color="rgb(255,82,82)" />
            </TouchableOpacity>
          ),
        }}
      />
      <Screen>
        <PhotoGallery albumName={albumName} />
      </Screen>
    </>
  );
}
