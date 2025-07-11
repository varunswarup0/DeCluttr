# Declutr Enhancement Proposal

This proposal outlines new features to make Declutr more engaging while staying minimal. Swipes remain the core interaction, but now each consecutive swipe adds a brief glowing trail for a satisfying motion. Clearing several photos quickly triggers a flock of birds animation using existing confetti hooks, providing a "batch clear" moment without extra buttons. The folder button still moves photos, and a smoother card transition keeps the experience fluid.

The bird mascot gains extra sprite sheets: a quick celebratory spin when you hit milestones like 10 photos cleared, a playful wink after moving a video, and a sleepy bob if the app is idle for a while. Animations swap in automatically with the current theme and use the same silent fallbacks as other assets, so missing files never crash the game.

Rewards rely on the current XP system. Confetti and a stronger vibration fire on level-ups or every 50 photos deleted. No new numbers appear—zen mode continues to hide the XP bar entirely—so the UI stays uncluttered. A short milestone jingle accompanies major rewards, loaded through `audioService` with the usual mock players.

The UI keeps just the swipe deck, mascot, folder button and progress bar. Swipes glide smoothly with subtle fades, and milestone celebrations add vibrant confetti for a polished feel. Theme folders like `nature` introduce fresh mascot colors and matching sounds, all persisted via the existing store.

Implementation touches only a few modules: extra animations live under `assets/mascot/<theme>/`, new sounds go in `assets/sounds/`, and minor logic updates occur in `components/SwipeDeck.tsx` and `store/store.ts` to trigger effects. Zustand persistence and AsyncStorage continue handling XP and settings to avoid new state bugs. The audio service's silent mock approach ensures any missing files fail gracefully.
