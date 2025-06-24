import { jest } from '@jest/globals';
import { audioService } from '../lib/audioService';

// mock expo-audio createAudioPlayer
const mockPlayer = () => ({
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  seekTo: jest.fn(),
  remove: jest.fn(),
  volume: 0,
});

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => mockPlayer()),
}));

// mock asset requires
jest.mock('../assets/sounds/delete.mp3', () => 1, { virtual: true });
jest.mock('../assets/sounds/keep.mp3', () => 1, { virtual: true });
jest.mock('../assets/sounds/voice1.mp3', () => 1, { virtual: true });
jest.mock('../assets/sounds/voice2.mp3', () => 1, { virtual: true });

// simple memory storage
const memory: Record<string, string> = {};
jest.mock('../lib/asyncStorageWrapper', () => ({
  getAsyncStorage: () => ({
    getItem: async (k: string) => memory[k] ?? null,
    setItem: async (k: string, v: string) => {
      memory[k] = v;
    },
    removeItem: async (k: string) => {
      delete memory[k];
    },
  }),
}));

const { createAudioPlayer } = require('expo-audio');

beforeEach(async () => {
  Object.keys(memory).forEach((k) => delete memory[k]);
  jest.clearAllMocks();
  await audioService.cleanup();
});

test('initialize loads players with stored volume', async () => {
  memory['decluttr_audio_settings'] = JSON.stringify({ volume: 0.5, enabled: true });
  await audioService.initialize();
  expect(createAudioPlayer).toHaveBeenCalledTimes(5);
  const players = (createAudioPlayer as jest.Mock).mock.results.map((r) => r.value as any);
  expect(players[0].volume).toBe(0.5);
  expect(players[1].volume).toBe(0.5);
});

test('plays delete and keep sounds when enabled', async () => {
  memory['decluttr_audio_settings'] = JSON.stringify({ volume: 1, enabled: true });
  await audioService.playDeleteSound();
  await audioService.playKeepSound();
  await new Promise((r) => setTimeout(r, 350));
  const players = (createAudioPlayer as jest.Mock).mock.results.map((r) => r.value as any);
  expect(players[0].seekTo).toHaveBeenCalledWith(0);
  expect(players[0].play).toHaveBeenCalled();
  expect(players[1].seekTo).toHaveBeenCalledWith(0);
  expect(players[1].play).toHaveBeenCalled();
  // voice clips are loaded as well
  expect(createAudioPlayer).toHaveBeenCalledTimes(5);
});

test('setVolume updates players and storage', async () => {
  memory['decluttr_audio_settings'] = JSON.stringify({ volume: 0.2, enabled: true });
  await audioService.initialize();
  await audioService.setVolume(0.3);
  const players = (createAudioPlayer as jest.Mock).mock.results.map((r) => r.value as any);
  expect(players[0].volume).toBe(0.3);
  expect(players[1].volume).toBe(0.3);
  const storage = require('../lib/asyncStorageWrapper').getAsyncStorage();
  expect(await storage.getItem('decluttr_audio_settings')).toContain('0.3');
});

test('cleanup removes players and allows reinit', async () => {
  await audioService.initialize();
  await audioService.cleanup();
  expect(createAudioPlayer).toHaveBeenCalledTimes(5);
  jest.clearAllMocks();
  await audioService.playDeleteSound();
  expect(createAudioPlayer).toHaveBeenCalledTimes(5); // reinitializes
});

test('playRandomVoice plays one clip when enabled', async () => {
  memory['decluttr_audio_settings'] = JSON.stringify({ volume: 1, enabled: true });
  await audioService.playRandomVoice();
  await new Promise((r) => setTimeout(r, 350));
  const players = (createAudioPlayer as jest.Mock).mock.results.map((r) => r.value as any);
  const plays = players.slice(3).map((p: any) => p.play.mock.calls.length);
  expect(plays[0] + plays[1]).toBe(1);
});
