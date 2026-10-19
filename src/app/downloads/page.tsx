'use client';

import React from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlayerStore';
import { SURAHS } from '@/lib/constants';
import {
  Download,
  Trash2,
  HardDrive,
  Play,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import TrustStrip from '@/components/apk/TrustStrip';
import ApkInstallGuide from '@/components/apk/ApkInstallGuide';
import ScreenshotGallery from '@/components/gallery/ScreenshotGallery';
import { trackApkDownloadClick } from '@/lib/analytics';

export default function DownloadsPage() {
  const { downloadedSurahs, toggleDownloadedSurah, playSurah } = usePlayerStore();

  const downloadedList = SURAHS.filter((s) => downloadedSurahs.includes(s.number));

  // Estimate storage: ~4.5 MB average per Surah
  const estimatedMB = (downloadedList.length * 4.5).toFixed(1);

  return (
    <div className="flex flex-col gap-8 px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 md:p-10 border border-theme-subtle shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
            <Download className="w-3.5 h-3.5" />
            <span>Offline Storage</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-theme-primary">
            Download Manager
          </h1>
          <p className="text-sm md:text-base text-theme-secondary mt-2 leading-relaxed">
            Listen to your favorite Surahs anywhere without an internet connection. Downloaded recitations are stored locally on your device for instant offline playback.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-theme-secondary bg-theme-elevated border border-theme-subtle p-3 rounded-2xl w-fit">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <HardDrive className="w-4 h-4" />
              {downloadedList.length} Surahs Saved
            </span>
            <span>•</span>
            <span>Est. {estimatedMB} MB Storage</span>
          </div>
        </div>
      </div>

      {/* MOBILE ANDROID APP APK DOWNLOAD SECTION */}
      <div className="relative overflow-hidden rounded-3xl spatial-glass-card p-6 md:p-8 border border-theme-subtle shadow-xl">
        <div className="flex flex-col gap-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              Official Android APK
            </span>
            <span className="text-[11px] font-mono text-theme-muted">
              v1.0.0 • 29.2 MB
            </span>
          </div>

          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-theme-primary">
            AyahFlow Pro for Android
          </h2>
          <p className="text-xs md:text-sm text-theme-secondary leading-relaxed">
            Experience flawless lock-screen audio playback, hardware media notification controls, background ambient atmosphere mixing, and instant offline access on your phone.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={process.env.NEXT_PUBLIC_ANDROID_APK_URL || '/ayahflow-pro.apk'}
              download="ayahflow-pro.apk"
              onClick={() => trackApkDownloadClick('downloads_page')}
              className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download APK for Android</span>
            </a>

            <span className="text-xs text-theme-muted flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct Install • Clean & Ad-Free</span>
            </span>
          </div>

          <TrustStrip variant="compact" className="mt-2" />
        </div>
      </div>

      {/* DETAILED APK INSTALLATION & TROUBLESHOOTING GUIDE */}
      <ApkInstallGuide apkUrl={process.env.NEXT_PUBLIC_ANDROID_APK_URL || '/ayahflow-pro.apk'} />

      {/* REAL APP SCREENSHOT GALLERY */}
      <ScreenshotGallery />

      {/* Downloaded Surah List */}
      {downloadedList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-surface border border-theme-subtle max-w-lg mx-auto my-8">
          <AlertCircle className="w-12 h-12 text-theme-muted mx-auto mb-3" />
          <h2 className="text-lg font-bold text-theme-primary">No Surahs Downloaded Yet</h2>
          <p className="text-xs text-theme-secondary mt-1 max-w-sm mx-auto">
            Browse through the Holy Quran and tap the download icon on any Surah to save it for offline listening.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
          >
            <span>Browse Surahs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              Offline Available Surahs
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready for Airplane / Offline Mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {downloadedList.map((surah) => (
              <div
                key={surah.number}
                className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-theme-subtle hover:border-emerald-500/40 hover:bg-theme-elevated transition-all group"
              >
                <div
                  onClick={() => playSurah(surah)}
                  className="flex items-center gap-3.5 flex-1 cursor-pointer min-w-0"
                >
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>

                  <div className="min-w-0">
                    <div className="text-sm font-bold text-theme-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      Surah {surah.englishName}
                    </div>
                    <div className="text-xs text-theme-secondary truncate">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="font-serif text-lg text-emerald-600 dark:text-emerald-400">
                    {surah.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDownloadedSurah(surah.number)}
                    className="p-2 text-theme-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Remove from offline downloads"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
