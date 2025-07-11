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
  RESTORE_PHOTO: -5,
  PERMANENT_DELETE: 5,
  CLEAR_ALL: 2, // per photo cleared
} as const;

// Storage keys
const XP_STORAGE_KEY = '@decluttr_xp';
const ONBOARDING_STORAGE_KEY = '@decluttr_onboarding_completed';
const DELETED_PHOTOS_STORAGE_KEY = '@decluttr_deleted_photos';
const TOTAL_DELETED_STORAGE_KEY = '@decluttr_total_deleted';
const ZEN_MODE_STORAGE_KEY = '@decluttr_zen_mode';

// RecycleBin types
export interface DeletedPhoto {
  id: string;
  imageUri: string;
  deletedAt: Date;
  originalIndex?: number;
}

export interface RecycleBinState {
  deletedPhotos: DeletedPhoto[];
  totalDeleted: number;
  xp: number;
  isXpLoaded: boolean;
  onboardingCompleted: boolean;
  zenMode: boolean;
  addDeletedPhoto: (photo: DeletedPhoto) => void;
  restorePhoto: (photoId: string) => DeletedPhoto | null;
  permanentlyDelete: (photoId: string) => Promise<boolean>;
  clearRecycleBin: () => Promise<boolean>;
  /**
   * Permanently remove photos that have been in the recycle bin for more than
   * 30 days. This does not award XP since it's an automatic cleanup.
   */
  purgeExpiredPhotos: () => Promise<void>;
  loadDeletedPhotos: () => Promise<void>;
  saveDeletedPhotos: (photos: DeletedPhoto[]) => Promise<void>;
  loadTotalDeleted: () => Promise<void>;
  saveTotalDeleted: (count: number) => Promise<void>;
  getDeletedPhoto: (photoId: string) => DeletedPhoto | undefined;
  loadXP: () => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  subtractXP: (amount: number) => Promise<void>;
  resetGallery: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  loadZenMode: () => Promise<void>;
  setZenMode: (enabled: boolean) => Promise<void>;
}

export const useRecycleBinStore = create<RecycleBinState>((set, get) => ({
  deletedPhotos: [],
  totalDeleted: 0,
  xp: 0,
  isXpLoaded: false,
  onboardingCompleted: false,
  zenMode: false,

  // Helper to persist deleted photos
  saveDeletedPhotos: async (photos: DeletedPhoto[]) => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(DELETED_PHOTOS_STORAGE_KEY, JSON.stringify(photos));
    } catch (error) {
      console.error('Failed to save deleted photos:', error);
    }
  },

  saveTotalDeleted: async (count: number) => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(TOTAL_DELETED_STORAGE_KEY, count.toString());
    } catch (error) {
      console.error('Failed to save total deleted count:', error);
    }
  },

  loadTotalDeleted: async () => {
    try {
      const storage = getAsyncStorage();
      const stored = await storage.getItem(TOTAL_DELETED_STORAGE_KEY);
      const count = stored ? parseInt(stored, 10) : 0;
      set({ totalDeleted: isNaN(count) ? 0 : count });
    } catch (error) {
      console.error('Failed to load total deleted count:', error);
      set({ totalDeleted: 0 });
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

  loadZenMode: async () => {
    try {
      const storage = getAsyncStorage();
      const stored = await storage.getItem(ZEN_MODE_STORAGE_KEY);
      set({ zenMode: stored === 'true' });
    } catch (error) {
      console.error('Failed to load zen mode:', error);
      set({ zenMode: false });
    }
  },

  setZenMode: async (enabled: boolean) => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(ZEN_MODE_STORAGE_KEY, String(enabled));
      set({ zenMode: enabled });
    } catch (error) {
      console.error('Failed to save zen mode:', error);
      set({ zenMode: enabled });
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
      const { xp, zenMode } = get();
      if (zenMode) {
        return;
      }
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
      const { xp, zenMode } = get();
      if (zenMode) {
        return;
      }
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
    const { deletedPhotos, totalDeleted } = get();
    if (deletedPhotos.some((p) => p.id === photo.id)) {
      return;
    }
    const updated = [photo, ...deletedPhotos];
    const newTotal = totalDeleted + 1;
    set({ deletedPhotos: updated, totalDeleted: newTotal });
    get().saveDeletedPhotos(updated);
    get().saveTotalDeleted(newTotal);
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
      // Update XP for restoring a photo (negative value deducts XP)
      get().addXP(XP_CONFIG.RESTORE_PHOTO);
      return photoToRestore;
    }

    return null;
  },

  permanentlyDelete: async (photoId: string): Promise<boolean> => {
    const photo = get().deletedPhotos.find((p) => p.id === photoId);
    if (!photo) {
      return false; // nothing to delete
    }

    const success = await deletePhotoAsset(photo.id).catch((err) => {
      console.error('Failed to delete photo asset:', err);
      return false;
    });

    if (!success) {
      return false; // keep photo if deletion failed
    }

    const updated = get().deletedPhotos.filter((p) => p.id !== photoId);
    set({ deletedPhotos: updated });
    await get().saveDeletedPhotos(updated);
    // Add XP for permanently deleting a photo
    await get().addXP(XP_CONFIG.PERMANENT_DELETE);
    return true;
  },

  clearRecycleBin: async (): Promise<boolean> => {
    const { deletedPhotos } = get();
    const photosCount = deletedPhotos.length;
    if (photosCount > 0) {
      const success = await deletePhotoAssets(deletedPhotos.map((p) => p.id)).catch((err) => {
        console.error('Failed to delete photo assets:', err);
        return false;
      });
      if (!success) {
        return false; // abort if deletion failed
      }
    }
    set({ deletedPhotos: [] });
    await get().saveDeletedPhotos([]);
    // Add XP for clearing recycle bin (per photo)
    await get().addXP(XP_CONFIG.CLEAR_ALL * photosCount);
    return true;
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

    const success = await deletePhotoAssets(expired.map((p) => p.id)).catch((err) => {
      console.error('Failed to purge old photo assets:', err);
      return false;
    });
    if (!success) {
      return;
    }

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
      set({ deletedPhotos: [], totalDeleted: 0 });
      await get().saveDeletedPhotos([]);
      await get().saveTotalDeleted(0);

      // Reset XP to 0 and mark as loaded
      set({ xp: 0, isXpLoaded: true });

      // Save the reset XP to storage using fallback mechanism if needed
      const storage = getAsyncStorage();
      await storage.setItem(XP_STORAGE_KEY, '0');
    } catch (error) {
      console.error('Failed to reset gallery:', error);
      // Make sure the state is reset even if storage fails
      set({ deletedPhotos: [], totalDeleted: 0, xp: 0, isXpLoaded: true });
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
