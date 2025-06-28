import * as MediaLibrary from 'expo-media-library';
import {
  requestMediaLibraryPermission,
  checkMediaLibraryPermission,
  fetchPhotoAssets,
  fetchPhotoAssetsWithPagination,
  fetchAllPhotoAssets,
  getAssetInfo,
  deletePhotoAssets,
  resetMediaLibraryPermissionCache,
} from '../lib/mediaLibrary';

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
    }));

  return {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getAssetsAsync,
    getAssetInfoAsync: jest.fn().mockResolvedValue({ id: '1', uri: 'uri1' }),
    deleteAssetsAsync: jest.fn().mockResolvedValue(true),
    MediaType: { photo: 'photo' },
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
    const check = await checkMediaLibraryPermission();
    expect(check).toBe(true);
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

  it('gets asset info', async () => {
    const info = await getAssetInfo('1');
    expect(info).toEqual({ id: '1', uri: 'uri1' });
  });

  it('deletes photo assets', async () => {
    await deletePhotoAssets(['1']);
    expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalledWith(['1']);
  });
});
