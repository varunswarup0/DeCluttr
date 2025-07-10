import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import {
  requestMediaLibraryPermission,
  checkMediaLibraryPermission,
  fetchPhotoAssets,
  fetchPhotoAssetsWithPagination,
  fetchAllPhotoAssets,
  fetchVideoAssetsWithPagination,
  fetchAllVideoAssets,
  getAssetInfo,
  deletePhotoAssets,
  resetMediaLibraryPermissionCache,
} from '../lib/mediaLibrary';

jest.mock('expo-file-system', () => ({
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-media-library', () => {
  const getAssetsAsync = jest
    .fn()
    // fetchPhotoAssets test
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id0${i}`, uri: `uri0${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'cursor0',
    }))
    // fetchPhotoAssetsWithPagination test
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id1${i}`, uri: `uri1${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'cursor1',
    }))
    // fetchAllPhotoAssets first page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id2${i}`, uri: `uri2${i}` })),
      hasNextPage: true,
      endCursor: after ? `${after}-end` : 'cursor2',
    }))
    // fetchAllPhotoAssets second page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id3${i}`, uri: `uri3${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'cursor3',
    }))
    // fetchVideoAssetsWithPagination
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `vid${i}`, uri: `vuri${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'vcursor0',
    }))
    // fetchAllVideoAssets first page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `vidA${i}`, uri: `vuriA${i}` })),
      hasNextPage: true,
      endCursor: after ? `${after}-end` : 'vcursor1',
    }))
    // fetchAllVideoAssets second page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `vidB${i}`, uri: `vuriB${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'vcursor2',
    }));

  return {
    requestPermissionsAsync: jest
      .fn()
      .mockResolvedValue({ status: 'granted', accessPrivileges: 'all' }),
    getPermissionsAsync: jest
      .fn()
      .mockResolvedValue({ status: 'granted', accessPrivileges: 'all' }),
    getAssetsAsync,
    getAssetInfoAsync: jest.fn(),
    deleteAssetsAsync: jest.fn().mockResolvedValue(true),
    MediaType: { photo: 'photo', video: 'video' },
    SortBy: { creationTime: 'creationTime' },
  };
});

describe('mediaLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMediaLibraryPermissionCache();
  });

  it('requests and checks permissions', async () => {
    const granted = await requestMediaLibraryPermission();
    expect(granted).toBe(true);
    resetMediaLibraryPermissionCache();
    const check = await checkMediaLibraryPermission();
    expect(check).toBe(true);
    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith({
      accessPrivileges: 'all',
    });
    expect(MediaLibrary.getPermissionsAsync).toHaveBeenCalledWith({
      accessPrivileges: 'all',
    });
  });

  it('fetches photo assets', async () => {
    const assets = await fetchPhotoAssets(2);
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalled();
    expect(assets).toHaveLength(2);
  });

  it('fetches assets with pagination', async () => {
    const result = await fetchPhotoAssetsWithPagination('start', 1);
    expect(result.assets).toHaveLength(1);
    expect(result.endCursor).toBe('start-end');
  });

  it('fetches all photo assets across pages', async () => {
    const assets = await fetchAllPhotoAssets(1);
    // two calls mocked above -> 2 assets
    expect(assets).toHaveLength(2);
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalledTimes(2);
  });

  it('fetches video assets with pagination', async () => {
    const result = await fetchVideoAssetsWithPagination('start', 1);
    expect(result.assets).toHaveLength(1);
    expect(result.endCursor).toBe('start-end');
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalledTimes(1);
  });

  it('fetches all video assets across pages', async () => {
    const assets = await fetchAllVideoAssets(1);
    expect(assets).toHaveLength(2);
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalledTimes(2);
  });

  it('gets asset info', async () => {
    (MediaLibrary.getAssetInfoAsync as jest.Mock).mockResolvedValueOnce({
      id: '1',
      uri: 'uri1',
    });
    const info = await getAssetInfo('1');
    expect(info).toEqual({ id: '1', uri: 'uri1' });
  });

  it('deletes photo assets', async () => {
    (MediaLibrary.getAssetInfoAsync as jest.Mock)
      .mockResolvedValueOnce({ id: '1', uri: 'uri1' }) // initial check
      .mockRejectedValueOnce(new Error('Not found')); // verify after delete

    const success = await deletePhotoAssets(['1']);
    expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalledWith(['1']);
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    expect(success).toBe(true);
  });

  it('returns false when asset still exists after delete', async () => {
    (MediaLibrary.getAssetInfoAsync as jest.Mock)
      .mockResolvedValueOnce({ id: '2', uri: 'uri2' }) // initial check
      .mockResolvedValueOnce({ id: '2', uri: 'uri2' }); // still exists after delete

    const success = await deletePhotoAssets(['2']);
    expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalledWith(['2']);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith('uri2', { idempotent: true });
    expect(success).toBe(false);
  });
});
