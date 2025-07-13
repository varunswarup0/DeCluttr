# Declutr Enhancement Proposal

This proposal outlines new features to make Declutr more engaging while staying minimal. Swipes remain the core interaction, but now each consecutive swipe adds a brief glowing trail for a satisfying motion. Clearing several photos quickly triggers a flock of birds animation using existing confetti hooks, providing a "batch clear" moment without extra buttons. The folder button still moves photos, and a smoother card transition keeps the experience fluid.

The bird mascot gains extra sprite sheets: a quick celebratory spin when you hit milestones like 10 photos cleared, a playful wink after moving a video, and a sleepy bob if the app is idle for a while. Animations swap in automatically with the current theme and use the same silent fallbacks as other assets, so missing files never crash the game.

Rewards rely only on visual and haptic feedback. Confetti and a stronger vibration fire every 50 photos deleted. No numbers appear—zen mode keeps the interface uncluttered. A short milestone jingle accompanies major rewards, loaded through `audioService` with the usual mock players.

The UI keeps just the swipe deck, mascot, folder button and progress bar. Swipes glide smoothly with subtle fades, and milestone celebrations add vibrant confetti for a polished feel. Theme folders like `nature` introduce fresh mascot colors and matching sounds, all persisted via the existing store.

A short radial wave now bursts from the center after seven rapid deletes, giving an extra punch without tracking stats. The overlay fades automatically so gameplay never stops.

Implementation touches only a few modules: extra animations live under `assets/mascot/<theme>/`, new sounds go in `assets/sounds/`, and minor logic updates occur in `components/SwipeDeck.tsx` and `store/store.ts` to trigger effects. Zustand persistence and AsyncStorage continue handling settings to avoid new state bugs. The audio service's silent mock approach ensures any missing files fail gracefully.
