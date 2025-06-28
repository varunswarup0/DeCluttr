// @ts-nocheck
import React from 'react';
import { act, create } from 'react-test-renderer';
import { jest } from '@jest/globals';

import { useAudioSettings } from '../lib/useAudioSettings';

const memory: Record<string, string> = {};
jest.mock('../lib/asyncStorageWrapper', () => ({
  getAsyncStorage: () => ({
    getItem: async (k: string) => memory[k] ?? null,
    setItem: async (k: string, v: string) => {
      memory[k] = v;
    },
  }),
}));

beforeEach(() => {
  Object.keys(memory).forEach((k) => delete memory[k]);
});

test('loads defaults and toggles', async () => {
  let hook: ReturnType<typeof useAudioSettings>;
  function Test() {
    hook = useAudioSettings();
    return null;
  }
  await act(async () => {
    create(<Test />);
  });
  await act(async () => {}); // wait for effect
  expect(hook!.isLoaded).toBe(true);
  expect(hook!.settings.enabled).toBe(true);
  await act(async () => {
    hook!.toggleAudio();
  });
  expect(hook!.settings.enabled).toBe(false);
  const { getAsyncStorage } = await import('../lib/asyncStorageWrapper');
  const storage = getAsyncStorage();
  expect(await storage.getItem('decluttr_audio_settings')).toContain('false');
});
