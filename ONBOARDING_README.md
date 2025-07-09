# Onboarding

First-time users see a brief three-step introduction built with `react-native-onboarding-swiper`. Completion is stored in AsyncStorage so the tutorial only shows once.

Screens live in `app/onboarding.tsx` and state is managed in `store/store.ts`. Tweak the slides or styling there to fit new themes.

If onboarding data fails to load the game falls back to in-memory storage so players can still proceed.
