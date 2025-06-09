# DeCluttr

Minimal photo clean-up game built with Expo React Native.
**Android only** – other platforms are not supported.

## Visual style

The interface uses a light pastel palette and the rounded **Quicksand** font for
a friendly, game-like feel. Buttons and cards animate subtly with scale and
sound effects on taps or swipes, making the experience playful yet minimal.

## Prerequisites
- Node.js 18+
- npm 9+

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
   This automatically applies the audio patch via `patch-package`. If you see an error about
   `expo-audio+0.4.5.patch` failing, delete `node_modules` and run:
   ```bash
   npm install && npx patch-package
   ```
2. Add sound effects by following the instructions in `assets/sounds/SETUP_INSTRUCTIONS.md`.
3. Use fun, game‑inspired sounds: a quick "zap" for delete and a cheerful "coin" for keep.
4. For a nostalgic feel, pick short 8-bit style clips reminiscent of retro Nintendo games.
5. The `audioService` will load these sounds automatically and handle failures gracefully.

## Running the App on Android
```bash
npm start
```

XP and onboarding progress are stored using AsyncStorage. If storage is
unavailable, an in-memory fallback ensures the app still works.

## App Flow

1. **Launch / Onboarding**
   - On first launch the app displays a short onboarding explaining how swiping works.
   - Completion is remembered so subsequent launches jump straight into the game.
2. **Gallery Game**
   - A stack of recent photos is loaded.
   - Swipe **left** to delete (plays a sound and grants XP) or **right** to keep.
   - When the stack is empty an alert summarizes how many photos you deleted and XP earned.
3. **Recycle Bin**
   - Deleted photos move to a recycle bin tab.
   - You can restore or permanently delete them here; permanent deletion grants bonus XP.

The minimal build removes additional tabs like Gallery, Tree, and Stats to keep the focus on photo cleanup.

For more details on specific systems see:
- `AUDIO_SYSTEM_README.md`
- `ONBOARDING_README.md`
- `XP_SYSTEM_README.md`

## Future Work
See [TODO.md](TODO.md) for planned improvements and feature ideas.
