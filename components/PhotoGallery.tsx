import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { SwipeDeck, SwipeDeckItem } from './SwipeDeck';
import { fetchPhotoAssets } from '~/lib/mediaLibrary';
import { Text } from '~/components/nativewindui/Text';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { Button } from '~/components/nativewindui/Button';
import { cn } from '~/lib/cn';
import { useRecycleBinStore, DeletedPhoto } from '~/store/store';

interface PhotoGalleryProps {
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ className }) => {
  const isMounted = React.useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [photos, setPhotos] = useState<SwipeDeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keptPhotos, setKeptPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [sessionStartXp, setSessionStartXp] = useState(0);
  const [sessionDeletedStart, setSessionDeletedStart] = useState(0);

  // Use RecycleBin store
  const {
    deletedPhotos,
    addDeletedPhoto,
    xp,
    resetGallery: resetRecycleBinStore,
    isXpLoaded,
  } = useRecycleBinStore();

  const loadPhotos = React.useCallback(async (): Promise<boolean> => {
    try {
      if (!isMounted.current) return false;
      setLoading(true);
      // Capture current XP and deleted count when a new session begins
      const { xp: currentXp, deletedPhotos: currentDeleted } = useRecycleBinStore.getState();
      setSessionStartXp(currentXp);
      setSessionDeletedStart(currentDeleted.length);

      const photoUris = await fetchPhotoAssets(50); // Load first 50 photos
      const photoItems: SwipeDeckItem[] = photoUris.map((uri) => ({
        // Use the uri itself as a stable id so deleted photos aren't blocked
        // by duplicate IDs when a new session begins
        id: uri,
        imageUri: uri,
      }));

      if (!isMounted.current) return false;
      setPhotos(photoItems);
      setKeptPhotos([]); // reset kept list for the new session
      // Start swiping from the beginning whenever a new set is loaded
      setCurrentPhotoIndex(0);
      return true;
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos from your gallery');
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isXpLoaded) {
      loadPhotos();
    }
  }, [isXpLoaded, loadPhotos]);

  const handleSwipeLeft = (item: SwipeDeckItem, index: number) => {
    // Add photo to RecycleBin store
    const deletedPhoto: DeletedPhoto = {
      id: item.id,
      imageUri: item.imageUri,
      deletedAt: new Date(),
      originalIndex: currentPhotoIndex + index,
    };

    addDeletedPhoto(deletedPhoto);

    // Update current photo index for tracking progress
    setCurrentPhotoIndex((prev) => prev + 1);

    // Here you could implement actual photo deletion logic
    // For example, using MediaLibrary.deleteAssetsAsync()
  };

  const handleSwipeRight = (item: SwipeDeckItem, index: number) => {
    setKeptPhotos((prev) => [...prev, item.imageUri]);

    // Update current photo index for tracking progress
    setCurrentPhotoIndex((prev) => prev + 1);
  };

  const handleDeckEmpty = () => {
    const deletedThisSession = deletedPhotos.length - sessionDeletedStart;
    const totalXpEarned = xp - sessionStartXp;
    Alert.alert(
      'All Photos Reviewed!',
      `You've reviewed all photos.\n\nDeleted: ${deletedThisSession}\nKept: ${keptPhotos.length}\n\n⭐ Current XP: ${xp}\n🎉 XP earned this session: +${totalXpEarned}`,
      [
        {
          text: 'Load More',
          onPress: loadPhotos,
        },
        {
          text: 'Done',
          style: 'cancel',
        },
      ]
    );
  };

  const resetGallery = async () => {
    // First, confirm the action with the user
    Alert.alert(
      'Reset Gallery',
      'This will reset your gallery progress, clear all deleted photos, and reset your XP to 0. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset the RecycleBin store (clears deletedPhotos and resets XP)
              await resetRecycleBinStore();

              // Reset local component state
              setKeptPhotos([]);
              setCurrentPhotoIndex(0);

              // Reload photos and wait until done
              const loaded = await loadPhotos();

              if (loaded) {
                // Notify the user only if photos reloaded successfully
                Alert.alert('Gallery Reset', 'Your gallery has been reset successfully.');
              }
            } catch (error) {
              console.error('Failed to reset gallery:', error);
              Alert.alert('Error', 'Failed to reset gallery. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className={cn('flex-1 items-center justify-center', className)}>
        <ActivityIndicator size="large" />
        <Text className="mt-4" color="secondary">
          Loading your photos...
        </Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className={cn('flex-1 items-center justify-center px-8', className)}>
        <Text variant="title3" className="mb-4 text-center">
          No Photos Found
        </Text>
        <Text color="secondary" className="mb-6 text-center">
          Make sure you have photos in your gallery and have granted permission.
        </Text>
        <Button onPress={loadPhotos}>
          <Text>Try Again</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className={cn('flex-1 items-center justify-center', className)}>
      {/* Stats */}
      <View className="mb-6 flex-row space-x-6">
        <View className="items-center">
          <Text variant="title2" className="text-green-600">
            {keptPhotos.length}
          </Text>
          <Text variant="caption1" color="secondary">
            Kept
          </Text>
        </View>
        <View className="items-center">
          <Text variant="title2" className="text-red-600">
            {deletedPhotos.length}
          </Text>
          <Text variant="caption1" color="secondary">
            Deleted
          </Text>
        </View>
      </View>

      {/* Swipe Instructions */}
      <View className="mb-6 px-8">
        <Text variant="subhead" color="secondary" className="text-center">
          Swipe left to delete • Swipe right to keep
        </Text>
      </View>

      {/* Swipe Deck */}
      <SwipeDeck
        data={photos}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onDeckEmpty={handleDeckEmpty}
        maxVisibleCards={3}
        cardSpacing={12}
      />

      {/* Reset Button */}
      <View className="mt-6">
        <Button variant="primary" onPress={resetGallery} className="bg-red-500">
          <Text className="text-white">Reset Gallery & XP</Text>
        </Button>
      </View>
    </View>
  );
};
