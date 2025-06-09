import { getAsyncStorage } from '../lib/asyncStorageWrapper';

describe('getAsyncStorage', () => {
  it('returns AsyncStorage when available', async () => {
    jest.resetModules();
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      default: {
        getItem: jest.fn().mockResolvedValue('v'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
    }));
    const { getAsyncStorage } = await import('../lib/asyncStorageWrapper');
    const storage = getAsyncStorage();
    await storage.setItem('k', 'v');
    expect(await storage.getItem('k')).toBe('v');
  });

  it('falls back to memory storage when AsyncStorage missing', async () => {
    jest.resetModules();
    jest.doMock('@react-native-async-storage/async-storage', () => undefined);
    const { getAsyncStorage } = await import('../lib/asyncStorageWrapper');
    const storage = getAsyncStorage();
    await storage.setItem('a', 'b');
    expect(await storage.getItem('a')).toBe('b');
  });
});
