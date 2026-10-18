# Google Play Store & Apple App Store Readiness Checklist

## Project: Quranify / AyahFlow (Cross-Platform Mobile Application)
- **Framework:** Next.js 16 (Turbopack SSG) + Capacitor 8
- **Package ID:** `com.quranify.app`
- **Application Name:** Quranify
- **Target OS:** Android 15 (API 35) & iOS 17+

---

## 1. Core Playback & User Experience Readiness
- [x] **Audio Seeking:** Verified with HTTP 206 Partial Content range requests, boundary clamping, and zero thumb jitter or snap-back.
- [x] **Live Subtitles & Tafsir:** Verified with millisecond-accurate verse boundaries from Quran Foundation API and authentic commentary from Ibn Kathir and Tafsir Muyassar.
- [x] **Ambient Soundscapes:** Non-interfering secondary audio mixing with dedicated volume control.
- [x] **Modal & Sheet Layering:** Fixed stacking context issues; modals always render at `z: 9999` above full-screen player.
- [x] **Theme System:** Fully compliant with Light Mode, Dark Mode, and dynamic System Default without theme flash or audio interruption.
- [x] **Accessibility:** Quranic Uthmani typography with contrast ratio > 14:1 in both Light and Dark themes.

---

## 2. Android Manifest & Permissions Compliance
- `android/app/src/main/AndroidManifest.xml` includes:
  - `INTERNET`: Required for streaming Quran recitations and loading verified translations.
  - `ACCESS_NETWORK_STATE`: For checking connectivity.
  - `WAKE_LOCK`: For continuous audio recitation when screen turns off.
  - `FOREGROUND_SERVICE` & `FOREGROUND_SERVICE_MEDIA_PLAYBACK`: Required on Android 14+ for background media playback.

---

## 3. Release Signing & Production APK / AAB
For testing on real devices, the debug APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

For Google Play Store submission:
1. Generate release keystore:
   ```bash
   keytool -genkey -v -keystore quranify-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias quranify
   ```
2. Configure `android/key.properties` (never commit keys to source control).
3. Build Android App Bundle (AAB):
   ```bash
   cd android && .\gradlew.bat bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`.

---

## 4. Google Play Policy Compliance
- **Content Rating:** Everyone / All Ages (Spiritual / Reference / Educational).
- **Privacy Policy:** Required URL in Google Play Console detailing local storage usage (theme preference, favorites, download cache).
- **Target API Level:** Compliant with Target SDK 35 (Android 15 requirement).
