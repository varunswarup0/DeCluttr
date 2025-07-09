# Audio System

`audioService` preloads MP3 clips for delete and keep actions using Expo's audio API. Optional voice clips are also loaded if present.

Volume and enabled state are stored in AsyncStorage and applied to all players. If any sound is missing the service creates silent mock players so the game runs without errors.

Hooks in `lib/useSwipeAudio.ts` expose simple methods for components to play sounds during swipes.
