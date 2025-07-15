import {
  analyzePhotos,
  analyzePhotosWithProgress,
  getDeletionCandidates,
} from '../lib/photoAnalyzer';
import * as media from '../lib/mediaLibrary';

jest.mock('../lib/mediaLibrary', () => ({
  fetchAllPhotoAssets: jest.fn(),
  fetchPhotoAssetsWithPagination: jest.fn(),
  getAssetInfo: jest.fn(),
}));

describe('photoAnalyzer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('categorizes orientation and finds duplicates', async () => {
    (media.fetchAllPhotoAssets as jest.Mock).mockResolvedValue([
      { id: '1', uri: 'u1' },
      { id: '2', uri: 'u2' },
      { id: '3', uri: 'u3' },
      { id: '4', uri: 'u4' },
    ]);
    (media.getAssetInfo as jest.Mock).mockImplementation((id: string) => {
      switch (id) {
        case '1':
          return Promise.resolve({
            id: '1',
            uri: 'u1',
            filename: 'Screenshot_1.png',
            width: 100,
            height: 200,
            size: 10,
            mediaSubtypes: ['screenshot'],
            creationTime: Date.now(),
          });
        case '2':
          return Promise.resolve({
            id: '2',
            uri: 'u2',
            filename: 'IMG_selfie.jpg',
            width: 100,
            height: 200,
            size: 10,
            creationTime: Date.now() - 366 * 24 * 60 * 60 * 1000,
          });
        case '3':
          return Promise.resolve({
            id: '3',
            uri: 'u3',
            filename: 'c.jpg',
            width: 200,
            height: 100,
            size: 5,
            creationTime: Date.now(),
          });
        default:
          return Promise.resolve({
            id: '4',
            uri: 'u4',
            filename: 'd.jpg',
            width: 100,
            height: 100,
            size: 3,
            creationTime: Date.now(),
          });
      }
    });

    const result = await analyzePhotos();
    expect(result.byOrientation.portrait).toHaveLength(2);
    expect(result.byOrientation.landscape).toHaveLength(1);
    expect(result.byOrientation.square).toHaveLength(1);
    // photos 1 and 2 have same dimensions and size -> duplicate group
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0]).toHaveLength(2);
    expect(result.screenshots).toHaveLength(1);
    expect(result.selfies).toHaveLength(1);
    expect(result.oldPhotos).toHaveLength(1);
    expect(result.lowRes).toHaveLength(4);
  });

  it('reports progress during analysis', async () => {
    (media.fetchPhotoAssetsWithPagination as jest.Mock)
      .mockResolvedValueOnce({
        assets: [{ id: '1', uri: 'u1' }],
        hasNextPage: true,
        endCursor: 'c1',
        totalCount: 2,
      })
      .mockResolvedValueOnce({
        assets: [{ id: '2', uri: 'u2' }],
        hasNextPage: false,
        endCursor: 'c2',
        totalCount: 2,
      });
    (media.getAssetInfo as jest.Mock).mockResolvedValue({
      id: '1',
      uri: 'u1',
      filename: 'a.jpg',
      width: 100,
      height: 200,
      size: 5,
      creationTime: Date.now(),
    });

    const progress: number[] = [];
    await analyzePhotosWithProgress((p, t) => {
      progress.push(p / t);
    }, 1);

    expect(progress.length).toBeGreaterThan(0);
    expect(progress[progress.length - 1]).toBe(1);
  });

  it('suggests deletion candidates', async () => {
    (media.fetchAllPhotoAssets as jest.Mock).mockResolvedValue([
      { id: '1', uri: 'u1' },
      { id: '2', uri: 'u2' },
      { id: '3', uri: 'u3' },
    ]);

    (media.getAssetInfo as jest.Mock).mockImplementation((id: string) => {
      switch (id) {
        case '1':
          return Promise.resolve({
            id: '1',
            uri: 'u1',
            filename: 'Screenshot_1.png',
            width: 100,
            height: 200,
            size: 10,
            mediaSubtypes: ['screenshot'],
            creationTime: Date.now(),
          });
        case '2':
          return Promise.resolve({
            id: '2',
            uri: 'u2',
            filename: 'b.jpg',
            width: 100,
            height: 200,
            size: 10,
            creationTime: Date.now(),
          });
        default:
          return Promise.resolve({
            id: '3',
            uri: 'u3',
            filename: 'b.jpg',
            width: 100,
            height: 200,
            size: 10,
            creationTime: Date.now(),
          });
      }
    });

    const result = await analyzePhotos();
    const candidates = getDeletionCandidates(result);
    // screenshot and two duplicate images should be suggested
    expect(candidates).toHaveLength(3);
  });
});
