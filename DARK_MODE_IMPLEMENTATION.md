# Quranify Theme System Implementation (Light, Dark & System Default)

## Executive Summary
This document details the architectural design, token system, component migrations, mobile status bar synchronization, and testing verification for the Quranify theme engine.

The theme system was engineered following **Apple Human Interface Guidelines (HIG)** principles—simplicity, clarity, consistency, and accessibility—fused with **Islamic visual design** aesthetics:
- **Light Mode:** Warm ivory background (`#FBF9F5`), white and subtle ivory elevated surfaces (`#FFFFFF` / `#F5F2EB`), deep emerald green primary (`#059669`), restrained gold accents (`#C5A059`), dark charcoal typography (`#1C1917`), and soft neutral borders (`#EAE5DC`).
- **Dark Mode:** Deep charcoal background (`#121316`), layered charcoal surfaces (`#181A1F` / `#20242B`), accessible emerald green (`#10B981`), muted premium gold (`#E5C378`), warm white typography (`#F5F5F5`), accessible soft gray secondary text (`#A1A1AA`), and subtle dark borders (`#242730`).
- **System Default:** Automatically synchronizes with Android and iOS system appearance settings in real time without requiring application reloads.

---

## 1. Architecture & Design Choices

### 1.1 State Management & Zero-Flicker Persistence
- **Persistent State:** Managed via `src/store/useThemeStore.ts` utilizing Zustand with `persist` middleware, storing preferences in `localStorage` under key `quranify-theme-preference`.
- **Zero-Flicker Startup:** Implemented an inline, blocking script in `<head>` inside `src/app/layout.tsx`. Before browser painting occurs, this script reads the persisted choice (or falls back to `window.matchMedia('(prefers-color-scheme: dark)')`), setting the `.light` or `.dark` class and `data-theme` attribute on the `<html>` root element. This completely eliminates light/dark flashes on startup.
- **Dynamic System Adaptation:** `ThemeManager` (`src/components/theme/ThemeManager.tsx`) registers an active `MediaQueryList` change listener on `(prefers-color-scheme: dark)` when `system` mode is active. Whenever the user switches their Android or iOS system dark/light mode toggle in notification shade or settings, Quranify updates instantly.
- **Audio & State Isolation:** The theme store is completely decoupled from the playback engine (`usePlayerStore`). Switching themes never interrupts active Surah playback, never pauses ambient background sounds, and never resets scroll position or navigation state.

### 1.2 Native Mobile Integration (Capacitor)
- **Status Bar Auto-Theming:** Via `@capacitor/status-bar`, the mobile status bar background and icon luminosity automatically sync with the active theme:
  - **Light Mode:** Background set to `#FBF9F5`, icons set to `Style.Light` (dark icons on light background).
  - **Dark Mode:** Background set to `#121316`, icons set to `Style.Dark` (light icons on dark background).
- **Safe Area Insets:** The theme tokens properly flow into top and bottom safe-area insets across modern notched Android and iOS devices.

---

## 2. Centralized Semantic Token Dictionary

Configured in `src/app/globals.css`:

| Semantic Token | CSS Variable | Light Mode Value | Dark Mode Value | Usage Description |
| :--- | :--- | :--- | :--- | :--- |
| **App Background** | `--bg-app` | `#FBF9F5` (Warm Ivory) | `#121316` (Deep Charcoal) | Main viewport canvas |
| **Surface** | `--bg-surface` | `#FFFFFF` | `#181A1F` (Layered Charcoal) | Cards, sidebars, modals |
| **Elevated Surface**| `--bg-surface-elevated`| `#F5F2EB` | `#20242B` | Hover states, list rows, pills |
| **Subtle Border** | `--border-subtle` | `#EAE5DC` | `#242730` | Dividers, card strokes |
| **Primary Accent** | `--primary-emerald` | `#059669` | `#10B981` | Play buttons, active tabs |
| **Restrained Gold** | `--accent-gold` | `#C5A059` | `#E5C378` | Calligraphy badges, premium accents |
| **Primary Text** | `--text-primary` | `#1C1917` (Dark Charcoal)| `#F5F5F5` (Warm White) | Headings, Surah titles |
| **Secondary Text** | `--text-secondary` | `#78716C` (Muted Gray) | `#A1A1AA` (Accessible Gray)| Metadata, ayah numbers, subtitles |
| **Arabic Text** | `--text-arabic` | `#1C1917` (High Contrast)| `#F5F5F5` (Crisp Contrast)| Quranic Uthmani typography |

Utility helper classes provided:
- `.bg-theme-app`
- `.bg-theme-surface`
- `.bg-theme-elevated`
- `.border-theme-subtle`
- `.text-theme-primary`
- `.text-theme-secondary`
- `.text-theme-arabic`
- `.text-theme-gold`
- `.bg-theme-gold`

---

## 3. Affected Components and Screens

Every screen, subview, modal, and navigation bar in the application has been updated to use the semantic theme tokens:

1. **Global Shell & Navigation:**
   - `src/app/layout.tsx` (Theme initialization script, dynamic metadata themeColor)
   - `src/components/layout/Sidebar.tsx` (Desktop sidebar navigation and Settings link)
   - `src/components/layout/MobileNav.tsx` (Mobile bottom navigation bar with Settings tab)
   - `src/components/theme/ThemeManager.tsx` (OS listener & Capacitor status bar manager)
2. **Settings Screen:**
   - `src/app/settings/page.tsx` (Apple-style Appearance picker with Light, Dark, and System preview cards, active checkmark, storage details, and audio cache management)
3. **Home Dashboard:**
   - `src/app/page.tsx` (Hero banner, streak status, quick theme toggle button, ambient sound drawer, and featured reciters)
4. **Quran Reading Experience:**
   - `src/app/surah/[number]/SurahDetailView.tsx` (High-contrast Uthmani Arabic text, English translations, Bismillah banner, Surah controls, verse jump drawer, and audio highlighting)
5. **Reciters Directory & Profile:**
   - `src/app/reciters/page.tsx` (Search input, country filter pills, authentic reciter cards)
   - `src/app/reciters/[id]/ReciterDetailView.tsx` (Reciter hero cover, track list, play actions)
6. **Collections & Playlists:**
   - `src/app/collections/page.tsx` (Categorized playlist cards)
   - `src/app/collections/[slug]/CollectionDetailView.tsx` (Playlist header, bulk play, track list)
7. **Search & Discovery:**
   - `src/app/search/page.tsx` (Big search input, exploratory query tags, categorized results)
8. **Downloads Manager:**
   - `src/app/downloads/page.tsx` (Storage usage indicator, offline audio track list)
9. **Habit & Insights:**
   - `src/app/insights/page.tsx` (Streak card, weekly listen chart, time-of-day distribution, top reciters)
10. **Audio Player & Modals:**
    - `src/components/player/AudioPlayer.tsx` (Mini-player dock, scrubber, playback controls)
    - `src/components/player/FullScreenPlayer.tsx` (Full-screen player canvas, calligraphy badge)
    - `src/components/player/AmbientSoundPickerModal.tsx` (Ambience modal with theme-adaptive cards)
    - `src/components/player/TafsirModal.tsx` (Ayah Tafsir modal)
    - `src/components/player/SleepTimerModal.tsx` (Sleep timer duration selector)
    - `src/components/player/ReportDesyncModal.tsx` (Timing feedback submission modal)

---

## 4. Quran Readability & Accessibility

- **Arabic Typography:** In Light Mode, Quranic Arabic renders in dark charcoal (`#1C1917`) on warm ivory (`#FBF9F5` / `#FFFFFF`), yielding a contrast ratio of > 14:1 (exceeding WCAG AAA 7:1 requirements). In Dark Mode, it renders in crisp warm white (`#F5F5F5`) on deep charcoal (`#121316`), yielding a contrast ratio of > 15:1.
- **Ayah Highlighting:** Active playing verse is highlighted with an accessible emerald tint (`rgba(16, 185, 129, 0.12)`) and a subtle emerald left border indicator in both themes.
- **Tafsir & Translations:** Render in readable proportions with clear font scale and distinct hierarchy between sacred Arabic script and contextual translations.

---

## 5. Verification & Testing

### 5.1 Web Build Verification
- Ran `npm run build`
- 146/146 pages compiled statically with Turbopack and zero errors:
  - Static SSG generation verified across all 114 Surahs, 14 Reciters, and 8 Collections.
  - TypeScript type checking passed with zero errors.

### 5.2 Capacitor Synchronization
- Ran `npx cap sync android`
- Successfully copied all static web bundle assets to `android/app/src/main/assets/public`.
- Android plugins synchronized (`@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar`).

### 5.3 Android APK Build
- Compiled using Gradle with JDK 21 (`C:\Users\ashar\.jdks\jdk-21`).
- Target file: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 6. Testing Instructions

### On Mobile Device (Android):
1. Transfer `android/app/build/outputs/apk/debug/app-debug.apk` to your Android device via USB, Google Drive, or `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.
2. Open **Quranify**.
3. Tap **Settings** (gear icon in the bottom navigation bar or top navigation).
4. Tap **Appearance**:
   - Tap **Light Mode**: The interface instantly transitions to warm ivory and emerald with a matching light status bar.
   - Tap **Dark Mode**: The interface transitions to deep charcoal with light status bar icons.
   - Tap **System Default**: Change your Android system theme (via notification quick settings) to verify Quranify shifts dynamically between Light and Dark.
5. While playing audio or reading a Surah, toggle the theme—verify that playback continues seamlessly without interruption.

### On Web Browser:
1. Open `http://localhost:3000` (or the deployed URL).
2. Click **Settings** in the left sidebar.
3. Test **Light**, **Dark**, and **System Default**.
4. Test the quick theme switch button (Sun/Moon icon) on the Home dashboard or top bar.
