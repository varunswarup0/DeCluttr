import { useRecycleBinStore, XP_CONFIG, DeletedPhoto } from '../store/store';
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
      xp: 0,
      isXpLoaded: true,
      onboardingCompleted: false,
      zenMode: false,
    });
  });

  it('adds and restores photos with XP updates', async () => {
    const { addDeletedPhoto, restorePhoto } = useRecycleBinStore.getState();
    const photo = createPhoto('1');
    addDeletedPhoto(photo);
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    expect(useRecycleBinStore.getState().totalDeleted).toBe(1);
    expect(useRecycleBinStore.getState().xp).toBe(XP_CONFIG.DELETE_PHOTO);
    expect(mediaLibrary.deletePhotoAsset).not.toHaveBeenCalled();

    const restored = restorePhoto('1');
    expect(restored).toEqual(photo);
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(0);
    expect(useRecycleBinStore.getState().xp).toBe(XP_CONFIG.DELETE_PHOTO + XP_CONFIG.RESTORE_PHOTO);
    expect(mediaLibrary.deletePhotoAsset).not.toHaveBeenCalled();
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
    expect(useRecycleBinStore.getState().xp).toBe(
      XP_CONFIG.DELETE_PHOTO * 2 + XP_CONFIG.PERMANENT_DELETE + XP_CONFIG.CLEAR_ALL
    );
  });

  it('keeps photo and XP unchanged when permanent delete fails', async () => {
    const { addDeletedPhoto, permanentlyDelete } = useRecycleBinStore.getState();
    addDeletedPhoto(createPhoto('1'));
    (mediaLibrary.deletePhotoAsset as jest.Mock).mockResolvedValueOnce(false);

    await expect(permanentlyDelete('1')).resolves.toBe(false);

    // Photo should remain because deletion failed
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    // XP should not include permanent delete reward
    expect(useRecycleBinStore.getState().xp).toBe(XP_CONFIG.DELETE_PHOTO);
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
    // XP should only reflect initial deletes
    expect(useRecycleBinStore.getState().xp).toBe(XP_CONFIG.DELETE_PHOTO * 2);
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
    expect(useRecycleBinStore.getState().xp).toBe(0);
    await store.resetOnboarding();
    expect(useRecycleBinStore.getState().onboardingCompleted).toBe(false);
  });
  it('loads xp and deleted photos from storage', async () => {
    const { getAsyncStorage } = await import('../lib/asyncStorageWrapper');
    const storage = getAsyncStorage();
    await storage.setItem('@decluttr_xp', '15');
    await storage.setItem('@decluttr_deleted_photos', JSON.stringify([createPhoto('a')]));
    await storage.setItem('@decluttr_total_deleted', '5');
    useRecycleBinStore.setState({
      deletedPhotos: [],
      xp: 0,
      isXpLoaded: false,
      onboardingCompleted: false,
    });
    await useRecycleBinStore.getState().loadXP();
    await useRecycleBinStore.getState().loadDeletedPhotos();
    await useRecycleBinStore.getState().loadTotalDeleted();
    expect(useRecycleBinStore.getState().xp).toBe(15);
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    expect(useRecycleBinStore.getState().totalDeleted).toBe(5);
  });

  it('addXP and subtractXP clamp at zero', async () => {
    const store = useRecycleBinStore.getState();
    await store.addXP(10);
    await store.subtractXP(5);
    expect(useRecycleBinStore.getState().xp).toBe(5);
    await store.subtractXP(20);
    expect(useRecycleBinStore.getState().xp).toBe(0);
  });

  it('skips XP changes when zen mode is active', async () => {
    useRecycleBinStore.setState({ zenMode: true });
    const store = useRecycleBinStore.getState();
    await store.addXP(10);
    expect(useRecycleBinStore.getState().xp).toBe(0);
    await store.subtractXP(5);
    expect(useRecycleBinStore.getState().xp).toBe(0);
  });

  it('onboarding status persists', async () => {
    const store = useRecycleBinStore.getState();
    await store.completeOnboarding();
    const completed = await store.checkOnboardingStatus();
    expect(completed).toBe(true);
  });
});
