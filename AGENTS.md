# AGENTS Instructions

This repository contains **DeCluttr**, a minimalist photo clean-up game built with React Native and Expo.

## Repository Structure
- `components/` – React components for the game interface.
- `lib/` – Utility modules such as `audioService` and `mediaLibrary`.
- `store/` – Zustand stores managing gameplay state.
- `__tests__/` – Jest test suite covering critical modules.
- `assets/` – Images, fonts and sound effect placeholders. Follow `assets/sounds/SETUP_INSTRUCTIONS.md` to add audio.

## Development Notes
- Run `npm install` before testing to ensure dev dependencies (Jest, ESLint) are available.
- Use `npm test` to run the automated tests.
- `npm run lint` and `npm run format` are available for code quality, though linting may need updated ESLint versions as described in `TODO.md`.
- Android is the only supported platform. Development builds require Expo development client or `eas build`.

## Architectural Tips
- Gameplay state (deleted photos, XP, onboarding progress) is stored via Zustand in `store/store.ts` with persistence through AsyncStorage.
- Photo assets are loaded from the device using functions in `lib/mediaLibrary.ts`. These handle pagination and permission checks.
- The audio system in `lib/audioService.ts` provides simple sound effects for delete and keep actions. It gracefully falls back to mock players if audio files are missing.
- Confetti and haptics provide feedback on important milestones such as leveling up or clearing batches of photos.

## Future Improvements
See `TODO.md` for known issues and feature ideas such as multi-folder scanning, batch deletion, and advanced workflows.

Maintainers should keep tests passing and update this file if the repository structure changes.
