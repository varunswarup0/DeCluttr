import React, { useState, useEffect, useMemo } from 'react';
import { View, Alert, Dimensions, Pressable } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import ConfettiCannon from 'react-native-confetti-cannon';
import { CONFETTI_COLORS } from '~/theme/colors';
import { SwipeDeck, SwipeDeckItem, SwipeDeckHandle } from './SwipeDeck';
import { MultiSelectBar } from './MultiSelectBar';
// Toast and achievement overlays removed for a cleaner interface
import { ComboOverlay } from './ComboOverlay';
import { SwipeFlash } from './SwipeFlash';
import { PixelBurst } from './PixelBurst';
import { TurboOverlay } from './TurboOverlay';
import { FlockOverlay } from './FlockOverlay';
import { SwipeHint } from './SwipeHint';
import { RetroStart } from './RetroStart';
import { GlitchOverlay } from './GlitchOverlay';
import { WaveOverlay } from './WaveOverlay';
import { SpeedLinesOverlay } from './SpeedLinesOverlay';
import { BackgroundOptimizer } from './BackgroundOptimizer';
import {
  fetchPhotoAssetsWithPagination,
  fetchVideoAssetsWithPagination,
  fetchAssetsFromAlbumWithPagination,
  fetchAlbums,
  moveAssetToAlbum,
  deletePhotoAsset,
  deletePhotoAssets,
  openPhotoAsset,
  openVideoAsset,
  PhotoAsset,
} from '~/lib/mediaLibrary';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Text } from '~/components/nativewindui/Text';
import { ActivityIndicator } from '~/components/nativewindui/ActivityIndicator';
import { Button } from '~/components/nativewindui/Button';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '~/lib/cn';
import { px } from '~/lib/pixelPerfect';
import { useRecycleBinStore } from '~/store/store';
import { END_MESSAGES, createMessagePicker } from '~/lib/positiveMessages';
import { audioService } from '~/lib/audioService';
import { useShake } from '~/lib/useShake';

const pickEndMessage = createMessagePicker(END_MESSAGES);
const BATCH_SIZE = 20;

interface PhotoGalleryProps {
  className?: string;
  mediaType?: 'photo' | 'video';
  /** Optional album name to limit the gallery */
  albumName?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  className,
  mediaType = 'photo',
  albumName,
}) => {
  const isMounted = React.useRef(true);
  const { showActionSheetWithOptions } = useActionSheet();

  // Use RecycleBin store
  const {
    resetGallery: resetRecycleBinStore,
    loadZenMode,
    loadNavigationMode,
    navigationMode,
    loadDeleteWarningShown,
    setDeleteWarningShown,
    deleteWarningShown,
  } = useRecycleBinStore();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    loadZenMode();
    loadNavigationMode();
    loadDeleteWarningShown();
  }, [loadZenMode, loadNavigationMode, loadDeleteWarningShown]);

  useEffect(() => {
    if (deleteWarningShown === false) {
      Alert.alert(
        'Permanent Deletion',
        'Swiping left removes photos from your device immediately. There is no system trash.',
        [
          {
            text: 'Got it',
            onPress: () => setDeleteWarningShown(true),
          },
        ]
      );
    }
  }, [deleteWarningShown, setDeleteWarningShown]);

  const [photos, setPhotos] = useState<SwipeDeckItem[]>([]);
  const [prefetchedPhotos, setPrefetchedPhotos] = useState<SwipeDeckItem[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [showFlock, setShowFlock] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [showWave, setShowWave] = useState(false);
  const [speedLinesDir, setSpeedLinesDir] = useState<'left' | 'right' | null>(null);
  const startShownRef = React.useRef(false);
  const tapTimesRef = React.useRef<number[]>([]);
  const consecutiveDeleteRef = React.useRef(0);
  const STREAK_THRESHOLD = 10;
  const GLITCH_STREAK = 5;
  const WAVE_STREAK = 7;
  const deckRef = React.useRef<SwipeDeckHandle>(null);
  const turboRef = React.useRef<number | null>(null);
  const [turbo, setTurbo] = useState(false);
  const loadIdRef = React.useRef(0);
  const loadingRef = React.useRef(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchFn = useMemo(() => {
    if (albumName) {
      return (cursor?: string, first: number = 20) =>
        fetchAssetsFromAlbumWithPagination(
          albumName,
          cursor,
          first,
          mediaType === 'video' ? MediaLibrary.MediaType.video : MediaLibrary.MediaType.photo
        );
    }
    return mediaType === 'video' ? fetchVideoAssetsWithPagination : fetchPhotoAssetsWithPagination;
  }, [albumName, mediaType]);

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

  const loadPhotos = React.useCallback(
    async (cursor?: string): Promise<boolean> => {
      if (loadingRef.current) return false;
      loadingRef.current = true;
      const loadId = ++loadIdRef.current;
      try {
        if (!isMounted.current) return false;
        setLoading(true);
        const result = await fetchFn(cursor ?? nextCursorRef.current, BATCH_SIZE);
        if (loadId !== loadIdRef.current) return false;
        const photoItems: SwipeDeckItem[] = result.assets.map((asset) => ({
          id: asset.id,
          imageUri: asset.uri,
        }));
        nextCursorRef.current = result.endCursor;
        setHasMore(result.hasNextPage);

        if (!isMounted.current || loadId !== loadIdRef.current) return false;
        setPhotos(photoItems);
        // Start swiping from the beginning whenever a new set is loaded
        setCurrentPhotoIndex(0);

        // Prefetch the following batch in the background
        if (result.hasNextPage) {
          fetchFn(result.endCursor, BATCH_SIZE)
            .then(
              (nextResult: { assets: PhotoAsset[]; hasNextPage: boolean; endCursor?: string }) => {
                if (!isMounted.current || loadId !== loadIdRef.current) return;
                setPrefetchedPhotos(
                  nextResult.assets.map((asset) => ({ id: asset.id, imageUri: asset.uri }))
                );
                prefetchCursorRef.current = nextResult.endCursor;
              }
            )
            .catch((err: unknown) => {
              console.error('Failed to prefetch assets:', err);
            });
        } else {
          setPrefetchedPhotos([]);
          prefetchCursorRef.current = undefined;
        }
        return true;
      } catch (error: unknown) {
        console.error('Error loading assets:', error);
        Alert.alert('Error', 'Failed to load from your gallery');
        return false;
      } finally {
        if (isMounted.current && loadId === loadIdRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    },
    [fetchFn]
  );

  useEffect(() => {
    loadPhotos();
    // Intentionally omit loadPhotos from deps to avoid reloading when the cursor changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwipeLeft = async (item: SwipeDeckItem, index: number, fast: boolean) => {
    if (navigationMode || selectionMode) {
      audioService.playTapSound();
      setCurrentPhotoIndex((prev) => prev + 1);
      return;
    }
    // Swipe event - user wants to delete the current photo permanently
    const success = await deletePhotoAsset(item.id);
    if (!success) {
      Alert.alert('Error', 'Failed to delete photo');
      return;
    }
    setSwipeFlash('DELETED!');
    setBurstColor('rgb(255,59,48)');
    if (fast) setSpeedLinesDir('left');
    setShowSwipeHint(false);
    // Play a random voice clip for extra feedback
    audioService.playRandomVoice();
    // Track streaks
    consecutiveDeleteRef.current += 1;
    if (consecutiveDeleteRef.current >= 3) {
      setCombo(consecutiveDeleteRef.current);
    }

    if (consecutiveDeleteRef.current === WAVE_STREAK) {
      setShowWave(true);
    }

    if (consecutiveDeleteRef.current === GLITCH_STREAK) {
      setShowGlitch(true);
    }

    // Trigger confetti and bird flock on long delete streaks
    if (consecutiveDeleteRef.current >= STREAK_THRESHOLD) {
      setConfettiKey((k) => k + 1);
      setShowFlock(true);
      consecutiveDeleteRef.current = 0;
      setCombo(null);
    }

    // Update current photo index for tracking progress
    setCurrentPhotoIndex((prev) => prev + 1);

    // Deletion from the device now happens when the recycle bin is cleared
    // or a photo is permanently deleted from within the recycle bin screen.
  };

  const handleSwipeRight = (item: SwipeDeckItem, index: number, fast: boolean) => {
    if (navigationMode || selectionMode) {
      audioService.playTapSound();
      setCurrentPhotoIndex((prev) => prev + 1);
      return;
    }
    // Swipe event - user keeps the current photo
    setSwipeFlash('KEPT!');
    setBurstColor('rgb(52,199,89)');
    if (fast) setSpeedLinesDir('right');
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
        setCurrentPhotoIndex(0);
        nextCursorRef.current = prefetchCursorRef.current;
        // Prefetch the subsequent batch
        if (nextCursorRef.current) {
          fetchFn(nextCursorRef.current, BATCH_SIZE)
            .then(
              (nextResult: { assets: PhotoAsset[]; hasNextPage: boolean; endCursor?: string }) => {
                if (!isMounted.current) return;
                setPrefetchedPhotos(
                  nextResult.assets.map((asset) => ({ id: asset.id, imageUri: asset.uri }))
                );
                prefetchCursorRef.current = nextResult.endCursor;
                setHasMore(nextResult.hasNextPage);
              }
            )
            .catch((err: unknown) => {
              console.error('Failed to prefetch assets:', err);
            });
        } else {
          setHasMore(false);
        }
        // Prefetch successful
      } else {
        loadPhotos();
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
        handleSwipeLeft(photos[0], 0, false);
      }
      tapTimesRef.current = [];
    }
  };

  const resetGallery = async () => {
    // First, confirm the action with the user
    Alert.alert('Reset Gallery', 'Reset progress? This also clears deleted photos.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            // Reset the RecycleBin store
            await resetRecycleBinStore();

            // Invalidate ongoing loads
            loadIdRef.current++;
            loadingRef.current = false;

            // Reset local component state
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

  const moveCurrentPhoto = async () => {
    const current = photos[currentPhotoIndex];
    if (!current) return;
    try {
      const albums = await fetchAlbums();
      if (albums.length === 0) {
        Alert.alert('No albums found');
        return;
      }
      const options = [...albums.map((a) => a.title), 'Cancel'];
      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
        },
        async (selected) => {
          if (selected === undefined || selected >= albums.length) {
            return;
          }
          const albumName = albums[selected].title;
          const moved = await moveAssetToAlbum(current.id, albumName);
          if (moved) {
            Alert.alert('Moved', `Photo moved to ${albumName}`);
            setPhotos((prev) => prev.filter((_, i) => i !== currentPhotoIndex));
            setShowSwipeHint(false);
            consecutiveDeleteRef.current = 0;
            setCombo(null);
          } else {
            Alert.alert('Error', 'Failed to move photo');
          }
        }
      );
    } catch (error) {
      console.error('Failed to move photo:', error);
      Alert.alert('Error', 'Failed to move photo');
    }
  };

  const openCurrentPhoto = async () => {
    const current = photos[currentPhotoIndex];
    if (!current) return;
    const openFn = mediaType === 'video' ? openVideoAsset : openPhotoAsset;
    const opened = await openFn(current.id);
    if (!opened) {
      Alert.alert('Error', 'Failed to open');
    }
  };

  const toggleSelectCurrent = () => {
    const current = photos[currentPhotoIndex];
    if (!current) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) {
        next.delete(current.id);
      } else {
        next.add(current.id);
      }
      setSelectionMode(next.size > 0);
      return next;
    });
  };

  const cancelSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const deleteSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      cancelSelection();
      return;
    }
    Alert.alert('Delete Photos', `Delete ${ids.length} selected photos?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await deletePhotoAssets(ids);
          if (success) {
            setPhotos((prev) => prev.filter((p) => !selectedIds.has(p.id)));
            cancelSelection();
          } else {
            Alert.alert('Error', 'Failed to delete selected photos');
          }
        },
      },
    ]);
  };

  const currentIndexRef = React.useRef(0);
  const photosRef = React.useRef<SwipeDeckItem[]>([]);
  const turboTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentIndexRef.current = currentPhotoIndex;
  }, [currentPhotoIndex]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      if (turboRef.current !== null) {
        cancelAnimationFrame(turboRef.current);
      }
      if (turboTimeoutRef.current) {
        clearTimeout(turboTimeoutRef.current);
      }
    };
  }, []);

  const stopTurbo = React.useCallback(() => {
    if (turboRef.current !== null) {
      cancelAnimationFrame(turboRef.current);
      turboRef.current = null;
    }
    if (turboTimeoutRef.current) {
      clearTimeout(turboTimeoutRef.current);
      turboTimeoutRef.current = null;
    }
    setTurbo(false);
  }, []);

  const startTurbo = React.useCallback(() => {
    if (turboRef.current) return;
    if (turboTimeoutRef.current) {
      clearTimeout(turboTimeoutRef.current);
      turboTimeoutRef.current = null;
    }
    setTurbo(true);
    let last = Date.now();
    const run = () => {
      if (!deckRef.current) return;
      const now = Date.now();
      if (now - last > 150) {
        deckRef.current.swipeLeft();
        last = now;
        if (currentIndexRef.current >= photosRef.current.length - 1) {
          stopTurbo();
          return;
        }
      }
      turboRef.current = requestAnimationFrame(run);
    };
    turboRef.current = requestAnimationFrame(run);
  }, [stopTurbo]);

  const handleShake = React.useCallback(() => {
    startTurbo();
    if (turboTimeoutRef.current) {
      clearTimeout(turboTimeoutRef.current);
    }
    turboTimeoutRef.current = setTimeout(stopTurbo, 1500);
  }, [startTurbo, stopTurbo]);

  useShake(handleShake);

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
          {mediaType === 'video' ? 'No Videos' : 'No Photos'}
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
        ref={deckRef}
        data={photos}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onCardLongPress={toggleSelectCurrent}
        selectedIds={selectedIds}
        onDeckEmpty={handleDeckEmpty}
        maxVisibleCards={3}
        cardSpacing={px(12)}
      />

      {showSwipeHint && <SwipeHint onDone={() => setShowSwipeHint(false)} />}

      {swipeFlash && <SwipeFlash label={swipeFlash} onDone={() => setSwipeFlash(null)} />}

      {burstColor && <PixelBurst color={burstColor} onDone={() => setBurstColor(null)} />}

      {showWave && <WaveOverlay onDone={() => setShowWave(false)} />}

      {speedLinesDir && (
        <SpeedLinesOverlay direction={speedLinesDir} onDone={() => setSpeedLinesDir(null)} />
      )}

      {showGlitch && <GlitchOverlay onDone={() => setShowGlitch(false)} />}

      {turbo && <TurboOverlay />}

      {/* Confetti burst when deleting */}
      {confettiKey > 0 && (
        <ConfettiCannon
          key={confettiKey}
          count={30}
          fadeOut
          colors={[...CONFETTI_COLORS]}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
        />
      )}

      {showFlock && <FlockOverlay onDone={() => setShowFlock(false)} />}

      {combo && <ComboOverlay count={combo} onDone={() => setCombo(null)} />}

      {selectionMode && (
        <MultiSelectBar
          count={selectedIds.size}
          onCancel={cancelSelection}
          onDelete={deleteSelected}
        />
      )}

      {/* Action Buttons */}
      <View className="mt-6 flex-row gap-4">
        <Button variant="secondary" size="icon" onPress={moveCurrentPhoto}>
          <Ionicons name="folder-outline" size={px(18)} color="white" />
          <Text className="sr-only">Move</Text>
        </Button>
        <Button variant="secondary" size="icon" onPress={openCurrentPhoto}>
          <Ionicons name="open-outline" size={px(18)} color="white" />
          <Text className="sr-only">Open</Text>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onPressIn={startTurbo}
          onPressOut={stopTurbo}
          className={turbo ? 'bg-red-500' : ''}>
          <Ionicons name="speedometer" size={px(18)} color="white" />
          <Text className="sr-only">Turbo</Text>
        </Button>
        <Button variant="primary" size="icon" onPress={resetGallery} className="bg-red-500">
          <Ionicons name="refresh" size={px(18)} color="white" />
          <Text className="sr-only">Reset</Text>
        </Button>
      </View>
      <BackgroundOptimizer />
    </Pressable>
  );
};
