# AyahFlow Privacy Policy Draft

**Status: draft for developer review; do not publish until the bracketed details and third-party practices are verified.**

**Last reviewed:** 21 October 2026  
**App:** AyahFlow  
**Developer:** [legal developer or organization name]  
**Contact:** [support/privacy email]  
**Effective date:** [date the final policy takes effect]

## Information handled by AyahFlow

AyahFlow has no account registration, sign-in, or third-party advertising SDK. It does not ask for a name, email address, contacts, location, camera, or microphone access.

The website and web application integrate **Vercel Web Analytics** to collect privacy-friendly, aggregated operational metrics (such as page views and anonymized button clicks like APK download triggers). Vercel Web Analytics does not track users across websites, does not use persistent identifying cookies, and does not collect personally identifiable information (PII).

The app saves preferences and listening state in browser/WebView storage locally on the device. This includes theme choice, selected reciter, playback preferences, favourites, ambient sound choice and volume, listening streak/minutes, and a list of Surah numbers marked as downloaded. Android app data backup is explicitly disabled (`android:allowBackup="false"`).

The current Downloads screen does **not** download or cache recitation audio. Its saved-Surah list is local metadata only. The app must not describe this state as downloaded audio or offline playback until a real, tested audio-download implementation exists.

## Network services

The app and website make HTTPS requests directly to:

- MP3Quran audio hosts (`*.mp3quran.net`) for streamed recitations.
- `api.quran.com` for recitation timing and Tafsir data.
- `api.alquran.cloud` for Quran text and translation data.
- Vercel Web Analytics (`va.vercel-scripts.com` / `vitals.vercel-insights.com`) for privacy-preserving, aggregated visitor telemetry and feature usage events.

**Typography & Fonts:** Web fonts (Amiri and Inter) are self-hosted directly within the application bundle via Next.js font optimization (`next/font/google`). No runtime requests or client IP addresses are transmitted to Google Fonts servers during browsing or playback.

These external services necessarily receive network connection details such as the device IP address and request metadata. Quran and audio requests can reveal the requested Surah, reciter, translation, or Tafsir endpoint. AyahFlow does not currently proxy these requests through an AyahFlow server. The providers' own retention, use, and sharing practices must be reviewed and linked here before publication; this draft does not assert that those providers collect no data.

Ambient sound files are bundled locally with the app and are played locally.

## Permissions and security

The Android app requires internet access for streaming and Quran data. It retains `WAKE_LOCK` for ongoing playback. It does not request runtime access to contacts, location, camera, microphone, or shared storage. 

Security controls enforced in the mobile application:
- Cleartext HTTP traffic is disabled (`cleartext: false` in Capacitor configuration, and `usesCleartextTraffic` is omitted/false in AndroidManifest).
- Application data backup is disabled (`android:allowBackup="false"`).
- The unused Android FileProvider has been removed from the application manifest.
- Local preferences are stored in the app's WebView sandboxed storage and are not transmitted to an AyahFlow account server.

## Retention and deletion

Users can change preferences and remove favourites or saved-Surah markers within the app. Clearing app storage or uninstalling the app removes all local state. The app currently has no user accounts and no server-side profile to delete. Requests made directly to external content providers are subject to those providers' retention and deletion policies.

## Children's privacy

[Developer: confirm intended audience and add the applicable children's privacy statement before publishing.]

## Changes and contact

The final policy must be hosted at a stable public URL, linked from the Play listing, and accessible from the app. For privacy questions, contact [support/privacy email].

---

## Developer verification notes (remove from the public policy)

- Re-check the dependency graph and Android merged manifest for analytics, advertising, authentication, or additional permissions before each release.
- Confirm the current data practices and privacy policies of MP3Quran, Quran.com/Quran Foundation, AlQuran Cloud, Vercel Analytics, and any redirect/CDN operators.
- Confirm whether Vercel Analytics events sent from web visitors meet your disclosure criteria under GDPR / CCPA.
- Reconcile the Downloads screen's offline-playback claims with its implementation before store submission.
- Complete the Play Console Data safety and data-deletion questions from the final release binary and all provider disclosures.
