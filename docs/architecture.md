# Architecture Notes

DeCluttr uses Expo React Native with a small set of libraries. Gameplay state is
managed with Zustand in `store/store.ts`. Deleted photos, onboarding flags and
settings persist via AsyncStorage so progress survives app restarts.

Photo and video assets are fetched using helpers from `lib/mediaLibrary.ts`. This
module wraps `expo-media-library` and provides pagination, permission checks and
safe deletion utilities. `lib/audioService.ts` supplies haptics and sound effects
through a lightweight wrapper around `expo-audio`.

UI components live in the `components/` folder and the Expo Router pages reside
under `app/`. Most visual flair – confetti, overlays and the bird mascot – sits in
components so it can be toggled or themed easily.
