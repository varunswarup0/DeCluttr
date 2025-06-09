import { create } from 'zustand';
import { getAsyncStorage } from '~/lib/asyncStorageWrapper';
import { deletePhotoAsset, deletePhotoAssets } from '~/lib/mediaLibrary';
export interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

export const useStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));

// XP Constants
export const XP_CONFIG = {
  DELETE_PHOTO: 10,
  RESTORE_PHOTO: 5,
  PERMANENT_DELETE: 5,
  CLEAR_ALL: 2, // per photo cleared
} as const;

// Storage keys
const XP_STORAGE_KEY = '@decluttr_xp';
const ONBOARDING_STORAGE_KEY = '@decluttr_onboarding_completed';
const DELETED_PHOTOS_STORAGE_KEY = '@decluttr_deleted_photos';

// RecycleBin types
export interface DeletedPhoto {
  id: string;
  imageUri: string;
  deletedAt: Date;
  originalIndex?: number;
}

export interface RecycleBinState {
  deletedPhotos: DeletedPhoto[];
  xp: number;
  isXpLoaded: boolean;
  onboardingCompleted: boolean;
  addDeletedPhoto: (photo: DeletedPhoto) => void;
  restorePhoto: (photoId: string) => DeletedPhoto | null;
  permanentlyDelete: (photoId: string) => Promise<void>;
  clearRecycleBin: () => Promise<void>;
  /**
   * Permanently remove photos that have been in the recycle bin for more than
   * 30 days. This does not award XP since it's an automatic cleanup.
   */
  purgeExpiredPhotos: () => Promise<void>;
  loadDeletedPhotos: () => Promise<void>;
  saveDeletedPhotos: (photos: DeletedPhoto[]) => Promise<void>;
  getDeletedPhoto: (photoId: string) => DeletedPhoto | undefined;
  loadXP: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  subtractXP: (amount: number) => Promise<void>;
  resetGallery: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useRecycleBinStore = create<RecycleBinState>((set, get) => ({
  deletedPhotos: [],
  xp: 0,
  isXpLoaded: false,
  onboardingCompleted: false,

  // Helper to persist deleted photos
  saveDeletedPhotos: async (photos: DeletedPhoto[]) => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(DELETED_PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    } catch (error) {
      console.error('Failed to save deleted photos:', error);
    }
  },

  // Load XP from AsyncStorage on app startup
  loadXP: async () => {
    try {
      const storage = getAsyncStorage();
      const storedXP = await storage.getItem(XP_STORAGE_KEY);
      let xp = storedXP ? parseInt(storedXP, 10) : 0;
      if (isNaN(xp)) {
        xp = 0;
      }
      set({ xp, isXpLoaded: true });
    } catch (error) {
      console.error('Error in loadXP:', error);
      // If there's an error, just mark as loaded with 0 XP
      set({ xp: 0, isXpLoaded: true });
    }
  },

  // Load deleted photos from storage on startup
  loadDeletedPhotos: async () => {
    try {
      const storage = getAsyncStorage();
      const data = await storage.getItem(DELETED_PHOTOS_STORAGE_KEY);
      if (data) {
        const parsed: DeletedPhoto[] = JSON.parse(data, (key, value) =>
          key === 'deletedAt' ? new Date(value) : value
        );
        set({ deletedPhotos: parsed });
        // Remove any items older than 30 days on startup
        await get().purgeExpiredPhotos();
      }
    } catch (error) {
      console.error('Failed to load deleted photos:', error);
    }
  },

  // Add XP and save to storage
  addXP: async (amount: number) => {
    try {
      const { xp } = get();
      const newXP = Math.max(0, xp + amount); // Prevent negative XP
      set({ xp: newXP });

      // Save to storage using the fallback mechanism if needed
      const storage = getAsyncStorage();
      await storage.setItem(XP_STORAGE_KEY, newXP.toString());
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  },

  // Subtract XP and save to storage
  subtractXP: async (amount: number) => {
    try {
      const { xp } = get();
      const newXP = Math.max(0, xp - amount); // Prevent negative XP
      set({ xp: newXP });

      // Save to storage using the fallback mechanism if needed
      const storage = getAsyncStorage();
      await storage.setItem(XP_STORAGE_KEY, newXP.toString());
    } catch (error) {
      console.error('Failed to subtract XP:', error);
    }
  },

  addDeletedPhoto: (photo: DeletedPhoto) => {
    const { deletedPhotos } = get();
    if (deletedPhotos.some((p) => p.id === photo.id)) {
      return;
    }
    const updated = [photo, ...deletedPhotos];
    set({ deletedPhotos: updated });
    get().saveDeletedPhotos(updated);
    // Add XP for deleting a photo
    get().addXP(XP_CONFIG.DELETE_PHOTO);
  },

  restorePhoto: (photoId: string) => {
    const state = get();
    const photoToRestore = state.deletedPhotos.find((photo) => photo.id === photoId);

    if (photoToRestore) {
      const updated = state.deletedPhotos.filter((photo) => photo.id !== photoId);
      set({ deletedPhotos: updated });
      get().saveDeletedPhotos(updated);
      // Subtract XP for restoring a photo
      get().subtractXP(XP_CONFIG.RESTORE_PHOTO);
      return photoToRestore;
    }

    return null;
  },

  permanentlyDelete: async (photoId: string) => {
    const photo = get().deletedPhotos.find((p) => p.id === photoId);
    if (photo) {
      await deletePhotoAsset(photo.id).catch((err) => {
        console.error('Failed to delete photo asset:', err);
      });
    }

    const updated = get().deletedPhotos.filter((p) => p.id !== photoId);
    set({ deletedPhotos: updated });
    await get().saveDeletedPhotos(updated);
    // Add XP for permanently deleting a photo
    await get().addXP(XP_CONFIG.PERMANENT_DELETE);
  },

  clearRecycleBin: async () => {
    const { deletedPhotos } = get();
    const photosCount = deletedPhotos.length;
    if (photosCount > 0) {
      await deletePhotoAssets(deletedPhotos.map((p) => p.id)).catch((err) => {
        console.error('Failed to delete photo assets:', err);
      });
    }
    set({ deletedPhotos: [] });
    await get().saveDeletedPhotos([]);
    // Add XP for clearing recycle bin (per photo)
    await get().addXP(XP_CONFIG.CLEAR_ALL * photosCount);
  },

  purgeExpiredPhotos: async () => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const expired = get().deletedPhotos.filter(
      (p) => now - new Date(p.deletedAt).getTime() > THIRTY_DAYS_MS
    );

    if (expired.length === 0) {
      return;
    }

    await deletePhotoAssets(expired.map((p) => p.id)).catch((err) => {
      console.error('Failed to purge old photo assets:', err);
    });

    const updated = get().deletedPhotos.filter(
      (p) => now - new Date(p.deletedAt).getTime() <= THIRTY_DAYS_MS
    );
    set({ deletedPhotos: updated });
    await get().saveDeletedPhotos(updated);
  },

  getDeletedPhoto: (photoId: string) => {
    const state = get();
    return state.deletedPhotos.find((photo) => photo.id === photoId);
  },

  resetGallery: async () => {
    try {
      // Reset deleted photos array
      set({ deletedPhotos: [] });
      await get().saveDeletedPhotos([]);

      // Reset XP to 0
      set({ xp: 0 });

      // Save the reset XP to storage using fallback mechanism if needed
      const storage = getAsyncStorage();
      await storage.setItem(XP_STORAGE_KEY, '0');
    } catch (error) {
      console.error('Failed to reset gallery:', error);
      // Make sure the state is reset even if storage fails
      set({ deletedPhotos: [], xp: 0 });
    }
  },

  checkOnboardingStatus: async () => {
    try {
      const storage = getAsyncStorage();
      const completed = await storage.getItem(ONBOARDING_STORAGE_KEY);
      const isCompleted = completed === 'true';
      set({ onboardingCompleted: isCompleted });
      return isCompleted;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to not completed if there's an error
      set({ onboardingCompleted: false });
      return false;
    }
  },

  completeOnboarding: async () => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      set({ onboardingCompleted: true });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Make sure the state is updated even if storage fails
      set({ onboardingCompleted: true });
    }
  },
  resetOnboarding: async () => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(ONBOARDING_STORAGE_KEY, 'false');
      set({ onboardingCompleted: false });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Make sure the state is updated even if storage fails
      set({ onboardingCompleted: false });
    }
  },
}));
