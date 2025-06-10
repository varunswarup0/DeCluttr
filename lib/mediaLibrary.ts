import * as MediaLibrary from 'expo-media-library';

export interface PhotoAsset {
  id: string;
  uri: string;
}

/**
 * Request permission to access the device's media library
 * @returns Promise<boolean> - true if permission is granted, false otherwise
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
}

/**
 * Check if media library permission is already granted
 * @returns Promise<boolean> - true if permission is granted, false otherwise
 */
export async function checkMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking media library permission:', error);
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
 * @returns Promise<{assets: PhotoAsset[], hasNextPage: boolean, endCursor?: string}>
 */
export async function fetchPhotoAssetsWithPagination(
  after?: string,
  first: number = 20
): Promise<{
  assets: PhotoAsset[];
  hasNextPage: boolean;
  endCursor?: string;
}> {
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
    };
  } catch (error) {
    console.error('Error fetching photo assets with pagination:', error);
    return {
      assets: [],
      hasNextPage: false,
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
    let after: string | undefined = undefined;
    let hasNext = true;
    while (hasNext) {
      const { assets, hasNextPage, endCursor } = await fetchPhotoAssetsWithPagination(after, batchSize);
      all.push(...assets);
      after = endCursor;
      hasNext = hasNextPage;
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
export async function deletePhotoAssets(assetIds: string[]): Promise<void> {
  try {
    let hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        console.warn('Media library permission not granted. Skipping delete.');
        return;
      }
    }

    // Validate that each asset exists before attempting deletion
    const validIds: string[] = [];
    for (const id of assetIds) {
      try {
        await MediaLibrary.getAssetInfoAsync(id);
        validIds.push(id);
      } catch {
        console.warn(`Asset ${id} not found. Skipping.`);
      }
    }

    if (validIds.length === 0) {
      console.log('No photo assets to delete.');
      return;
    }

    const success = await MediaLibrary.deleteAssetsAsync(validIds);
    if (success) {
      console.log(`Deleted ${validIds.length} photo asset(s).`);
    } else {
      console.warn('Some photo assets could not be deleted.');
    }
  } catch (error: any) {
    if (error?.message?.toLowerCase().includes('permission')) {
      console.warn('Permission denied while deleting photo assets.');
    } else {
      console.error('Error deleting photo assets:', error);
    }
  }
}

export async function deletePhotoAsset(assetId: string): Promise<void> {
  return deletePhotoAssets([assetId]);
}
