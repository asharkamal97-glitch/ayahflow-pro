# AyahFlow Privacy Policy Draft

**Status: draft for developer review; do not publish until the bracketed details and third-party practices are verified.**

**Last reviewed:** 18 October 2026  
**App:** AyahFlow  
**Developer:** [legal developer or organization name]  
**Contact:** [support/privacy email]  
**Effective date:** [date the final policy takes effect]

## Information handled by AyahFlow

AyahFlow has no account registration, sign-in, advertising SDK, or analytics SDK in the inspected application code and direct dependencies. It does not ask for a name, email address, contacts, location, camera, or microphone access.

The app saves preferences and listening state in browser storage on the device. This includes theme choice, selected reciter, playback preferences, favourites, ambient sound choice and volume, listening streak/minutes, and a list of Surah numbers marked as downloaded. Android app data backup is enabled in the current manifest; the developer should confirm what WebView storage is backed up on supported Android versions and whether that matches the intended retention policy.

The current Downloads screen does **not** download or cache recitation audio. Its saved-Surah list is local metadata only. The app must not describe this state as downloaded audio or offline playback until a real, tested audio-download implementation exists.

## Network services

The app makes HTTPS requests directly from the device to:

- MP3Quran audio hosts for streamed recitations.
- `api.quran.com` for recitation timing and Tafsir data.
- `api.alquran.cloud` for Quran text and translation data.
- Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`) for web fonts.

These services necessarily receive network connection details such as the device IP address and request metadata. Quran and audio requests can reveal the requested Surah, reciter, translation, or Tafsir endpoint. AyahFlow does not currently proxy these requests through an AyahFlow server. The providers' own retention, use, and sharing practices must be reviewed and linked here before publication; this draft does not assert that those providers collect no data.

Ambient sound files are bundled with the app and are played locally.

## Permissions and security

The Android app requires internet access for streaming and Quran data. It retains `WAKE_LOCK` for ongoing playback. It does not request runtime access to contacts, location, camera, microphone, or shared storage. Production cleartext HTTP traffic is disabled; app-defined remote endpoints use HTTPS.

Local preferences are stored in the app's WebView storage and are not protected by an AyahFlow account. Android backup behavior may copy eligible app data according to the user's device and system backup settings.

## Retention and deletion

Users can change preferences and remove favourites or saved-Surah markers within the app. Clearing app storage or uninstalling the app removes its local state. The app currently has no user accounts and no server-side profile to delete. Requests made directly to external providers are subject to those providers' retention and deletion policies.

## Children's privacy

[Developer: confirm intended audience and add the applicable children's privacy statement before publishing.]

## Changes and contact

The final policy must be hosted at a stable public URL, linked from the Play listing, and accessible from the app. For privacy questions, contact [support/privacy email].

---

## Developer verification notes (remove from the public policy)

- Re-check the dependency graph and Android merged manifest for analytics, advertising, authentication, or additional permissions before each release.
- Confirm the current data practices and privacy policies of MP3Quran, Quran.com/Quran Foundation, AlQuran Cloud, Google Fonts, and any redirect/CDN operators.
- Confirm whether WebView local storage participates in Android Auto Backup; add explicit backup rules or disable backup if needed.
- Reconcile the Downloads screen's offline-playback claims with its implementation before store submission.
- Complete the Play Console Data safety and data-deletion questions from the final release binary and all provider disclosures.
