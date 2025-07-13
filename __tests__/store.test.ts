import { useRecycleBinStore, DeletedPhoto } from '../store/store';
import * as mediaLibrary from '../lib/mediaLibrary';

jest.mock('../lib/asyncStorageWrapper', () => {
  const memory: Record<string, string> = {};
  return {
    getAsyncStorage: () => ({
      getItem: async (k: string) => memory[k] ?? null,
      setItem: async (k: string, v: string) => {
        memory[k] = v;
      },
      removeItem: async (k: string) => {
        delete memory[k];
      },
    }),
  };
});

jest.mock('../lib/mediaLibrary', () => ({
  deletePhotoAsset: jest.fn().mockResolvedValue(true),
  deletePhotoAssets: jest.fn().mockResolvedValue(true),
}));

const createPhoto = (id: string): DeletedPhoto => ({
  id,
  imageUri: `uri-${id}`,
  deletedAt: new Date(),
});

describe('RecycleBin store', () => {
  beforeEach(() => {
    useRecycleBinStore.setState({
      deletedPhotos: [],
      totalDeleted: 0,
      onboardingCompleted: false,
      zenMode: false,
    });
    jest.clearAllMocks();
  });

  it('adds and restores photos', async () => {
    const { addDeletedPhoto, restorePhoto } = useRecycleBinStore.getState();
    const photo = createPhoto('1');
    addDeletedPhoto(photo);
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    expect(useRecycleBinStore.getState().totalDeleted).toBe(1);
    expect(mediaLibrary.deletePhotoAsset).not.toHaveBeenCalled();

    const restored = restorePhoto('1');
    expect(restored).toEqual(photo);
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(0);
  });

  it('permanently deletes photos and clears recycle bin', async () => {
    const { addDeletedPhoto, permanentlyDelete, clearRecycleBin } = useRecycleBinStore.getState();
    addDeletedPhoto(createPhoto('1'));
    addDeletedPhoto(createPhoto('2'));
    await expect(permanentlyDelete('1')).resolves.toBe(true);
    expect(mediaLibrary.deletePhotoAsset).toHaveBeenCalledWith('1');
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    await expect(clearRecycleBin()).resolves.toBe(true);
    expect(mediaLibrary.deletePhotoAssets).toHaveBeenCalledWith(['2']);
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(0);
  });

  it('permanently deletes multiple photos', async () => {
    const { addDeletedPhoto, permanentlyDeleteMany } = useRecycleBinStore.getState();
    addDeletedPhoto(createPhoto('a'));
    addDeletedPhoto(createPhoto('b'));
    await expect(permanentlyDeleteMany(['a', 'b'])).resolves.toBe(true);
    const calls = (mediaLibrary.deletePhotoAssets as jest.Mock).mock.calls;
    expect(new Set(calls[calls.length - 1][0])).toEqual(new Set(['a', 'b']));
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(0);
  });

  it('keeps photo when permanent delete fails', async () => {
    const { addDeletedPhoto, permanentlyDelete } = useRecycleBinStore.getState();
    addDeletedPhoto(createPhoto('1'));
    (mediaLibrary.deletePhotoAsset as jest.Mock).mockResolvedValueOnce(false);

    await expect(permanentlyDelete('1')).resolves.toBe(false);

    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
  });

  it('purges expired photos', async () => {
    const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    useRecycleBinStore.setState({
      deletedPhotos: [
        { ...createPhoto('old'), deletedAt: oldDate },
        { ...createPhoto('new'), deletedAt: new Date() },
      ],
    });
    await useRecycleBinStore.getState().purgeExpiredPhotos();
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    expect(useRecycleBinStore.getState().deletedPhotos[0].id).toBe('new');
  });

  it('does not clear recycle bin when deletion fails', async () => {
    const { addDeletedPhoto, clearRecycleBin } = useRecycleBinStore.getState();
    addDeletedPhoto(createPhoto('1'));
    addDeletedPhoto(createPhoto('2'));
    (mediaLibrary.deletePhotoAssets as jest.Mock).mockResolvedValueOnce(false);

    await expect(clearRecycleBin()).resolves.toBe(false);

    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(2);
  });

  it('keeps expired photos when purge deletion fails', async () => {
    const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    useRecycleBinStore.setState({ deletedPhotos: [{ ...createPhoto('old'), deletedAt: oldDate }] });
    (mediaLibrary.deletePhotoAssets as jest.Mock).mockResolvedValueOnce(false);

    await useRecycleBinStore.getState().purgeExpiredPhotos();

    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
  });

  it('resets gallery and onboarding flags', async () => {
    const store = useRecycleBinStore.getState();
    store.addDeletedPhoto(createPhoto('1'));
    await store.completeOnboarding();
    await store.resetGallery();
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(0);
    expect(useRecycleBinStore.getState().totalDeleted).toBe(0);
    await store.resetOnboarding();
    expect(useRecycleBinStore.getState().onboardingCompleted).toBe(false);
  });

  it('loads deleted photos from storage', async () => {
    const { getAsyncStorage } = await import('../lib/asyncStorageWrapper');
    const storage = getAsyncStorage();
    await storage.setItem('@decluttr_deleted_photos', JSON.stringify([createPhoto('a')]));
    await storage.setItem('@decluttr_total_deleted', '5');
    useRecycleBinStore.setState({
      deletedPhotos: [],
      onboardingCompleted: false,
    });
    await useRecycleBinStore.getState().loadDeletedPhotos();
    await useRecycleBinStore.getState().loadTotalDeleted();
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    expect(useRecycleBinStore.getState().totalDeleted).toBe(5);
  });

  it('onboarding status persists', async () => {
    const store = useRecycleBinStore.getState();
    await store.completeOnboarding();
    const completed = await store.checkOnboardingStatus();
    expect(completed).toBe(true);
  });
});
