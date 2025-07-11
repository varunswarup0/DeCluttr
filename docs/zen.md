Zen mode hides XP counters and level displays so players can clean photos without distraction. The toggle sits in the header via the `ZenToggle` component and uses the `zenMode` flag in the store.

While enabled, XP functions early-return so progress numbers stay constant. This keeps the game simple but still lets you re-enable XP later without data loss.

The flag persists in AsyncStorage. Modify the store if you also want to pause audio or achievements when zen mode is active.
