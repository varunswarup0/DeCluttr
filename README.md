# DeCluttr
[![CI](https://github.com/varunswarup0/DeCluttr/actions/workflows/test.yml/badge.svg)](https://github.com/varunswarup0/DeCluttr/actions/workflows/test.yml)

A minimalist photo clean‑up game for Android built with Expo React Native.
Swipe left to delete or right to keep and watch a tiny bird mascot cheer you on.
Long streaks trigger a colourful flock animation while a folder button lets you
move photos into any album. The WhatsApp tab filters images from the WhatsApp
Images folder so you can clear chat clutter in seconds.

Photos deleted from the main gallery or the recycle bin vanish from the device
immediately. There is no system trash beyond the in‑app recycle bin so swipe
carefully.

Run `npm install` then `npm start` to launch the app. For full media‑library
access you need a development build via `npx expo run:android` or `eas build`.
The legacy global `expo` CLI can fail on Node 17 and above.

Once dependencies are installed you can run `npm test` to execute the Jest test
suites. `npm run lint` checks code style and `npm run format` applies Prettier.

See `docs/README.md` for an outline of further documentation including guides on
audio, the mascot, onboarding, and CI. Additional deep dives such as
`docs/gameplay.md` and `docs/architecture.md` cover swipe mechanics and the
project structure.
