import { create } from 'zustand';
import { getAsyncStorage } from '~/lib/asyncStorageWrapper';
import { deletePhotoAsset, deletePhotoAssets } from '~/lib/mediaLibrary';

// XP Constants
// XP system removed for a leaner gameplay loop

// Storage keys
const ONBOARDING_STORAGE_KEY = '@decluttr_onboarding_completed';
const DELETED_PHOTOS_STORAGE_KEY = '@decluttr_deleted_photos';
const TOTAL_DELETED_STORAGE_KEY = '@decluttr_total_deleted';
const ZEN_MODE_STORAGE_KEY = '@decluttr_zen_mode';
const NAV_MODE_STORAGE_KEY = '@decluttr_navigation_mode';
const DELETE_WARNING_KEY = '@decluttr_delete_warning_shown';

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
  onboardingCompleted: boolean;
  zenMode: boolean;
  navigationMode: boolean;
  deleteWarningShown: boolean;
  addDeletedPhoto: (photo: DeletedPhoto) => void;
  restorePhoto: (photoId: string) => DeletedPhoto | null;
  permanentlyDelete: (photoId: string) => Promise<boolean>;
  permanentlyDeleteMany: (photoIds: string[]) => Promise<boolean>;
  restorePhotos: (photoIds: string[]) => DeletedPhoto[];
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
  resetGallery: () => Promise<void>;
  checkOnboardingStatus: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  loadZenMode: () => Promise<void>;
  setZenMode: (enabled: boolean) => Promise<void>;
  loadNavigationMode: () => Promise<void>;
  setNavigationMode: (enabled: boolean) => Promise<void>;
  loadDeleteWarningShown: () => Promise<void>;
  setDeleteWarningShown: (shown: boolean) => Promise<void>;
}

export const useRecycleBinStore = create<RecycleBinState>((set, get) => ({
  deletedPhotos: [],
  totalDeleted: 0,
  onboardingCompleted: false,
  zenMode: false,
  navigationMode: true,
  deleteWarningShown: true,

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

  loadNavigationMode: async () => {
    try {
      const storage = getAsyncStorage();
      const stored = await storage.getItem(NAV_MODE_STORAGE_KEY);
      set({ navigationMode: stored !== null ? stored === 'true' : true });
    } catch (error) {
      console.error('Failed to load navigation mode:', error);
      set({ navigationMode: true });
    }
  },

  setNavigationMode: async (enabled: boolean) => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(NAV_MODE_STORAGE_KEY, String(enabled));
      set({ navigationMode: enabled });
    } catch (error) {
      console.error('Failed to save navigation mode:', error);
      set({ navigationMode: enabled });
    }
  },

  loadDeleteWarningShown: async () => {
    try {
      const storage = getAsyncStorage();
      const stored = await storage.getItem(DELETE_WARNING_KEY);
      set({ deleteWarningShown: stored === 'true' });
    } catch (error) {
      console.error('Failed to load delete warning flag:', error);
      set({ deleteWarningShown: true });
    }
  },

  setDeleteWarningShown: async (shown: boolean) => {
    try {
      const storage = getAsyncStorage();
      await storage.setItem(DELETE_WARNING_KEY, String(shown));
      set({ deleteWarningShown: shown });
    } catch (error) {
      console.error('Failed to save delete warning flag:', error);
      set({ deleteWarningShown: shown });
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
  },

  restorePhoto: (photoId: string) => {
    const state = get();
    const photoToRestore = state.deletedPhotos.find((photo) => photo.id === photoId);

    if (photoToRestore) {
      const updated = state.deletedPhotos.filter((photo) => photo.id !== photoId);
      set({ deletedPhotos: updated });
      get().saveDeletedPhotos(updated);
      return photoToRestore;
    }

    return null;
  },

  restorePhotos: (photoIds: string[]) => {
    const restored: DeletedPhoto[] = [];
    const remaining = get().deletedPhotos.filter((p) => {
      if (photoIds.includes(p.id)) {
        restored.push(p);
        return false;
      }
      return true;
    });
    set({ deletedPhotos: remaining });
    get().saveDeletedPhotos(remaining);
    return restored;
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
    return true;
  },

  permanentlyDeleteMany: async (photoIds: string[]): Promise<boolean> => {
    const existing = get().deletedPhotos.filter((p) => photoIds.includes(p.id));
    if (existing.length === 0) {
      return true;
    }
    const success = await deletePhotoAssets(existing.map((p) => p.id)).catch((err) => {
      console.error('Failed to delete photo assets:', err);
      return false;
    });
    if (!success) {
      return false;
    }
    const updated = get().deletedPhotos.filter((p) => !photoIds.includes(p.id));
    set({ deletedPhotos: updated });
    await get().saveDeletedPhotos(updated);
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
    return true;
  },

  purgeExpiredPhotos: async () => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const expired = get().deletedPhotos.filter((p) => now - p.deletedAt.getTime() > THIRTY_DAYS_MS);

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
      (p) => now - p.deletedAt.getTime() <= THIRTY_DAYS_MS
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

      // XP tracking removed
    } catch (error) {
      console.error('Failed to reset gallery:', error);
      // Make sure the state is reset even if storage fails
      set({ deletedPhotos: [], totalDeleted: 0 });
    }
  },

  checkOnboardingStatus: async () => {
    try {
      // If we already have the flag in memory, prefer it to avoid extra storage
      // reads during navigation
      if (get().onboardingCompleted) {
        return true;
      }
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
