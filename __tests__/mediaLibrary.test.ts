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
  fetchAssetsFromAlbumWithPagination,
  deleteAllAssetsFromAlbum,
  getAssetInfo,
  deletePhotoAssets,
  resetMediaLibraryPermissionCache,
  deleteAssetsFromMonth,
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
      totalCount: first,
    }))
    // fetchPhotoAssetsWithPagination test
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id1${i}`, uri: `uri1${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'cursor1',
      totalCount: first,
    }))
    // fetchAllPhotoAssets first page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id2${i}`, uri: `uri2${i}` })),
      hasNextPage: true,
      endCursor: after ? `${after}-end` : 'cursor2',
      totalCount: first * 2,
    }))
    // fetchAllPhotoAssets second page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id3${i}`, uri: `uri3${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'cursor3',
      totalCount: first * 2,
    }))
    // fetchVideoAssetsWithPagination
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `vid${i}`, uri: `vuri${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'vcursor0',
      totalCount: first,
    }))
    // fetchAllVideoAssets first page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `vidA${i}`, uri: `vuriA${i}` })),
      hasNextPage: true,
      endCursor: after ? `${after}-end` : 'vcursor1',
      totalCount: first * 2,
    }))
    // fetchAllVideoAssets second page
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `vidB${i}`, uri: `vuriB${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'vcursor2',
      totalCount: first * 2,
    }))
    // fetchAssetsFromAlbumWithPagination
    .mockImplementationOnce(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `wa${i}`, uri: `wauri${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'wa-end',
      totalCount: first,
    }))
    // deleteAllAssetsFromAlbum first page
    .mockImplementationOnce(() => ({
      assets: [{ id: 'del1', uri: 'deluri1' }],
      hasNextPage: true,
      endCursor: 'del-c1',
      totalCount: 2,
    }))
    // deleteAllAssetsFromAlbum second page
    .mockImplementationOnce(() => ({
      assets: [{ id: 'del2', uri: 'deluri2' }],
      hasNextPage: false,
      endCursor: 'del-c2',
      totalCount: 2,
    }))
    // deleteAssetsFromMonth first page
    .mockImplementationOnce(() => ({
      assets: [{ id: 'm1', uri: 'muri1' }],
      hasNextPage: true,
      endCursor: 'm-c1',
      totalCount: 2,
    }))
    // deleteAssetsFromMonth second page
    .mockImplementationOnce(() => ({
      assets: [{ id: 'm2', uri: 'muri2' }],
      hasNextPage: false,
      endCursor: 'm-c2',
      totalCount: 2,
    }));

  const getAlbumAsync = jest.fn().mockResolvedValue({ id: 'wa1', title: 'WhatsApp Images' });

  return {
    requestPermissionsAsync: jest
      .fn()
      .mockResolvedValue({ status: 'granted', accessPrivileges: 'all' }),
    getPermissionsAsync: jest
      .fn()
      .mockResolvedValue({ status: 'granted', accessPrivileges: 'all' }),
    getAssetsAsync,
    getAlbumAsync,
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
    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith();
    expect(MediaLibrary.getPermissionsAsync).toHaveBeenCalledWith();
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
    expect(result.totalCount).toBe(1);
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
    expect(result.totalCount).toBe(1);
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

  it('fetches assets from an album', async () => {
    const result = await fetchAssetsFromAlbumWithPagination(
      'WhatsApp Images',
      undefined,
      1,
      MediaLibrary.MediaType.photo as any
    );
    expect(result.assets).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(MediaLibrary.getAlbumAsync).toHaveBeenCalledWith('WhatsApp Images');
  });

  it('deletes all assets from an album', async () => {
    (MediaLibrary.getAssetInfoAsync as jest.Mock)
      .mockResolvedValueOnce({ id: 'del1', uri: 'deluri1' }) // asset1 before
      .mockResolvedValueOnce({ id: 'del2', uri: 'deluri2' }) // asset2 before
      .mockRejectedValueOnce(new Error('not found')) // asset1 after
      .mockRejectedValueOnce(new Error('not found')); // asset2 after

    const result = await deleteAllAssetsFromAlbum('Test');
    expect(result).toBe(true);
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalledTimes(2);
    expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalledWith(['del1', 'del2']);
  });

  it('deletes assets from a month', async () => {
    (MediaLibrary.getAssetInfoAsync as jest.Mock)
      .mockResolvedValueOnce({ id: 'm1', uri: 'muri1' })
      .mockResolvedValueOnce({ id: 'm2', uri: 'muri2' })
      .mockRejectedValueOnce(new Error('not found'))
      .mockRejectedValueOnce(new Error('not found'));

    const result = await deleteAssetsFromMonth(2024, 1);
    expect(result).toBe(true);
    expect(MediaLibrary.getAssetsAsync).toHaveBeenCalledTimes(2);
    expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalledWith(['m1', 'm2']);
  });
});
