The onboarding flow introduces DeCluttr in three slides. The UI lives in `app/onboarding.tsx` and uses Zustand for persistence.

AsyncStorage remembers if a user completed or skipped onboarding so it only appears once. Should storage fail, the game falls back to memory.
