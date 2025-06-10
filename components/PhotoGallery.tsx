import React, { useState, useEffect } from 'react';
import { View, Alert, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SwipeDeck, SwipeDeckItem } from './SwipeDeck';
import { fetchPhotoAssetsWithPagination } from '~/lib/mediaLibrary';
import { Text } from '~/components/nativewindui/Text';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { Button } from '~/components/nativewindui/Button';
import { cn } from '~/lib/cn';
import { useRecycleBinStore, DeletedPhoto } from '~/store/store';
import { MotivationBanner } from './MotivationBanner';

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
  const [prefetchedPhotos, setPrefetchedPhotos] = useState<SwipeDeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keptPhotos, setKeptPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [sessionStartXp, setSessionStartXp] = useState(0);
  const [sessionDeletedStart, setSessionDeletedStart] = useState(0);
  // Keep a ref to the cursor so callbacks always access the latest value
  const nextCursorRef = React.useRef<string | undefined>(undefined);
  const prefetchCursorRef = React.useRef<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [confettiKey, setConfettiKey] = useState(0);

  // Use RecycleBin store
  const {
    deletedPhotos,
    totalDeleted,
    addDeletedPhoto,
    xp,
    resetGallery: resetRecycleBinStore,
    isXpLoaded,
  } = useRecycleBinStore();

  const loadPhotos = React.useCallback(async (cursor?: string): Promise<boolean> => {
    try {
      if (!isMounted.current) return false;
      setLoading(true);

      // Capture session start stats only when loading from the beginning
      if (!(cursor ?? nextCursorRef.current)) {
        const { xp: currentXp, deletedPhotos: currentDeleted } = useRecycleBinStore.getState();
        setSessionStartXp(currentXp);
        setSessionDeletedStart(currentDeleted.length);
      }

      const result = await fetchPhotoAssetsWithPagination(cursor ?? nextCursorRef.current, 50);
      const photoItems: SwipeDeckItem[] = result.assets.map((asset) => ({
        id: asset.id,
        imageUri: asset.uri,
      }));
      nextCursorRef.current = result.endCursor;
      setHasMore(result.hasNextPage);

      if (!isMounted.current) return false;
      setPhotos(photoItems);
      setKeptPhotos([]); // reset kept list for the new session
      // Start swiping from the beginning whenever a new set is loaded
      setCurrentPhotoIndex(0);

      // Prefetch the following batch in the background
      if (result.hasNextPage) {
        fetchPhotoAssetsWithPagination(result.endCursor, 50)
          .then((nextResult) => {
            if (!isMounted.current) return;
            setPrefetchedPhotos(
              nextResult.assets.map((asset) => ({ id: asset.id, imageUri: asset.uri }))
            );
            prefetchCursorRef.current = nextResult.endCursor;
          })
          .catch((err) => {
            console.error('Failed to prefetch photos:', err);
          });
      } else {
        setPrefetchedPhotos([]);
        prefetchCursorRef.current = undefined;
      }
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
    // Intentionally omit loadPhotos from deps to avoid reloading when the cursor changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXpLoaded]);

  const handleSwipeLeft = (item: SwipeDeckItem, index: number) => {
    // Add photo to RecycleBin store
    const deletedPhoto: DeletedPhoto = {
      id: item.id,
      imageUri: item.imageUri,
      deletedAt: new Date(),
      originalIndex: currentPhotoIndex + index,
    };

    const prevState = useRecycleBinStore.getState();
    const prevXp = prevState.xp;
    const prevTotal = prevState.totalDeleted;

    addDeletedPhoto(deletedPhoto);

    const { xp: newXp, totalDeleted: newTotal } = useRecycleBinStore.getState();
    const prevLevel = Math.floor(prevXp / 100) + 1;
    const newLevel = Math.floor(newXp / 100) + 1;

    if (newLevel > prevLevel || newTotal % 50 === 0) {
      setConfettiKey((k) => k + 1);
    }

    // Update current photo index for tracking progress
    setCurrentPhotoIndex((prev) => prev + 1);

    // Deletion from the device now happens when the recycle bin is cleared
    // or a photo is permanently deleted from within the recycle bin screen.
  };

  const handleSwipeRight = (item: SwipeDeckItem, index: number) => {
    setKeptPhotos((prev) => [...prev, item.imageUri]);

    // Update current photo index for tracking progress
    setCurrentPhotoIndex((prev) => prev + 1);
  };

  const handleDeckEmpty = () => {
    const deletedThisSession = deletedPhotos.length - sessionDeletedStart;
    const totalXpEarned = xp - sessionStartXp;
    const totalDeletedCount = totalDeleted;
    if (hasMore) {
      // If a prefetched batch exists use it to avoid a loading pause
      if (prefetchedPhotos.length > 0) {
        setPhotos(prefetchedPhotos);
        setPrefetchedPhotos([]);
        setKeptPhotos([]);
        setCurrentPhotoIndex(0);
        nextCursorRef.current = prefetchCursorRef.current;
        // Prefetch the subsequent batch
        if (nextCursorRef.current) {
          fetchPhotoAssetsWithPagination(nextCursorRef.current, 50)
            .then((nextResult) => {
              if (!isMounted.current) return;
              setPrefetchedPhotos(
                nextResult.assets.map((asset) => ({ id: asset.id, imageUri: asset.uri }))
              );
              prefetchCursorRef.current = nextResult.endCursor;
              setHasMore(nextResult.hasNextPage);
            })
            .catch((err) => {
              console.error('Failed to prefetch photos:', err);
            });
        } else {
          setHasMore(false);
        }
        Alert.alert(
          'More Photos Loaded!',
          `Deleted: ${deletedThisSession} (this session)\nKept: ${keptPhotos.length}\nTotal Deleted: ${totalDeletedCount}\n\n⭐ Current XP: ${xp}\n🎉 XP earned this session: +${totalXpEarned}`
        );
      } else {
        loadPhotos().then(() => {
          Alert.alert(
            'More Photos Loaded!',
            `Deleted: ${deletedThisSession} (this session)\nKept: ${keptPhotos.length}\nTotal Deleted: ${totalDeletedCount}\n\n⭐ Current XP: ${xp}\n🎉 XP earned this session: +${totalXpEarned}`
          );
        });
      }
    } else {
      Alert.alert(
        'No More Photos',
        `You've reached the end of your gallery.\n\nDeleted: ${deletedThisSession} (this session)\nKept: ${keptPhotos.length}\nTotal Deleted: ${totalDeletedCount}\n\n⭐ Current XP: ${xp}\n🎉 XP earned this session: +${totalXpEarned}`,
        [{ text: 'OK', style: 'default' }]
      );
    }
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
              setConfettiKey(0);
              setPhotos([]);
              setCurrentPhotoIndex(0);
              setSessionStartXp(0);
              setSessionDeletedStart(0);
              nextCursorRef.current = undefined;
              prefetchCursorRef.current = undefined;
              setPrefetchedPhotos([]);
              setHasMore(true);

              // Reload photos from the start and wait until done
              const loaded = await loadPhotos(undefined);

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
        <Button onPress={() => loadPhotos()}>
          <Text>Try Again</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className={cn('flex-1 items-center justify-center', className)}>
      <MotivationBanner />
      {/* Stats */}
      <View className="mb-6 flex-row space-x-6">
        <View className="items-center">
          <Text variant="title2" className="text-red-600">
            {deletedPhotos.length}
          </Text>
          <Text variant="caption1" color="secondary">
            In Bin
          </Text>
        </View>
        <View className="items-center">
          <Text variant="title2" className="text-green-600">
            {keptPhotos.length}
          </Text>
          <Text variant="caption1" color="secondary">
            Kept
          </Text>
        </View>
        <View className="items-center">
          <Text variant="title2" className="text-yellow-600">
            {totalDeleted}
          </Text>
          <Text variant="caption1" color="secondary">
            All-Time Deleted
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

      {/* Confetti burst when deleting */}
      {confettiKey > 0 && (
        <ConfettiCannon
          key={confettiKey}
          count={30}
          fadeOut
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
        />
      )}

      {/* Reset Button */}
      <View className="mt-6">
        <Button variant="primary" onPress={resetGallery} className="bg-red-500">
          <Text className="text-white">Reset Gallery & XP</Text>
        </Button>
      </View>
    </View>
  );
};
