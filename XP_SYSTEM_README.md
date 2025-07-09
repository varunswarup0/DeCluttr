# XP System

Deleting and restoring photos awards or removes XP. Every 100 XP increases your level, tracked in the header and stats screen.

XP is stored with AsyncStorage via the Zustand store in `store/store.ts`. Photo actions automatically update the total so most components don't need to call XP functions directly.

You can tune the reward amounts in `XP_CONFIG` inside the store file to fit new game modes.
