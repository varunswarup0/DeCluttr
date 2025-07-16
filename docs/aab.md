# AAB to APK

Builds from EAS or `npx expo run:android` produce `.aab` bundles. To sideload an APK, download Google's [bundletool](https://developer.android.com/studio/command-line/bundletool) and run:

```bash
java -jar bundletool.jar build-apks --bundle my-release.aab \
  --output output.apks --mode universal
```

Unzip `output.apks` and install `universal.apk` with `adb install universal.apk`. Use `--ks` and `--ks-key-alias` to sign with your keystore if needed.
