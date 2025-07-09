import React, { useState, useEffect } from 'react';
import { View, Alert, Dimensions, Pressable } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { CONFETTI_COLORS } from '~/theme/colors';
import { SwipeDeck, SwipeDeckItem } from './SwipeDeck';
// Toast and achievement overlays removed for a cleaner interface
import { ComboOverlay } from './ComboOverlay';
import { SwipeFlash } from './SwipeFlash';
import { PixelBurst } from './PixelBurst';
import { SwipeHint } from './SwipeHint';
import { RetroStart } from './RetroStart';
import { BackgroundOptimizer } from './BackgroundOptimizer';
import { fetchPhotoAssetsWithPagination } from '~/lib/mediaLibrary';
import { Text } from '~/components/nativewindui/Text';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { Button } from '~/components/nativewindui/Button';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '~/lib/cn';
import { px } from '~/lib/pixelPerfect';
import { useRecycleBinStore, DeletedPhoto } from '~/store/store';
import {
  SESSION_MESSAGES,
  END_MESSAGES,
  SURPRISE_MESSAGES,
  createMessagePicker,
} from '~/lib/positiveMessages';
import { audioService } from '~/lib/audioService';

const pickSessionMessage = createMessagePicker(SESSION_MESSAGES);
const pickEndMessage = createMessagePicker(END_MESSAGES);

interface PhotoGalleryProps {
  className?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ className }) => {
  const isMounted = React.useRef(true);

  // Use RecycleBin store
  const {
    deletedPhotos,
    addDeletedPhoto,
    resetGallery: resetRecycleBinStore,
    isXpLoaded,
    loadZenMode,
  } = useRecycleBinStore();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    loadZenMode();
  }, [loadZenMode]);

  const [photos, setPhotos] = useState<SwipeDeckItem[]>([]);
  const [prefetchedPhotos, setPrefetchedPhotos] = useState<SwipeDeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keptPhotos, setKeptPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  // Keep a ref to the cursor so callbacks always access the latest value
  const nextCursorRef = React.useRef<string | undefined>(undefined);
  const prefetchCursorRef = React.useRef<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [confettiKey, setConfettiKey] = useState(0);
  const [swipeFlash, setSwipeFlash] = useState<string | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [showStart, setShowStart] = useState(false);
  const [combo, setCombo] = useState<number | null>(null);
  const [burstColor, setBurstColor] = useState<string | null>(null);
  const startShownRef = React.useRef(false);
  const tapTimesRef = React.useRef<number[]>([]);
  // Track total deletes this session for surprise messages
  const deleteCountRef = React.useRef(0);
  const consecutiveDeleteRef = React.useRef(0);
  const STREAK_THRESHOLD = 10;

  useEffect(() => {
    const timeout = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (photos.length > 0 && !startShownRef.current) {
      setShowStart(true);
      startShownRef.current = true;
    }
  }, [photos.length]);

  const loadPhotos = React.useCallback(async (cursor?: string): Promise<boolean> => {
    try {
      if (!isMounted.current) return false;
      setLoading(true);


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
    // Swipe event - user wants to delete the current photo
    // Add photo to RecycleBin store and assign XP
    const deletedPhoto: DeletedPhoto = {
      id: item.id,
      imageUri: item.imageUri,
      deletedAt: new Date(),
      originalIndex: currentPhotoIndex + index,
    };

    addDeletedPhoto(deletedPhoto);
    setSwipeFlash('DELETED!');
    setBurstColor('rgb(255,59,48)');
    setShowSwipeHint(false);
    // Play a random voice clip for extra feedback
    audioService.playRandomVoice();
    // Track streaks and total delete count for surprise messages
    deleteCountRef.current += 1;
    consecutiveDeleteRef.current += 1;
    if (consecutiveDeleteRef.current >= 3) {
      setCombo(consecutiveDeleteRef.current);
    }

    // Trigger confetti on long delete streaks
    if (consecutiveDeleteRef.current >= STREAK_THRESHOLD) {
      setConfettiKey((k) => k + 1);
      consecutiveDeleteRef.current = 0;
      setCombo(null);
    }

    // Show surprise message roughly every 5 deletes
    if (deleteCountRef.current % 5 === 0) {
      const msg = SURPRISE_MESSAGES[Math.floor(Math.random() * SURPRISE_MESSAGES.length)];
      Alert.alert(msg);
    }

    // Update current photo index for tracking progress
    setCurrentPhotoIndex((prev) => prev + 1);

    // Deletion from the device now happens when the recycle bin is cleared
    // or a photo is permanently deleted from within the recycle bin screen.
  };

  const handleSwipeRight = (item: SwipeDeckItem, index: number) => {
    // Swipe event - user keeps the current photo
    setKeptPhotos((prev) => [...prev, item.imageUri]);
    setSwipeFlash('KEPT!');
    setBurstColor('rgb(52,199,89)');
    setShowSwipeHint(false);

    // Reset streak when a photo is kept
    consecutiveDeleteRef.current = 0;
    setCombo(null);

    // Update current photo index for tracking progress
    setCurrentPhotoIndex((prev) => prev + 1);
  };

  const handleDeckEmpty = () => {
    setCombo(null);
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
        const msg = pickSessionMessage();
        Alert.alert(msg, 'Keep it up!');
      } else {
        loadPhotos().then(() => {
          const msg = pickSessionMessage();
          Alert.alert(msg, 'Keep it up!');
        });
      }
    } else {
      const endMsg = pickEndMessage();
      Alert.alert(endMsg, 'Gallery clean!', [{ text: 'OK', style: 'default' }]);
    }
  };

  const handleDebugTap = () => {
    setShowSwipeHint(false);
    const now = Date.now();
    tapTimesRef.current = tapTimesRef.current.filter((t) => now - t < 1000);
    tapTimesRef.current.push(now);
    if (tapTimesRef.current.length >= 5) {
      if (photos.length > 0) {
        handleSwipeLeft(photos[0], 0);
      }
      tapTimesRef.current = [];
    }
  };

  const resetGallery = async () => {
    // First, confirm the action with the user
    Alert.alert('Reset Gallery', 'Reset progress and XP? This also clears deleted photos.', [
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
            nextCursorRef.current = undefined;
            prefetchCursorRef.current = undefined;
            setPrefetchedPhotos([]);
            setHasMore(true);
            startShownRef.current = false;
            setShowStart(false);
            setCombo(null);

            // Reload photos from the start and wait until done
            const loaded = await loadPhotos(undefined);

            if (loaded) {
              // Notify the user only if photos reloaded successfully
              Alert.alert('Gallery Reset', 'All set!');
            }
          } catch (error) {
            console.error('Failed to reset gallery:', error);
            Alert.alert('Error', 'Failed to reset gallery. Please try again.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className={cn('flex-1 items-center justify-center', className)}>
        <ActivityIndicator size="large" />
        <Text className="mt-4" color="secondary">
          Loading…
        </Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View className={cn('flex-1 items-center justify-center px-8', className)}>
        <Text variant="title3" className="mb-4 text-center">
          No Photos
        </Text>
        <Text color="secondary" className="mb-6 text-center">
          Check gallery access.
        </Text>
        <Button onPress={() => loadPhotos()}>
          <Text>Try Again</Text>
        </Button>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleDebugTap}
      className={cn('flex-1 items-center justify-center', className)}>
      {showStart && <RetroStart onDone={() => setShowStart(false)} />}

      {/* Swipe Deck */}
      <SwipeDeck
        data={photos}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onDeckEmpty={handleDeckEmpty}
        maxVisibleCards={3}
        cardSpacing={px(12)}
      />

      {showSwipeHint && <SwipeHint onDone={() => setShowSwipeHint(false)} />}


      {swipeFlash && <SwipeFlash label={swipeFlash} onDone={() => setSwipeFlash(null)} />}

      {burstColor && <PixelBurst color={burstColor} onDone={() => setBurstColor(null)} />}

      {/* Confetti burst when deleting */}
      {confettiKey > 0 && (
        <ConfettiCannon
          key={confettiKey}
          count={30}
          fadeOut
          colors={CONFETTI_COLORS}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
        />
      )}

      {combo && <ComboOverlay count={combo} onDone={() => setCombo(null)} />}

      {/* Reset Button */}
      <View className="mt-6">
        <Button variant="primary" size="icon" onPress={resetGallery} className="bg-red-500">
          <Ionicons name="refresh" size={px(18)} color="white" />
          <Text className="sr-only">Reset</Text>
        </Button>
      </View>
      <BackgroundOptimizer />
    </Pressable>
  );
};
