Zen mode hides progress counters so players can clean photos without distraction. The toggle sits in the header via the `ZenToggle` component and uses the `zenMode` flag in the store.

Progress numbers are not tracked while zen mode is active. The flag persists in storage so it stays enabled across sessions.

The flag persists in AsyncStorage. Modify the store if you also want to pause audio or achievements when zen mode is active.
