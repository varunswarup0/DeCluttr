import * as MediaLibrary from 'expo-media-library';

// Lazy loaded to avoid bundling unless needed
let FileSystem: typeof import('expo-file-system') | null = null;
async function loadFileSystem() {
  if (!FileSystem) {
    FileSystem = await import('expo-file-system');
  }
  return FileSystem;
}

// Cache permission status to avoid extra async calls
let permissionGrantedCache: boolean | null = null;

export function resetMediaLibraryPermissionCache(): void {
  permissionGrantedCache = null;
}

export interface PhotoAsset {
  id: string;
  uri: string;
}

export interface PaginatedAssets {
  assets: PhotoAsset[];
  hasNextPage: boolean;
  endCursor?: string;
  totalCount: number;
}

/**
 * Request permission to access the device's media library
 * @returns Promise<boolean> - true if permission is granted, false otherwise
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const response: MediaLibrary.PermissionResponse = await MediaLibrary.requestPermissionsAsync();
    const { status, accessPrivileges } = response;
    permissionGrantedCache = status === 'granted' && accessPrivileges === 'all';
    return permissionGrantedCache;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    permissionGrantedCache = false;
    return false;
  }
}

/**
 * Check if media library permission is already granted
 * @returns Promise<boolean> - true if permission is granted, false otherwise
 */
export async function checkMediaLibraryPermission(): Promise<boolean> {
  if (permissionGrantedCache !== null) {
    return permissionGrantedCache;
  }
  try {
    const response: MediaLibrary.PermissionResponse = await MediaLibrary.getPermissionsAsync();
    const { status, accessPrivileges } = response;
    permissionGrantedCache = status === 'granted' && accessPrivileges === 'all';
    return permissionGrantedCache;
  } catch (error) {
    console.error('Error checking media library permission:', error);
    permissionGrantedCache = false;
    return false;
  }
}

/**
 * Fetch all photo assets from the user's gallery
 * @param first - Number of assets to fetch (default: 1000)
 * @returns Promise<PhotoAsset[]> - Array of photo assets
 */
export async function fetchPhotoAssets(first: number = 1000): Promise<PhotoAsset[]> {
  try {
    // First check if permission is granted
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const permissionGranted = await requestMediaLibraryPermission();
      if (!permissionGranted) {
        throw new Error('Media library permission not granted');
      }
    }

    const assets = await MediaLibrary.getAssetsAsync({
      first,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    return assets.assets.map((asset) => ({ id: asset.id, uri: asset.uri }));
  } catch (error) {
    console.error('Error fetching photo assets:', error);
    return [];
  }
}

/**
 * Fetch photo assets with pagination support
 * @param after - Cursor for pagination (optional)
 * @param first - Number of assets to fetch per page (default: 20)
 * @returns Promise<PaginatedAssets>
 */
export async function fetchPhotoAssetsWithPagination(
  after?: string,
  first: number = 20
): Promise<PaginatedAssets> {
  try {
    // First check if permission is granted
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const permissionGranted = await requestMediaLibraryPermission();
      if (!permissionGranted) {
        throw new Error('Media library permission not granted');
      }
    }

    // Fetch photo assets with pagination
    const result = await MediaLibrary.getAssetsAsync({
      first,
      after,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    return {
      assets: result.assets.map((asset) => ({ id: asset.id, uri: asset.uri })),
      hasNextPage: result.hasNextPage,
      endCursor: result.endCursor,
      totalCount: result.totalCount ?? result.assets.length,
    };
  } catch (error) {
    console.error('Error fetching photo assets with pagination:', error);
    return {
      assets: [],
      hasNextPage: false,
      totalCount: 0,
    };
  }
}

/**
 * Fetch every photo asset on the device. May return a large array.
 * @param batchSize - Number of assets to fetch per batch (default: 100)
 * @returns Promise<PhotoAsset[]>
 */
export async function fetchAllPhotoAssets(batchSize: number = 100): Promise<PhotoAsset[]> {
  try {
    const all: PhotoAsset[] = [];

    let hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }
    }

    let after: string | undefined = undefined;
    let hasNext = true;
    while (hasNext) {
      const result = await MediaLibrary.getAssetsAsync({
        first: batchSize,
        after,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
      });
      all.push(...result.assets.map((a) => ({ id: a.id, uri: a.uri })));
      after = result.endCursor;
      hasNext = result.hasNextPage;
    }
    return all;
  } catch (error) {
    console.error('Error fetching all photo assets:', error);
    return [];
  }
}

/**
 * Get detailed asset information including metadata
 * @param assetId - The asset ID to get details for
 * @returns Promise<MediaLibrary.Asset | null>
 */
export async function getAssetInfo(assetId: string): Promise<MediaLibrary.Asset | null> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const permissionGranted = await requestMediaLibraryPermission();
      if (!permissionGranted) {
        throw new Error('Media library permission not granted');
      }
    }

    const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
    return assetInfo;
  } catch (error) {
    console.error('Error getting asset info:', error);
    return null;
  }
}

/**
 * Permanently delete photo assets from the device
 * @param assetIds - Array of asset IDs to delete
 */
/**
 * Permanently delete photo assets from the device.
 * @returns boolean indicating if deletion succeeded for all assets
 */
export async function deletePhotoAssets(assetIds: string[]): Promise<boolean> {
  try {
    let hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        console.warn('Media library permission not granted. Skipping delete.');
        return false;
      }
    }

    if (assetIds.length === 0) {
      console.log('No photo assets to delete.');
      return true;
    }

    // Validate each asset exists and collect URIs for fallback deletion.
    const validAssets: { id: string; uri: string }[] = [];
    for (const id of assetIds) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(id);
        validAssets.push({ id: info.id, uri: info.uri });
      } catch {
        console.warn(`Asset ${id} not found. Skipping.`);
      }
    }

    if (validAssets.length === 0) {
      console.log('No valid photo assets to delete.');
      return true;
    }

    const validIds = validAssets.map((a) => a.id);
    const result = await MediaLibrary.deleteAssetsAsync(validIds);
    let allRemoved = result === undefined ? true : result;

    // Verify deletion because some platforms return void
    for (const asset of validAssets) {
      let exists = true;
      try {
        await MediaLibrary.getAssetInfoAsync(asset.id);
      } catch {
        exists = false;
      }
      if (exists) {
        allRemoved = false;
        console.warn(`Asset ${asset.id} still exists after deletion attempt.`);
        try {
          const FS = await loadFileSystem();
          await FS.deleteAsync(asset.uri, { idempotent: true });
          // Check again
          try {
            await MediaLibrary.getAssetInfoAsync(asset.id);
            console.warn(`Asset ${asset.id} still exists after fallback.`);
          } catch {
            // removed successfully
          }
        } catch (fsError) {
          console.warn('Fallback file removal failed:', fsError);
        }
      }
    }

    const success = allRemoved;

    if (success) {
      console.log(`Deleted ${validIds.length} photo asset(s).`);
    } else {
      console.warn('Some photo assets could not be deleted.');
    }
    return success;
  } catch (error: any) {
    if (error?.message?.toLowerCase().includes('permission')) {
      console.warn('Permission denied while deleting photo assets.');
    } else {
      console.error('Error deleting photo assets:', error);
    }
    return false;
  }
}

export async function deletePhotoAsset(assetId: string): Promise<boolean> {
  return deletePhotoAssets([assetId]);
}

export interface MediaAlbum {
  id: string;
  title: string;
}

/**
 * Get available media library albums.
 */
export async function fetchAlbums(): Promise<MediaAlbum[]> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        throw new Error('Media library permission not granted');
      }
    }
    const albums = await MediaLibrary.getAlbumsAsync();
    return albums.map((a) => ({ id: a.id, title: a.title }));
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

/**
 * Move a photo asset to the specified album. Creates the album if missing.
 */
export async function moveAssetToAlbum(assetId: string, albumName: string): Promise<boolean> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        console.warn('Media library permission not granted.');
        return false;
      }
    }

    let album = await MediaLibrary.getAlbumAsync(albumName);
    if (!album) {
      album = await MediaLibrary.createAlbumAsync(albumName, assetId, false);
      return !!album;
    }
    await MediaLibrary.addAssetsToAlbumAsync([assetId], album.id, false);
    return true;
  } catch (error) {
    console.error('Failed to move asset to album:', error);
    return false;
  }
}

/**
 * Open a photo asset in the device's default gallery app.
 */
export async function openPhotoAsset(assetId: string): Promise<boolean> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        console.warn('Media library permission not granted.');
        return false;
      }
    }

    const info = await MediaLibrary.getAssetInfoAsync(assetId);
    if (!info) {
      console.warn('Asset not found.');
      return false;
    }

    const { Linking } = await import('react-native');
    await Linking.openURL(info.uri);
    return true;
  } catch (error) {
    console.error('Failed to open photo asset:', error);
    return false;
  }
}

/**
 * Open a video asset in the device's default gallery app.
 */
export async function openVideoAsset(assetId: string): Promise<boolean> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        console.warn('Media library permission not granted.');
        return false;
      }
    }

    const info = await MediaLibrary.getAssetInfoAsync(assetId);
    if (!info) {
      console.warn('Asset not found.');
      return false;
    }

    const { Linking } = await import('react-native');
    await Linking.openURL(info.uri);
    return true;
  } catch (error) {
    console.error('Failed to open video asset:', error);
    return false;
  }
}

/**
 * Fetch video assets with pagination support
 */
export async function fetchVideoAssetsWithPagination(
  after?: string,
  first: number = 20
): Promise<PaginatedAssets> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const permissionGranted = await requestMediaLibraryPermission();
      if (!permissionGranted) {
        throw new Error('Media library permission not granted');
      }
    }
    const result = await MediaLibrary.getAssetsAsync({
      first,
      after,
      mediaType: MediaLibrary.MediaType.video,
      sortBy: MediaLibrary.SortBy.creationTime,
    });
    return {
      assets: result.assets.map((asset) => ({ id: asset.id, uri: asset.uri })),
      hasNextPage: result.hasNextPage,
      endCursor: result.endCursor,
      totalCount: result.totalCount ?? result.assets.length,
    };
  } catch (error) {
    console.error('Error fetching video assets with pagination:', error);
    return {
      assets: [],
      hasNextPage: false,
      totalCount: 0,
    };
  }
}

export async function fetchAllVideoAssets(batchSize: number = 100): Promise<PhotoAsset[]> {
  try {
    const all: PhotoAsset[] = [];
    let hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }
    }
    let after: string | undefined = undefined;
    let hasNext = true;
    while (hasNext) {
      const result = await MediaLibrary.getAssetsAsync({
        first: batchSize,
        after,
        mediaType: MediaLibrary.MediaType.video,
        sortBy: MediaLibrary.SortBy.creationTime,
      });
      all.push(...result.assets.map((a) => ({ id: a.id, uri: a.uri })));
      after = result.endCursor;
      hasNext = result.hasNextPage;
    }
    return all;
  } catch (error) {
    console.error('Error fetching all video assets:', error);
    return [];
  }
}

/**
 * Fetch assets from a specific album with pagination support.
 */
export async function fetchAssetsFromAlbumWithPagination(
  albumName: string,
  after?: string,
  first: number = 20,
  mediaType: MediaLibrary.MediaTypeValue = MediaLibrary.MediaType.photo
): Promise<PaginatedAssets> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        throw new Error('Media library permission not granted');
      }
    }

    const album = await MediaLibrary.getAlbumAsync(albumName);
    if (!album) {
      return { assets: [], hasNextPage: false, totalCount: 0 };
    }

    const result = await MediaLibrary.getAssetsAsync({
      first,
      after,
      album: album.id,
      mediaType,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    return {
      assets: result.assets.map((a) => ({ id: a.id, uri: a.uri })),
      hasNextPage: result.hasNextPage,
      endCursor: result.endCursor,
      totalCount: result.totalCount ?? result.assets.length,
    };
  } catch (error) {
    console.error('Error fetching assets from album:', error);
    return { assets: [], hasNextPage: false, totalCount: 0 };
  }
}

/**
 * Convenience helpers for WhatsApp media folders.
 */
export async function fetchWhatsAppPhotos(after?: string, first: number = 20) {
  return fetchAssetsFromAlbumWithPagination(
    'WhatsApp Images',
    after,
    first,
    MediaLibrary.MediaType.photo
  );
}

export async function fetchWhatsAppVideos(after?: string, first: number = 20) {
  return fetchAssetsFromAlbumWithPagination(
    'WhatsApp Video',
    after,
    first,
    MediaLibrary.MediaType.video
  );
}

/**
 * Delete all assets from the specified album.
 * Useful for bulk cleanup operations.
 */
export async function deleteAllAssetsFromAlbum(
  albumName: string,
  mediaType: MediaLibrary.MediaTypeValue = MediaLibrary.MediaType.photo
): Promise<boolean> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        console.warn('Media library permission not granted.');
        return false;
      }
    }

    const album = await MediaLibrary.getAlbumAsync(albumName);
    if (!album) {
      // nothing to delete
      return true;
    }

    let after: string | undefined = undefined;
    const ids: string[] = [];
    let hasNext = true;
    while (hasNext) {
      const result = await MediaLibrary.getAssetsAsync({
        first: 100,
        after,
        album: album.id,
        mediaType,
        sortBy: MediaLibrary.SortBy.creationTime,
      });
      ids.push(...result.assets.map((a) => a.id));
      after = result.endCursor;
      hasNext = result.hasNextPage;
    }

    if (ids.length === 0) {
      return true;
    }

    return deletePhotoAssets(ids);
  } catch (error) {
    console.error('Error deleting assets from album:', error);
    return false;
  }
}

/**
 * Delete all assets from the specified month.
 * @param year Full year, e.g. 2024
 * @param month 1-12
 */
export async function deleteAssetsFromMonth(
  year: number,
  month: number,
  mediaType: MediaLibrary.MediaTypeValue = MediaLibrary.MediaType.photo
): Promise<boolean> {
  try {
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        console.warn('Media library permission not granted.');
        return false;
      }
    }

    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 1).getTime();
    let after: string | undefined = undefined;
    const ids: string[] = [];
    let hasNext = true;
    while (hasNext) {
      const result = await MediaLibrary.getAssetsAsync({
        first: 100,
        after,
        createdAfter: start,
        createdBefore: end,
        mediaType,
        sortBy: MediaLibrary.SortBy.creationTime,
      });
      ids.push(...result.assets.map((a) => a.id));
      after = result.endCursor;
      hasNext = result.hasNextPage;
    }

    if (ids.length === 0) {
      return true;
    }

    return deletePhotoAssets(ids);
  } catch (error) {
    console.error('Error deleting assets from month:', error);
    return false;
  }
}
