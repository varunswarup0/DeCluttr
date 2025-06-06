import { create } from 'zustand';
import { getAsyncStorage } from '~/lib/asyncStorageWrapper';
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
  permanentlyDelete: (photoId: string) => void;
  clearRecycleBin: () => void;
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
    set({ deletedPhotos: [photo, ...deletedPhotos] });
    // Add XP for deleting a photo
    get().addXP(XP_CONFIG.DELETE_PHOTO);
  },

  restorePhoto: (photoId: string) => {
    const state = get();
    const photoToRestore = state.deletedPhotos.find((photo) => photo.id === photoId);

    if (photoToRestore) {
      set((state) => ({
        deletedPhotos: state.deletedPhotos.filter((photo) => photo.id !== photoId),
      }));
      // Subtract XP for restoring a photo
      get().subtractXP(XP_CONFIG.RESTORE_PHOTO);
      return photoToRestore;
    }

    return null;
  },

  permanentlyDelete: (photoId: string) => {
    set((state) => ({
      deletedPhotos: state.deletedPhotos.filter((photo) => photo.id !== photoId),
    }));
    // Add XP for permanently deleting a photo
    get().addXP(XP_CONFIG.PERMANENT_DELETE);
  },

  clearRecycleBin: () => {
    const { deletedPhotos } = get();
    const photosCount = deletedPhotos.length;
    set({ deletedPhotos: [] });
    // Add XP for clearing recycle bin (per photo)
    get().addXP(XP_CONFIG.CLEAR_ALL * photosCount);
  },

  getDeletedPhoto: (photoId: string) => {
    const state = get();
    return state.deletedPhotos.find((photo) => photo.id === photoId);
  },

  resetGallery: async () => {
    try {
      // Reset deleted photos array
      set({ deletedPhotos: [] });

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
