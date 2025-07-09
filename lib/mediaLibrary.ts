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

/**
 * Request permission to access the device's media library
 * @returns Promise<boolean> - true if permission is granted, false otherwise
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status, accessPrivileges } =
      await MediaLibrary.requestPermissionsAsync({ accessPrivileges: 'all' });
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
    const { status, accessPrivileges } = await MediaLibrary.getPermissionsAsync({
      accessPrivileges: 'all',
    });
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
      const { assets, hasNextPage, endCursor } = await fetchPhotoAssetsWithPagination(
        after,
        batchSize
      );
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
    let success = result === undefined ? true : result;

    if (success) {
      // Verify deletion because some platforms return void
      for (const asset of validAssets) {
        try {
          await MediaLibrary.getAssetInfoAsync(asset.id);
          // Asset still exists
          success = false;
          console.warn(`Asset ${asset.id} still exists after deletion attempt.`);
          try {
            const FS = await loadFileSystem();
            await FS.deleteAsync(asset.uri, { idempotent: true });
          } catch (fsError) {
            console.warn('Fallback file removal failed:', fsError);
          }
        } catch {
          // Asset no longer exists
        }
      }
    }

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
