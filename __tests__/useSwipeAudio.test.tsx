// @ts-nocheck
import React from 'react';
import { act, create } from 'react-test-renderer';
import { jest } from '@jest/globals';
import * as Haptics from 'expo-haptics';

import { useSwipeAudio } from '../lib/useSwipeAudio';

jest.mock('../lib/useAudioSettings', () => ({
  useAudioSettings: () => ({
    settings: { enabled: true, volume: 0.8 },
    isLoaded: true,
  }),
}));

// eslint-disable-next-line no-var
var mockAudio: any;
jest.mock('../lib/audioService', () => {
  mockAudio = {
    initialize: jest.fn().mockResolvedValue(undefined),
    setVolume: jest.fn().mockResolvedValue(undefined),
    setEnabled: jest.fn().mockResolvedValue(undefined),
    playDeleteSound: jest.fn(),
    playKeepSound: jest.fn(),
  };
  return { audioService: mockAudio };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Heavy: 'heavy', Light: 'light' },
}));

test('useSwipeAudio triggers audio and haptics', async () => {
  let hook: ReturnType<typeof useSwipeAudio>;
  function Test() {
    hook = useSwipeAudio();
    return null;
  }
  await act(async () => {
    create(<Test />);
  });

  await act(async () => {
    hook!.playDeleteSound();
  });
  await act(async () => {
    hook!.playKeepSound();
  });

  expect(mockAudio.playDeleteSound).toHaveBeenCalled();
  expect(mockAudio.playKeepSound).toHaveBeenCalled();
  expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
  expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
});
