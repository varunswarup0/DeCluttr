import { Stack } from 'expo-router';
import { View, ScrollView, Image, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRecycleBinStore, DeletedPhoto, XP_CONFIG } from '~/store/store';

const { width: screenWidth } = Dimensions.get('window');
const GRID_SPACING = 12;
const ITEMS_PER_ROW = 2;
const ITEM_WIDTH = (screenWidth - GRID_SPACING * (ITEMS_PER_ROW + 1) - 40) / ITEMS_PER_ROW;

interface RecycleBinItemProps {
  photo: DeletedPhoto;
  onRestore: () => void;
  onPermanentDelete: () => void;
}

const RecycleBinItem: React.FC<RecycleBinItemProps> = ({ photo, onRestore, onPermanentDelete }) => {
  const [imageError, setImageError] = useState(false);

  const handlePermanentDelete = () => {
    Alert.alert('Permanently Delete', 'Remove this photo forever?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onPermanentDelete },
    ]);
  };

  return (
    <View
      className="overflow-hidden rounded-xl border border-border bg-card"
      style={{ width: ITEM_WIDTH }}>
      {/* Photo Preview */}
      <View className="relative">
        {!imageError ? (
          <Image
            source={{ uri: photo.imageUri }}
            className="w-full bg-gray-200"
            style={{ height: ITEM_WIDTH }}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View
            className="w-full items-center justify-center bg-gray-200"
            style={{ height: ITEM_WIDTH }}>
            <Text color="secondary" variant="caption1">
              📷
            </Text>
            <Text color="secondary" variant="caption2">
              Image not available
            </Text>
          </View>
        )}

        {/* Deleted badge
        <View className="absolute top-2 right-2 bg-red-500 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-medium">Deleted</Text>
        </View> */}
      </View>

      {/* Photo Info */}
      <View className="absolute bottom-0 left-0 right-0 rounded-b-md border-t border-border bg-white p-2 dark:bg-gray-800">
        {/* <Text variant="caption1" color="secondary" className="mb-2">
          Deleted {format(photo.deletedAt, 'MMM d, h:mm a')}
        </Text> */}

        {/* Action Buttons */}
        <View className="flex-row justify-between gap-2">
          <Button variant="primary" size="sm" className="flex-1 bg-blue-500" onPress={onRestore}>
            <MaterialCommunityIcons name="restore" size={20} color="white" />
            <Text variant="caption1" className="sr-only">
              Restore
            </Text>
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="flex-1 bg-red-500"
            onPress={handlePermanentDelete}>
            <MaterialCommunityIcons name="delete" size={20} color="white" />
            <Text variant="caption1" className="sr-only">
              Delete
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default function RecycleBin() {
  const {
    deletedPhotos,
    restorePhoto,
    permanentlyDelete,
    clearRecycleBin,
    purgeExpiredPhotos,
    totalDeleted,
  } = useRecycleBinStore();

  useEffect(() => {
    purgeExpiredPhotos();
  }, [purgeExpiredPhotos]);

  const handleRestore = (photoId: string) => {
    const restoredPhoto = restorePhoto(photoId);
    if (restoredPhoto) {
      Alert.alert(
        'Photo Restored',
        `The photo has been restored successfully.\n\n🔄 -${Math.abs(XP_CONFIG.RESTORE_PHOTO)} XP`
      );
    }
  };

  const handlePermanentDelete = async (photoId: string) => {
    const success = await permanentlyDelete(photoId);
    if (success) {
      Alert.alert(
        'Photo Deleted',
        `The photo has been permanently deleted.\n\n⭐ +${XP_CONFIG.PERMANENT_DELETE} XP`
      );
    } else {
      Alert.alert('Error', 'Failed to delete photo. Please try again.');
    }
  };

  const handleClearAll = () => {
    if (deletedPhotos.length === 0) return;

    Alert.alert('Clear Recycle Bin', `Delete all ${deletedPhotos.length} photos forever?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          const photosCount = deletedPhotos.length;
          const success = await clearRecycleBin();
          if (success) {
            Alert.alert('Recycle Bin Cleared', `Gone! ⭐ +${XP_CONFIG.CLEAR_ALL * photosCount} XP`);
          } else {
            Alert.alert('Error', 'Failed to clear recycle bin.');
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Recycle Bin',
          headerRight:
            deletedPhotos.length > 0
              ? () => (
                  <TouchableOpacity onPress={handleClearAll}>
                    <Text className="font-medium text-red-600">Clear All</Text>
                  </TouchableOpacity>
                )
              : undefined,
        }}
      />
      <Container>
        {deletedPhotos.length === 0 ? (
          /* Empty State */
          <View className="flex-1 items-center justify-center px-8">
            <View className="mb-8 items-center">
              <Text className="mb-4 text-6xl">🗑️</Text>
              <Text variant="title2" className="mb-2">
                All Clear
              </Text>
              <Text color="secondary" className="text-center">
                Nothing in the bin
              </Text>
            </View>
          </View>
        ) : (
          /* Photos Grid */
          <View className="flex-1">
            {/* Header */}
            <View className="border-b border-border px-4 py-4">
              <Text variant="title3" className="mb-1">
                Deleted Photos
              </Text>
              <Text color="secondary" variant="caption1">
                {deletedPhotos.length} photo{deletedPhotos.length !== 1 ? 's' : ''} in recycle bin
              </Text>
            </View>

            {/* Photos Grid */}
            <ScrollView
              className="flex-1 p-2"
              contentContainerStyle={{
                // padding: GRID_SPACING,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between" style={{ gap: GRID_SPACING }}>
                {deletedPhotos.map((photo) => (
                  <RecycleBinItem
                    key={photo.id}
                    photo={photo}
                    onRestore={() => handleRestore(photo.id)}
                    onPermanentDelete={() => handlePermanentDelete(photo.id)}
                  />
                ))}
              </View>
            </ScrollView>

          </View>
        )}
      </Container>
    </>
  );
}
