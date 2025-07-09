import { analyzePhotos } from '../lib/photoAnalyzer';
import * as media from '../lib/mediaLibrary';

jest.mock('../lib/mediaLibrary', () => ({
  fetchAllPhotoAssets: jest.fn(),
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
    ]);
    (media.getAssetInfo as jest.Mock).mockImplementation((id: string) => {
      switch (id) {
        case '1':
          return Promise.resolve({ id: '1', uri: 'u1', filename: 'a.jpg', width: 100, height: 200, size: 10 });
        case '2':
          return Promise.resolve({ id: '2', uri: 'u2', filename: 'b.jpg', width: 100, height: 200, size: 10 });
        default:
          return Promise.resolve({ id: '3', uri: 'u3', filename: 'c.jpg', width: 200, height: 100, size: 5 });
      }
    });

    const result = await analyzePhotos();
    expect(result.byOrientation.portrait).toHaveLength(2);
    expect(result.byOrientation.landscape).toHaveLength(1);
    // photos 1 and 2 have same dimensions and size -> duplicate group
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0]).toHaveLength(2);
  });
});
