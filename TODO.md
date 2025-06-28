# TODO

Organized backlog of issues and ideas:

## Bugs

- Tests failed because dev dependencies weren't installed. Running `npm install` resolves the missing Jest and ESLint modules.
- `npm run lint` fails with `Cannot find module 'eslint/config'` and missing `es-abstract/2024/ToIntegerOrInfinity`. Pin the package versions and fix the ESLint config.
- Confetti animations linger after resetting the gallery. Clear the confetti key when the gallery is reset. ✔️
- `tsc --noEmit` reports `Cannot find type definition file for 'react-native'`. The missing types were resolved by installing `expo-linear-gradient` and ensuring `@types/react-native` is present. ✔️

## Gameplay Improvements

- **Clarify delete behaviour** – setting for trash vs permanent removal.
- **Advanced folder selection** including WhatsApp media scanning.
- **Multi-select delete** of similar photos to speed up cleanup.
- **Bulk delete** by month or album.
- **Improve selection workflow**
  - Change default swipe actions to navigate between images instead of keep/delete.
  - Optionally move the image strip to the bottom for faster navigation.
  - Provide a button to open the current photo in the system gallery for favoriting.
- **Running total of deleted items** ✔️
- **Show overall deleted total in Recycle Bin** ✔️
- Add video review support.
- Implement endless gallery pagination so new batches of photos load automatically. ✔️

## Nice-to-haves

- Mark as favourite.
- Move or copy to a specific album.
- Exclude or include certain albums when reviewing.
- Detect and remove duplicate images.
- Share images as documents or without captions.
- Compress or resize photos.
- Basic editing tools.
- AI-based sorting (selfies, pets, nature, etc.).
- Add dopamine-inducing animations (confetti, XP pop effects). ✔️
- Add haptic feedback for swipe actions. ✔️
- Show level progress bar and vibrate on level up. ✔️
