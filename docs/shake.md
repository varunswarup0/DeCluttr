# Shake to Turbo

Shake your phone to trigger a short burst of Turbo mode. The accelerometer listens for sudden movement and automatically swipes left for a couple seconds.

The feature uses `useShake` from `lib/useShake.ts` to keep logic minimal. No extra state is tracked beyond a brief timer, so gameplay stays smooth.
