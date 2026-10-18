# AyahFlow Google Play Release Checklist

**Audit date:** 18 October 2026  
**Application ID:** `pro.quranify.app` (preserved)  
**Display name:** AyahFlow

## Verified project configuration

- Next.js static export with Capacitor Android wrapper.
- `versionName`: `1.0`; `versionCode`: `1` (verify that code 1 has never been used for this Play Console application before upload).
- `minSdk`: 24 (Android 7.0); `compileSdk`: 36; `targetSdk`: 36 (Android 16).
- Java: JDK 21; Gradle wrapper: 8.14.5; Android Gradle Plugin: 8.13.0.
- Android Build Tools 36 and the complete API 36 platform are installed. The previously incomplete platform was preserved as `platforms/android-36.incomplete-backup`; the debug APK and release AAB have since been rebuilt against API 36.
- Android artifact contains no native ABI-specific `.so` libraries; the APK is primarily a WebView/static web bundle. Device coverage still requires testing on physical ARM devices and Play's generated device APKs.
- Manifest requests `INTERNET` and `WAKE_LOCK`; no runtime personal-data permissions remain. The app has no declared media-playback foreground service.
- Application and source audio/API URLs use HTTPS. Cleartext HTTP is disabled in Capacitor and Android.
- App Links with domain verification are not configured; no verified HTTPS deep-link domain was found.
- No account creation or sign-in flow, advertising SDK, or analytics SDK was found in the inspected UI, source, and direct package dependencies.
- Local state includes theme, reciter and playback preferences, favourites, ambient settings, listening insights, and saved-Surah markers.
- The Downloads UI marks Surahs locally but does not download/cache audio. This is a release blocker if offline playback is advertised.
- Background/lock-screen playback uses WebView media playback and Media Session handlers. The project has no native media-playback foreground service; Android 16 device/lock-screen behavior is unverified.

## Validation run

- [x] Production web build (`npm run build` passed; 146 routes exported)
- [x] Capacitor Android sync (`npx cap sync android` passed)
- [x] Existing player/Tafsir automated regression script passed (mocked regression only)
- [x] Focused ESLint on app source was run; it failed with 7 errors and 31 warnings in existing source issues (see final report)
- [x] Android debug APK build passed using Gradle 8.14.5 / AGP 8.13.0
- [x] Android release AAB build passed; the generated bundle is unsigned
- [x] Packaged ID, label (`AyahFlow`), SDK values, permissions, launcher icon resources, and unsigned signing state were inspected
- [ ] Install and test on Android 16 emulator and at least one physical device

## Before submission

- [ ] Configure a unique, developer-controlled upload key through ignored `android/key.properties`; never commit the file or keystore. Confirm Play App Signing in Play Console and securely back up the upload key.
- [ ] Rebuild and verify that the release AAB is signed with the intended upload key. An unsigned AAB is not upload-ready.
- [ ] Confirm the Play Console app's current version code and increase this project's `versionCode` if code 1 has already been used.
- [ ] Test API 36 edge-to-edge, predictive back, safe-area insets, audio interruptions, locked-screen playback, ambient modal layering, and light/dark theme on Android 16. Target 36 makes edge-to-edge mandatory and changes predictive-back behavior.
- [ ] Correct the offline screen or implement and test real audio downloads before describing offline recitation playback.
- [ ] Confirm whether the existing WebView Media Session behavior meets the background playback requirement. If not, integrate and test an appropriate native media playback service before release.
- [ ] Publish the reviewed privacy policy at a stable URL and link it in-app and in Play Console. Fill in developer identity, contact, effective date, intended audience, and third-party provider disclosures.
- [ ] Complete the Play Console Data safety form, including direct third-party network processing and the required data-deletion questions. There is no in-app account deletion flow because the inspected app does not create accounts; confirm that remains true in the release binary.
- [ ] Review current provider terms and content rights for recitation streams, Tafsir/translation data, and bundled ambience audio.
- [ ] Review licenses for the complete npm and Android transitive dependency graphs and include required notices/attributions.
- [ ] Prepare store listing, screenshots, content rating, audience/target-age declarations, app access instructions (if applicable), countries, and support contact.
- [ ] Confirm developer account verification and any account-specific testing requirements in Play Console.

## Signing setup

Gradle can read the four required values from the ignored `android/key.properties`: `storeFile`, `storePassword`, `keyAlias`, and `keyPassword`. No signing key or credentials are present in this project audit. Do not use the debug key for a Play release. If the local file is absent, `bundleRelease` may produce an unsigned artifact; verify the AAB signer before treating it as distributable.

## Current release blockers

1. No release/upload signing key is configured.
2. Offline audio download claims do not match the current local-ID-only implementation.
3. Android 16 physical-device/emulator QA has not been performed, including locked-screen playback and predictive back.
4. Privacy policy is a draft and Play Data safety declarations/provider practices remain unconfirmed.
5. Confirm version code availability in Play Console and complete store listing, content rights, age/audience, and transitive license review.
