// @ts-nocheck
import { backgroundMusicService } from '../lib/backgroundMusic';

const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
  remove: jest.fn(),
  loop: false,
  volume: 0,
};

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => mockPlayer),
}));

jest.mock('../assets/music/background.mp3', () => 1, { virtual: true });

beforeEach(() => {
  jest.clearAllMocks();
});

test('background music plays and stops', async () => {
  await backgroundMusicService.play();
  expect(mockPlayer.play).toHaveBeenCalled();
  await backgroundMusicService.stop();
  expect(mockPlayer.pause).toHaveBeenCalled();
  expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
});
