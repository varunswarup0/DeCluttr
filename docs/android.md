# Android emulator setup

Use `npx expo run:android` to build and launch the development client. The old global `expo` package fails on Node 17+.

If you see `spawn emulator ENOENT`, install Android Studio and create a virtual device. Ensure the `emulator` command is in your `PATH` or set `ANDROID_HOME` to the SDK location.

## Gray screen after launch

If the game remains on a gray background after the splash screen,
check `android/app/src/main/java/com/jaiswarup/decluttr/MainActivity.kt`.
The `onCreate` method must pass along the incoming `savedInstanceState` bundle:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
  setTheme(R.style.AppTheme)
  super.onCreate(savedInstanceState)
}
```

Passing `null` breaks `expo-splash-screen`, revealing a blank window before the React UI renders.
