# Customizing DeCluttr

This guide summarizes the key files to modify when you want to personalize the game experience.

## Fonts and Typography
- **`lib/useCustomFonts.ts`** – defines the Google Fonts loaded at runtime. Swap these imports with your preferred fonts and update the font names in `tailwind.config.js`.
- **`tailwind.config.js`** – tailwind typography settings. Make sure the `fontFamily` section matches the fonts you load.

## Sounds
- Place your own effects under `assets/sounds/` following `assets/sounds/SETUP_INSTRUCTIONS.md`.
- Replace `delete.mp3`, `keep.mp3` and other clips with audio that fits your theme.
- Background music can be enabled by adding `assets/music/background.mp3`.

## Colors and Theme
- Adjust the color palette in `theme/colors.ts`.
- Navigation theme values live in `theme/index.ts`.

## XP Values
- Edit `XP_CONFIG` in `store/store.ts` to tweak XP rewards and penalties.

## Positive Messages
- Modify phrases in `lib/positiveMessages.ts` to change the short encouragement banners.

## Onboarding Steps
- `app/onboarding.tsx` contains the onboarding screens. Update the `screens` array or styling to fit your own intro flow.

## Mascot
- See `MASCOT_README.md` for sprite guidelines. Swap the assets in `assets/mascot/` to replace the bird.

## App Icon and Favicon
- Replace `assets/favicon.png` for the web icon. Android/iOS icons are defined in `app.json`.

Refer back to this guide whenever you want to change the look and feel of the game.
