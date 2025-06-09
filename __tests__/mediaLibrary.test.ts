import {
  requestMediaLibraryPermission,
  checkMediaLibraryPermission,
  fetchPhotoAssets,
  fetchPhotoAssetsWithPagination,
  getAssetInfo,
  deletePhotoAssets,
} from '../lib/mediaLibrary';

jest.mock('expo-media-library', () => {
  return {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getAssetsAsync: jest.fn().mockImplementation(({ after, first }) => ({
      assets: Array.from({ length: first }, (_, i) => ({ id: `id${i}`, uri: `uri${i}` })),
      hasNextPage: false,
      endCursor: after ? `${after}-end` : 'cursor',
    })),
    getAssetInfoAsync: jest.fn().mockResolvedValue({ id: '1', uri: 'uri1' }),
    deleteAssetsAsync: jest.fn().mockResolvedValue(true),
    MediaType: { photo: 'photo' },
    SortBy: { creationTime: 'creationTime' },
  };
});

const MediaLibrary = require('expo-media-library');

describe('mediaLibrary', () => {
  beforeEach(() => jest.clearAllMocks());

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

  it('gets asset info', async () => {
    const info = await getAssetInfo('1');
    expect(info).toEqual({ id: '1', uri: 'uri1' });
  });

  it('deletes photo assets', async () => {
    await deletePhotoAssets(['1']);
    expect(MediaLibrary.deleteAssetsAsync).toHaveBeenCalledWith(['1']);
  });
});
