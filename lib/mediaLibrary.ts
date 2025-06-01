import * as MediaLibrary from 'expo-media-library';

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
 * @returns Promise<string[]> - Array of photo asset URIs
 */
export async function fetchPhotoAssets(first: number = 1000): Promise<string[]> {
  try {
    // First check if permission is granted
    const hasPermission = await checkMediaLibraryPermission();
    if (!hasPermission) {
      const permissionGranted = await requestMediaLibraryPermission();
      if (!permissionGranted) {
        throw new Error('Media library permission not granted');
      }
    }

    // Fetch photo assets
    const assets = await MediaLibrary.getAssetsAsync({
      first,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    // Extract URIs from assets
    return assets.assets.map((asset) => asset.uri);
  } catch (error) {
    console.error('Error fetching photo assets:', error);
    return [];
  }
}

/**
 * Fetch photo assets with pagination support
 * @param after - Cursor for pagination (optional)
 * @param first - Number of assets to fetch per page (default: 20)
 * @returns Promise<{assets: string[], hasNextPage: boolean, endCursor?: string}>
 */
export async function fetchPhotoAssetsWithPagination(
  after?: string,
  first: number = 20
): Promise<{
  assets: string[];
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
      assets: result.assets.map((asset) => asset.uri),
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
