# AyahFlow Pro (آية فلو) 📖✨
> *Listen. Reflect. Find Peace.*

[![Live Web App](https://img.shields.io/badge/Live%20Demo-ayahflow.tech-059669?style=for-the-badge&logo=googlechrome&logoColor=white)](https://ayahflow.tech)
[![Download Android APK](https://img.shields.io/badge/Download%20APK-Android%20v1.0.0-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/asharkamal97-glitch/ayahflow-pro/raw/main/apk/AyahFlow-Pro.apk)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

An ambient, immersive, spatial Quran recitation, translation, and reflection platform for Web and Android.

---

## 📥 Direct Android APK Download

You can download and install the standalone Android application directly without using the Google Play Store:

| Download Source | Link | Notes |
| :--- | :--- | :--- |
| **Official Release Download** | [⬇️ **Download app-release.apk (v1.0.1)**](https://github.com/asharkamal97-glitch/ayahflow-pro/releases/latest/download/app-release.apk) | Verified GitHub Release standalone package |
| **Official Web Downloads** | [🌐 **Visit Downloads Page**](https://ayahflow.tech/downloads/) | Web downloads, installation guides, and storage manager |
| **Repository File** | [`apk/AyahFlow-Pro.apk`](apk/AyahFlow-Pro.apk) | Browse file directly in repository |

### How to Install the APK on your Android Device:
1. Tap the **Download APK** link above on your Android device.
2. When the download completes, tap the file in your notification drawer or **Downloads** folder.
3. If prompted with *"Install unknown apps"*, tap **Settings** and toggle **"Allow from this source"**.
4. Confirm by tapping **Install**, then tap **Open**.

---

## 🌐 Live Web Experience

The web version of **AyahFlow Pro** is live:
👉 **[https://ayahflow.tech](https://ayahflow.tech)**

---

## ✨ Features

- 🎧 **World-Class Reciters**: High-fidelity recitations from Sheikh Mishary Rashid Alafasy, Abdul Rahman Al-Sudais, Maher Al-Muaiqly, Yasser Al-Dosari, Abu Bakr Al-Shatri, and more.
- 📜 **Full Quran Reader**: Complete 114 Surahs with Arabic typography, word-by-word synchrony, translations, and verse-by-verse tafsir.
- 🌊 **Ambient Soundscapes**: Blend Quranic recitation with natural relaxing soundscapes (rain, wind, river, bonfire, ocean waves, morning birds).
- 🎚️ **Spatial Audio Player**: Continuous gapless streaming, interactive waveform seeking, speed control, repeat modes, and sleep timer.
- 📱 **Cross-Platform**: Built as a responsive modern web app and packaged with native Android Capacitor shell.
- 🎨 **Adaptive Themes**: Beautiful ambient dark and light themes designed for comfortable night and day reading.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router, Static HTML Export)
- **UI Library**: React 19, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **State Management**: Zustand
- **Audio Engine**: Custom multi-channel HTML5 Audio manager with crossfade & ambient sound layering
- **Mobile Runtime**: Capacitor 8 (Android)
- **Deployment**: Vercel Global Edge Network

---

## 💻 Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/asharkamal97-glitch/ayahflow-pro.git
cd ayahflow-pro
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build the static production bundle:

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.
