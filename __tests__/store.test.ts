import { useRecycleBinStore, XP_CONFIG, DeletedPhoto } from '../store/store';

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
  deletePhotoAsset: jest.fn().mockResolvedValue(undefined),
  deletePhotoAssets: jest.fn().mockResolvedValue(undefined),
}));

const createPhoto = (id: string): DeletedPhoto => ({
  id,
  imageUri: `uri-${id}`,
  deletedAt: new Date(),
});

describe('RecycleBin store', () => {
  beforeEach(() => {
    useRecycleBinStore.setState({ deletedPhotos: [], totalDeleted: 0, xp: 0, isXpLoaded: true, onboardingCompleted: false });
  });

  it('adds and restores photos with XP updates', async () => {
    const { addDeletedPhoto, restorePhoto } = useRecycleBinStore.getState();
    addDeletedPhoto(createPhoto('1'));
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    expect(useRecycleBinStore.getState().totalDeleted).toBe(1);
    expect(useRecycleBinStore.getState().xp).toBe(XP_CONFIG.DELETE_PHOTO);

    restorePhoto('1');
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(0);
    expect(useRecycleBinStore.getState().xp).toBe((XP_CONFIG.DELETE_PHOTO - XP_CONFIG.RESTORE_PHOTO));
  });

  it('permanently deletes photos and clears recycle bin', async () => {
    const { addDeletedPhoto, permanentlyDelete, clearRecycleBin } = useRecycleBinStore.getState();
    addDeletedPhoto(createPhoto('1'));
    addDeletedPhoto(createPhoto('2'));
    await permanentlyDelete('1');
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    await clearRecycleBin();
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(0);
    expect(useRecycleBinStore.getState().xp).toBeGreaterThan(0);
  });

  it('purges expired photos', async () => {
    const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    useRecycleBinStore.setState({ deletedPhotos: [{...createPhoto('old'), deletedAt: oldDate}, { ...createPhoto('new'), deletedAt: new Date() }] });
    await useRecycleBinStore.getState().purgeExpiredPhotos();
    expect(useRecycleBinStore.getState().deletedPhotos).toHaveLength(1);
    expect(useRecycleBinStore.getState().deletedPhotos[0].id).toBe('new');
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
    const storage = require('../lib/asyncStorageWrapper').getAsyncStorage();
    await storage.setItem('@decluttr_xp', '15');
    await storage.setItem('@decluttr_deleted_photos', JSON.stringify([createPhoto('a')]));
    await storage.setItem('@decluttr_total_deleted', '5');
    useRecycleBinStore.setState({ deletedPhotos: [], xp: 0, isXpLoaded: false, onboardingCompleted: false });
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

  it('onboarding status persists', async () => {
    const store = useRecycleBinStore.getState();
    await store.completeOnboarding();
    const completed = await store.checkOnboardingStatus();
    expect(completed).toBe(true);
  });
});
