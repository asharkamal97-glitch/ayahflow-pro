'use client';

import React from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useThemeStore } from '@/store/useThemeStore';
import { SURAHS, RECITERS, COLLECTIONS, AMBIENT_SOUNDS } from '@/lib/constants';
import {
  Play,
  Pause,
  ChevronRight,
  Sparkles,
  Heart,
  Flame,
  Download,
  CheckCircle2,
  Volume2,
  Sun,
  Moon,
  Settings,
  Smartphone,
  Compass
} from 'lucide-react';

export default function HomePage() {
  const {
    currentTrack,
    isPlaying,
    selectedReciter,
    favorites,
    playSurah,
    togglePlay,
    setSelectedReciter,
    toggleFavorite,
    insights,
    selectedAmbientSound,
    setSelectedAmbientSound,
    setAmbientModalOpen,
    downloadedSurahs,
    toggleDownloadedSurah
  } = usePlayerStore();

  const { resolvedTheme, themePreference, setThemePreference } = useThemeStore();

  const isCurrentReciterPlaying = isPlaying && currentTrack?.reciter.id === selectedReciter.id;

  const handleReciterSelect = (reciter: typeof selectedReciter) => {
    setSelectedReciter(reciter);
    if (currentTrack) {
      playSurah(currentTrack.surah, reciter);
    } else {
      playSurah(SURAHS[0], reciter);
    }
  };

  const tajwidReciters = RECITERS.filter((r) => r.tags?.includes('tajwid'));
  const apkUrl = process.env.NEXT_PUBLIC_ANDROID_APK_URL || '/ayahflow-pro.apk';

  return (
    <div className="flex flex-col gap-8 md:gap-10 px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32">
      {/* Page Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-theme-primary">AyahFlow</h1>
          <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
            Pro
          </span>
          <p className="hidden sm:inline-block text-xs md:text-sm text-theme-secondary ml-2 border-l border-theme-subtle pl-3">
            Listen. Reflect. Find Peace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Appearance Toggle */}
          <button
            type="button"
            onClick={() => setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full glass-panel hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
          </button>

          <Link
            href="/settings"
            className="p-2 rounded-full glass-panel hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary transition-colors"
            title="Appearance & Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          <Link
            href="/search"
            className="text-xs px-3.5 py-2 rounded-full glass-panel hover:bg-theme-elevated text-theme-primary transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Discover</span>
          </Link>
        </div>
      </div>

      {/* SPATIAL HERO EXPERIENCE */}
      <div className="relative overflow-hidden rounded-[32px] spatial-glass-card p-6 md:p-10 border border-theme-subtle shadow-2xl">
        {/* Subtle Celestial Ambient Atmosphere */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-black/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl flex flex-col gap-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-elevated border border-theme-subtle text-theme-secondary text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Apple-Inspired Spatial Audio & Quran Sanctuary</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-theme-primary leading-tight">
              A Sacred Space for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-200 bg-clip-text text-transparent">
                Quran Recitation & Peace
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-theme-secondary leading-relaxed max-w-xl">
              Immerse in crystal-clear recitations from world-renowned Qaris, synchronized Live Tafsir subtitles, serene atmospheric soundscapes, and personal habit reflection.
            </p>

            {/* Quick Hero Actions & APK Download */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/reciters"
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Explore 200+ Reciters</span>
              </Link>

              <a
                href={apkUrl}
                download="ayahflow-pro.apk"
                className="px-4 py-2.5 rounded-full bg-theme-surface hover:bg-theme-elevated text-theme-primary font-semibold text-xs md:text-sm border border-theme-subtle hover:border-emerald-500/40 transition-all flex items-center gap-2 shadow-sm"
                title="Direct Android APK Download (29.2 MB)"
              >
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Download for Android (APK)</span>
              </a>

              <Link
                href="/collections"
                className="px-4 py-2.5 rounded-full bg-theme-elevated hover:bg-theme-hover text-theme-secondary hover:text-theme-primary font-medium text-xs md:text-sm border border-theme-subtle transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Mood Collections</span>
              </Link>
            </div>
          </div>

          {/* Spatial Preview Widget */}
          <div className="shrink-0 lg:w-72 rounded-2xl glass-panel p-4 border border-theme-subtle flex flex-col gap-3 shadow-xl backdrop-blur-3xl bg-theme-surface/75">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-theme-muted">Featured Recitation</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Spatial Audio</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={selectedReciter.avatar}
                alt={selectedReciter.englishName}
                className="w-12 h-12 rounded-xl object-cover border border-theme-subtle shadow-md"
              />
              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-bold text-theme-primary truncate">{selectedReciter.englishName}</span>
                <span className="text-xs text-theme-secondary truncate">Surah {currentTrack?.surah.englishName || 'Al-Fatihah'}</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (currentTrack && isPlaying) {
                  togglePlay();
                } else {
                  playSurah(SURAHS[0], selectedReciter);
                }
              }}
              className="w-full py-2 px-4 rounded-xl bg-theme-elevated hover:bg-emerald-600 hover:text-white text-theme-primary text-xs font-semibold border border-theme-subtle transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              <span>{isPlaying ? 'Pause Recitation' : 'Listen Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* STREAK & HABIT BANNER */}
      <div className="rounded-3xl bg-theme-surface p-4 md:p-5 border border-theme-subtle shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm md:text-base text-theme-primary">
                {insights.currentStreak}-Day Quran Habit Streak!
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {insights.totalMinutesListened} mins total
              </span>
            </div>
            <p className="text-xs text-theme-secondary mt-0.5">
              Keep listening today to build your streak record.
            </p>
          </div>
        </div>

        <Link
          href="/insights"
          className="self-stretch sm:self-auto px-4 py-2 rounded-full bg-theme-elevated hover:bg-theme-hover text-xs font-semibold text-theme-primary transition-colors flex items-center justify-center gap-1.5 border border-theme-subtle"
        >
          <span>View Insights</span>
          <ChevronRight className="w-3.5 h-3.5 text-theme-muted" />
        </Link>
      </div>

      {/* AMBIENT SOUNDSCAPES QUICK BAR */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Ambient Background Atmosphere
          </span>
          <button
            onClick={() => setAmbientModalOpen(true)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
          >
            Adjust Volume & Mix
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {AMBIENT_SOUNDS.map((sound) => {
            const isSelected = selectedAmbientSound?.id === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedAmbientSound(null);
                  } else {
                    setSelectedAmbientSound(sound);
                  }
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 border transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
                }`}
              >
                {isSelected && <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />}
                <span>{sound.name}</span>
                {sound.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle">
                    {sound.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Your Reciter & Quick Surah List */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-theme-primary tracking-tight">Your reciter</h2>
          <Link
            href="/reciters"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Reciter Featured Card */}
          <div className="lg:col-span-4 rounded-[32px] glass-panel p-6 flex flex-col items-center justify-center text-center gap-5 border border-theme-subtle shadow-xl">
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-theme-medium shadow-xl p-1 bg-theme-elevated">
              <img
                src={selectedReciter.avatar}
                alt={selectedReciter.englishName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl md:text-2xl font-bold text-theme-primary tracking-tight">
                {selectedReciter.englishName}
              </h3>
              <p className="text-xs md:text-sm text-theme-secondary">{selectedReciter.country}</p>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle self-center mt-1">
                {selectedReciter.style}
              </span>
            </div>
            <button
              onClick={() => {
                if (currentTrack && currentTrack.reciter.id === selectedReciter.id) {
                  togglePlay();
                } else {
                  playSurah(SURAHS[0], selectedReciter);
                }
              }}
              className="w-full max-w-xs py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              {isCurrentReciterPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Continue listening</span>
                </>
              )}
            </button>
          </div>

          {/* Surahs Grid / Column List */}
          <div className="lg:col-span-8 rounded-[32px] glass-panel p-4 md:p-6 border border-theme-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle mb-2">
              <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">Surah List</span>
              <span className="text-xs text-theme-muted">Showing popular Surahs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {SURAHS.slice(0, 16).map((surah) => {
                const isTrackActive =
                  currentTrack?.surah.number === surah.number &&
                  currentTrack?.reciter.id === selectedReciter.id;
                const isFav = favorites.includes(surah.number);
                const isDownloaded = downloadedSurahs.includes(surah.number);

                return (
                  <div
                    key={surah.number}
                    onClick={() => playSurah(surah, selectedReciter)}
                    className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isTrackActive
                        ? 'bg-emerald-500/15 border border-emerald-500/30 shadow-sm'
                        : 'hover:bg-theme-elevated border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${
                          isTrackActive
                            ? 'bg-emerald-600 text-white scale-105'
                            : 'bg-theme-elevated text-theme-secondary group-hover:bg-emerald-600 group-hover:text-white'
                        }`}
                      >
                        {isTrackActive && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <span className="group-hover:hidden">{surah.number}</span>
                        )}
                        <Play className="w-4 h-4 fill-current hidden group-hover:inline ml-0.5" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-theme-primary truncate">
                            {surah.englishName}
                          </span>
                          <span className="text-xs text-theme-muted font-serif">
                            ({surah.name})
                          </span>
                        </div>
                        <span className="text-[11px] text-theme-secondary truncate">
                          {surah.englishNameTranslation} • {surah.numberOfAyahs} verses • ~{Math.max(1, Math.round(surah.numberOfAyahs * 0.17))} mins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDownloadedSurah(surah.number);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          isDownloaded ? 'text-emerald-600 dark:text-emerald-400' : 'text-theme-muted hover:text-theme-primary'
                        }`}
                        title={isDownloaded ? 'Saved offline' : 'Save offline'}
                      >
                        {isDownloaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(surah.number);
                        }}
                        className="p-2 rounded-full text-theme-muted hover:text-rose-500 transition-colors"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-theme-subtle mt-3 flex justify-center">
              <Link
                href="/surah/1"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                View all 114 Surahs with Arabic Text & Translation <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Curated Collections */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-theme-primary tracking-tight">Curated Mood Collections</h2>
            <p className="text-xs text-theme-secondary">Hand-picked mixes for deep focus, restful sleep, and contemplation</p>
          </div>
          <Link
            href="/collections"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-4">
          {COLLECTIONS.map((col) => {
            return (
              <Link
                key={col.id}
                href={`/collections/${col.slug}`}
                className="group relative flex flex-col justify-end p-5 rounded-3xl overflow-hidden aspect-[4/5] border border-theme-subtle hover:border-emerald-500/50 transition-all hover:-translate-y-1 shadow-md bg-theme-surface"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${col.coverGradient} opacity-75 group-hover:opacity-90 transition-opacity`}
                />

                <div className="relative z-10 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                    Playlist
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-white leading-tight">
                    {col.title}
                  </h3>
                  <p className="text-[11px] text-white/70 line-clamp-1">{col.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: Best for Tajwid Reciters */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-theme-primary tracking-tight">Best for Tajwid</h2>
            <p className="text-xs text-theme-secondary">Masters of articulation and traditional Quran recitation</p>
          </div>
          <Link
            href="/reciters"
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tajwidReciters.map((reciter) => {
            const isSelected = selectedReciter.id === reciter.id;
            return (
              <div
                key={reciter.id}
                onClick={() => handleReciterSelect(reciter)}
                className={`group flex flex-col items-center text-center p-4 rounded-3xl glass-panel border cursor-pointer transition-all hover:bg-theme-elevated ${
                  isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-theme-subtle'
                }`}
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 border border-theme-medium shadow-md group-hover:scale-105 transition-transform bg-theme-elevated">
                  <img
                    src={reciter.avatar}
                    alt={reciter.englishName}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Pause className="w-6 h-6 text-emerald-400 fill-current" />
                    </div>
                  )}
                </div>
                <h4 className="text-xs md:text-sm font-bold text-theme-primary line-clamp-1">
                  {reciter.englishName}
                </h4>
                <p className="text-[11px] text-theme-muted mt-0.5">{reciter.country}</p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                  {reciter.style.split('-')[1]?.trim() || 'Murattal'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Brand Mission & Footer Info */}
      <footer className="pt-10 pb-6 border-t border-theme-subtle flex flex-col gap-8 text-xs text-theme-secondary">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-md">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-theme-primary">AyahFlow</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">Pro</span>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              The peaceful spatial Quran streaming platform combining crystal-clear recitation, live synchronized Tafsir, ambient soundscapes, and habit reflection.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/collections" className="hover:text-theme-primary transition-colors">Collections</Link>
            <Link href="/reciters" className="hover:text-theme-primary transition-colors">Reciters</Link>
            <Link href="/insights" className="hover:text-theme-primary transition-colors">Insights</Link>
            <Link href="/downloads" className="hover:text-theme-primary transition-colors">Downloads & APK</Link>
            <Link href="/settings" className="hover:text-theme-primary transition-colors">Settings</Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-theme-muted pt-4 border-t border-theme-subtle">
          <p>© 2026 AyahFlow Pro. All rights reserved.</p>
          <p className="tracking-wide text-theme-secondary">
            Crafted with care by <span className="text-theme-primary font-medium">Ashar Ashraf</span>
          </p>
          <p>Audio powered by MP3Quran & AlQuran Cloud open datasets.</p>
        </div>
      </footer>
    </div>
  );
}
