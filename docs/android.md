# Android emulator setup

Use `npx expo run:android` to build and launch the development client. The old global `expo` package fails on Node 17+.

If you see `spawn emulator ENOENT`, install Android Studio and create a virtual device. Ensure the `emulator` command is in your `PATH` or set `ANDROID_HOME` to the SDK location.
