See `audioService` in `lib/` for sound playback. It loads `delete.mp3` and `keep.mp3` from `assets/sounds/` and optional voice clips if present.

Settings such as volume and enabled state persist in AsyncStorage. Missing files are replaced with silent mock players so the game can run without audio.

Use subfolders under `assets/sounds/` for theme variations.
