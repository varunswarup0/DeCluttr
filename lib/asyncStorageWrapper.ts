import AsyncStorage from '@react-native-async-storage/async-storage';

// simple in-memory storage fallback
const memoryStorage: Record<string, string> = {};

/**
 * Return AsyncStorage if available, otherwise an in-memory fallback.
 */
export const getAsyncStorage = () => {
  if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
    return AsyncStorage;
  }
  return {
    getItem: async (key: string) => memoryStorage[key] ?? null,
    setItem: async (key: string, value: string) => {
      memoryStorage[key] = value;
    },
    removeItem: async (key: string) => {
      delete memoryStorage[key];
    },
  } as Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>;
};
