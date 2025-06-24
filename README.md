# DeCluttr

Minimal photo clean-up game built with Expo React Native.
It features a small bird mascot inspired by **Flappy Bird** that celebrates your progress.
**Android only** – other platforms are not supported.
Pixel-accurate fonts and icons keep the UI razor sharp. Preloaded sounds and haptics
give instant feedback as soon as you start swiping so the game feels snappy and fun.

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
2. The Inter font and a retro "Press Start 2P" font are bundled and load automatically on startup. Update `lib/useCustomFonts.ts` and `tailwind.config.js` if you prefer different typefaces.
3. Add sound effects by following the instructions in `assets/sounds/SETUP_INSTRUCTIONS.md`.
4. (Optional) Place a music file at `assets/music/background.mp3` to enable looping background music. The app starts this track automatically.
5. Use fun, game‑inspired sounds: a quick "zap" for delete and a cheerful "coin" for keep. A short `tap.mp3` adds feedback on button presses.
6. For a nostalgic feel, pick short 8-bit style clips reminiscent of retro Nintendo games. A confetti burst celebrates each level up.
7. The `audioService` will load these sounds automatically and handle failures gracefully.
8. Subtle haptic feedback triggers on each swipe for extra game feel.
9. A small header widget shows your **level** and XP with a progress bar that fills as you get closer to leveling up.
10. The file `assets/favicon.png` serves as the favicon when running on the web. Replace it with your own image to customize the icon.
11. Enable **Zen Mode** from the gallery screen to hide stats and confetti for a stress-free experience.

## Running the App on Android

```bash
npm start
```

Expo Go cannot grant full media-library permissions. Features like file deletion
and scanning require a development build. Create one with:

```bash
eas build --profile development
```

or

```bash
expo run:android
```

For a release build you'll need the EAS CLI installed (this repository includes
`eas-cli` as a dev dependency). Log in and run the production build script,
which checks your login status automatically:

```bash
npx eas login
npm run build:prod
```
This will invoke `eas build --profile production` if you are logged in.

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
- Friendly alerts celebrate your progress and encourage you to keep going.
- A motivational banner shows supportive messages to keep you feeling positive while you declutter.
- Messages are chosen from a shared module and cycled so you rarely see the same encouragement twice in a row.
- Customize these phrases in `lib/positiveMessages.ts`; keep each under 30 characters so they fit the banner.

- If more images are available the next batch loads automatically so the game never ends until your gallery is empty. The app also prefetches the following batch in the background to keep swiping smooth.

3. **Recycle Bin**
   - Deleted photos move to a recycle bin tab.
   - You can restore or permanently delete them here; permanent deletion grants bonus XP. Deleted files are removed from the device using the platform MediaLibrary API.

The minimal build removes additional tabs like Gallery, Tree, and Stats to keep the focus on photo cleanup.

For more details on specific systems see:

- `AUDIO_SYSTEM_README.md`
- `ONBOARDING_README.md`
- `XP_SYSTEM_README.md`
- `MASCOT_README.md`
- `lib/pixelPerfect.ts` explains the `px()` helper used for pixel-accurate layout.
- `GAME_CUSTOMIZATION.md` summarizes how to tweak fonts, sounds and other game settings.

## Testing

Run the automated test suite after installing dependencies:

```bash
npm install
npm test
```

`npm install` is required so that dev dependencies like Jest are available and
the `patch-package` script can apply fixes to expo-audio.

## Swipe Cooldown and Test Mode

A brief 0.15&nbsp;second input mask now blocks touches after each swipe so fast gestures register cleanly while the next card loads.
Tap anywhere five times quickly to simulate a left swipe for debugging.

### Audio Fallback

Sound playback can fail if audio files are missing or the device blocks audio initialization. When that happens a default chime is used instead. See `lib/audioService.ts` for implementation details.

The audio service queues rapid playback requests so quick swipes never overlap. Each swipe sound waits about 0.15&nbsp;seconds before the next begins. Delete actions sometimes play one of two short voice clips for extra charm.
These clips are processed through the same queue so they won't overlap even if you swipe rapidly. To enable the clips, add `voice1.mp3` and `voice2.mp3` under `assets/sounds/` as described in `assets/sounds/SETUP_INSTRUCTIONS.md`.

## Performance Tips

### Faster installation

- Use `npm ci` in continuous integration or clean environments to install exact versions from `package-lock.json`.
- Cache the `node_modules` directory or npm cache between runs to avoid downloading packages every time.
- On CI, cache the Expo CLI artifacts and the npm cache (`~/.cache`) to speed up subsequent installs.
- Pass `--prefer-offline` to reuse previously downloaded packages when possible.
- Disable progress output with `--silent --no-progress` for slightly faster npm execution.
- Skip the security audit step with `--no-audit` to shave a few seconds off installation.
- Keep a pre-filled cache of the next dependency build or Expo prebuild to avoid redundant work.

### Reducing crashes

- Keep dependencies updated with `npm outdated` and `npm update`.
- Wrap optional native modules such as `expo-haptics` in a try/catch and provide fallbacks so missing packages don't crash the app.
- Guard MediaLibrary and audio calls with error handling so unexpected failures are logged instead of crashing.
- Fetch photos in smaller batches to avoid memory spikes and call `fetchAllPhotoAssets` only when absolutely necessary.
- Use a global error boundary to catch unexpected exceptions and offer a restart option.
- Prefetch the next batch of photos while the user swipes to prevent loading pauses.

## Future Work

Multi-folder scanning is not yet implemented. See [TODO.md](TODO.md) for planned improvements and feature ideas.
