# Customizing DeCluttr

This guide summarizes the key files to modify when you want to personalize the game experience.

## Fonts and Typography

DeCluttr ships with the classic arcade typeface **"Press Start 2P"** alongside Inter.
The fonts are loaded with Expo's font utilities and exposed via Tailwind so you can
easily reference them in your components.

### Loading fonts

- **`lib/useCustomFonts.ts`** imports `PressStart2P_400Regular` from
  `@expo-google-fonts/press-start-2p` and passes it to `useFonts` together with the
  other Google Fonts. The snippet below shows the relevant section:

  ```ts
  import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

  export function useCustomFonts() {
    const [loaded] = useFonts({
      Inter_400Regular,
      Inter_700Bold,
      PressStart2P_400Regular,
      VT323_400Regular,
      Bungee_400Regular,
      UnifrakturCook_700Bold,
    });
    return loaded;
  }
  ```

### Tailwind configuration

- **`tailwind.config.js`** maps a `fontFamily` entry called `arcade` to
  `"PressStart2P_400Regular"` so you can apply it with the class `font-arcade`:

  ```js
  fontFamily: {
    sans: ['Inter', 'System', 'sans-serif'],
    arcade: ['"PressStart2P_400Regular"', 'Inter', 'System', 'sans-serif'],
    celeste: ['"VT323"', 'monospace'],
    funky: ['"Bungee"', 'sans-serif'],
    medieval: ['"UnifrakturCook"', 'serif'],
  },
  ```

To use different fonts, install them from `@expo-google-fonts`, replace the imports
in `lib/useCustomFonts.ts` and update the `fontFamily` entries in
`tailwind.config.js` accordingly.

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
