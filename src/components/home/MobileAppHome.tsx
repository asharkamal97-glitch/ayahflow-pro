'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useThemeStore } from '@/store/useThemeStore';
import { SURAHS, RECITERS, COLLECTIONS, AMBIENT_SOUNDS } from '@/lib/constants';
import { formatAudioTime, formatAudioDuration } from '@/lib/audioManager';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  ChevronRight,
  Sun,
  Moon,
  Settings,
  Flame,
  CheckCircle2,
  Download,
  BookOpen
} from 'lucide-react';

export default function MobileAppHome() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    selectedReciter,
    favorites,
    playSurah,
    togglePlay,
    seek,
    skipBy,
    setSelectedReciter,
    toggleFavorite,
    setFullScreenPlayerOpen,
    selectedAmbientSound,
    setSelectedAmbientSound,
    ambientVolume,
    setAmbientVolume,
    isAmbientPlaying,
    toggleAmbientPlay,
    setAmbientModalOpen,
    insights,
    downloadedSurahs,
    toggleDownloadedSurah
  } = usePlayerStore();

  const { resolvedTheme, setThemePreference } = useThemeStore();

  // Active track context or fallback to Surah 1 with selected reciter
  const activeSurah = currentTrack ? currentTrack.surah : SURAHS[0];
  const activeReciter = currentTrack ? currentTrack.reciter : selectedReciter;
  const isCurrentlyPlaying = isPlaying;
  const isFav = favorites.includes(activeSurah.number);

  // Popular and essential Surahs for immediate listening
  const popularSurahs = [
    SURAHS[0],   // 1: Al-Fatihah
    SURAHS[1],   // 2: Al-Baqarah
    SURAHS[17],  // 18: Al-Kahf
    SURAHS[35],  // 36: Ya-Sin
    SURAHS[54],  // 55: Ar-Rahman
    SURAHS[55],  // 56: Al-Waqi'ah
    SURAHS[66],  // 67: Al-Mulk
    SURAHS[111], // 112: Al-Ikhlas
    SURAHS[112], // 113: Al-Falaq
    SURAHS[113], // 114: An-Nas
  ].filter(Boolean);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleReciterSelect = (reciter: typeof selectedReciter) => {
    setSelectedReciter(reciter);
    if (currentTrack) {
      playSurah(currentTrack.surah, reciter);
    } else {
      playSurah(SURAHS[0], reciter);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-4 max-w-lg mx-auto w-full pb-40 select-none">
      {/* 1. NATIVE MOBILE HEADER */}
      <header className="flex items-center justify-between pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-2.5">
          <Image
            src="/app_icon.png"
            alt=""
            aria-hidden="true"
            width={38}
            height={38}
            className="w-9 h-9 rounded-2xl shadow-md shadow-emerald-950/20"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-theme-primary">AyahFlow</h1>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                Pro
              </span>
            </div>
            <span className="text-[10px] text-theme-muted font-medium">Quran Sanctuary & Ambience</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={() => setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full glass-panel text-theme-secondary hover:text-theme-primary transition-all active:scale-95"
            aria-label="Toggle dark/light theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Settings Link */}
          <Link
            href="/settings"
            className="p-2 rounded-full glass-panel text-theme-secondary hover:text-theme-primary transition-all active:scale-95"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 2. ACTIVE LISTENING SANCTUARY (HERO AUDIO CARD) */}
      <section className="relative overflow-hidden rounded-[28px] spatial-glass-card p-5 border border-emerald-500/25 shadow-xl bg-gradient-to-br from-emerald-950/30 via-theme-surface/95 to-amber-950/15">
        <div className="flex flex-col gap-4">
          {/* Card Top: Status Tag + Maximize Button */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              {currentTrack && isPlaying ? 'Now Playing' : 'Continue Listening'}
            </span>

            <button
              onClick={() => setFullScreenPlayerOpen(true)}
              className="text-xs text-theme-secondary hover:text-emerald-500 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>Full Screen</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Surah & Reciter Details */}
          <div
            onClick={() => setFullScreenPlayerOpen(true)}
            className="flex items-center gap-3.5 cursor-pointer"
          >
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-theme-elevated border border-theme-subtle shadow-md">
              <img
                src={activeReciter.avatar}
                alt={activeReciter.englishName}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-4">
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s] h-4" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s] h-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-theme-primary truncate">
                  {activeSurah.englishName}
                </h2>
                <span className="text-base text-emerald-600 dark:text-emerald-400 font-serif shrink-0">
                  {activeSurah.name}
                </span>
              </div>
              <p className="text-xs text-theme-secondary truncate mt-0.5">
                {activeReciter.englishName}
              </p>
              <span className="text-[10px] text-theme-muted mt-0.5">
                Surah #{activeSurah.number} • {activeSurah.numberOfAyahs} verses • {activeReciter.style}
              </span>
            </div>
          </div>

          {/* Audio Scrubber Slider */}
          <div className="flex flex-col gap-1.5 pt-1">
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1.5 bg-theme-elevated rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-label="Surah playback progress"
            />
            <div className="flex justify-between text-[11px] font-mono text-theme-muted">
              <span>{formatAudioTime(currentTime)}</span>
              <span>{formatAudioDuration(duration)}</span>
            </div>
          </div>

          {/* Primary Audio Action Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => toggleFavorite(activeSurah.number)}
              className="p-2.5 rounded-full text-theme-muted hover:text-rose-500 transition-colors active:scale-95"
              aria-label="Toggle favorite"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <div className="flex items-center gap-3">
              {/* -10s Seek */}
              <button
                onClick={() => skipBy(-10)}
                className="p-2.5 rounded-full bg-theme-elevated hover:bg-theme-hover text-theme-primary transition-all active:scale-95 border border-theme-subtle"
                aria-label="Skip backward 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={() => {
                  if (currentTrack) {
                    togglePlay();
                  } else {
                    playSurah(activeSurah, activeReciter);
                  }
                }}
                className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
                aria-label={isCurrentlyPlaying ? 'Pause recitation' : 'Play recitation'}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              {/* +10s Seek */}
              <button
                onClick={() => skipBy(10)}
                className="p-2.5 rounded-full bg-theme-elevated hover:bg-theme-hover text-theme-primary transition-all active:scale-95 border border-theme-subtle"
                aria-label="Skip forward 10 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => toggleDownloadedSurah(activeSurah.number)}
              className={`p-2.5 rounded-full transition-colors active:scale-95 ${
                downloadedSurahs.includes(activeSurah.number)
                  ? 'text-emerald-500'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
              aria-label="Save for offline listening"
            >
              {downloadedSurahs.includes(activeSurah.number) ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 3. AMBIENT SOUNDSPACE QUICK MIXER */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <h2 className="text-sm font-bold text-theme-primary">Ambient Soundspace</h2>
          </div>

          <button
            onClick={() => setAmbientModalOpen(true)}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 active:scale-95"
          >
            <Sliders className="w-3 h-3" />
            <span>Mixer</span>
          </button>
        </div>

        {/* Horizontal Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
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
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/40'
                    : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary'
                }`}
              >
                {isSelected && isAmbientPlaying ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-theme-muted" />
                )}
                <span>{sound.name}</span>
              </button>
            );
          })}
        </div>

        {/* Ambient Volume Quick Slider (shown when sound is active) */}
        {selectedAmbientSound && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-theme-surface border border-theme-subtle">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={toggleAmbientPlay}
                className="p-1.5 rounded-xl bg-theme-elevated text-emerald-600 dark:text-emerald-400 active:scale-95"
              >
                {isAmbientPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-theme-muted" />}
              </button>
              <span className="text-xs font-medium text-theme-primary truncate">
                {selectedAmbientSound.name}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={ambientVolume}
              onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
              className="w-28 h-1.5 bg-theme-elevated rounded-lg appearance-none cursor-pointer accent-emerald-500"
              aria-label="Ambient volume"
            />
          </div>
        )}
      </section>

      {/* 4. DAILY HABIT & REFLECTION CARD */}
      <section className="rounded-2xl bg-theme-surface p-4 border border-theme-subtle shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-theme-primary">
                {insights.currentStreak}-Day Listening Streak
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                {insights.totalMinutesListened}m
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary mt-0.5 line-clamp-1">
              &ldquo;In the remembrance of Allah do hearts find rest.&rdquo;
            </p>
          </div>
        </div>

        <Link
          href="/insights"
          className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold shrink-0"
        >
          Insights
        </Link>
      </section>

      {/* 5. FEATURED RECITERS CAROUSEL */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-theme-primary">Reciters</h2>
          <Link
            href="/reciters"
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>See all</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
          {RECITERS.map((reciter) => {
            const isSelected = selectedReciter.id === reciter.id;
            return (
              <button
                key={reciter.id}
                onClick={() => handleReciterSelect(reciter)}
                className={`flex flex-col items-center gap-1.5 shrink-0 w-18 text-center cursor-pointer transition-all ${
                  isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'border-theme-subtle'
                  }`}
                >
                  <img
                    src={reciter.avatar}
                    alt={reciter.englishName}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Pause className="w-4 h-4 text-emerald-400 fill-current" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-theme-primary truncate max-w-full">
                  {reciter.englishName.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. CURATED MOOD PLAYLISTS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-theme-primary">Curated Moods</h2>
          <Link
            href="/collections"
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>See all</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {COLLECTIONS.slice(0, 4).map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative flex flex-col justify-end p-3.5 rounded-2xl overflow-hidden aspect-[16/11] border border-theme-subtle shadow-sm bg-theme-surface active:scale-[0.98] transition-transform"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-t ${col.coverGradient} opacity-80 group-hover:opacity-90 transition-opacity`}
              />
              <div className="relative z-10 flex flex-col">
                <span className="text-[9px] uppercase font-bold tracking-wider text-white/70">
                  {col.category}
                </span>
                <h3 className="text-xs font-bold text-white leading-tight mt-0.5">
                  {col.title}
                </h3>
                <span className="text-[10px] text-white/60 mt-0.5">
                  {col.surahNumbers.length} Surahs
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. QUICK ESSENTIAL SURAHS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-theme-primary">Essential Surahs</h2>
          <Link
            href="/search"
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Browse 114</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col gap-1.5">
          {popularSurahs.map((surah) => {
            const isTrackActive =
              currentTrack?.surah.number === surah.number &&
              currentTrack?.reciter.id === selectedReciter.id;
            const isFavItem = favorites.includes(surah.number);
            const isSaved = downloadedSurahs.includes(surah.number);

            return (
              <div
                key={surah.number}
                onClick={() => playSurah(surah, selectedReciter)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                  isTrackActive
                    ? 'bg-emerald-500/15 border-emerald-500/30 shadow-sm'
                    : 'bg-theme-surface border-theme-subtle hover:bg-theme-elevated'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isTrackActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-theme-elevated text-theme-secondary'
                    }`}
                  >
                    {isTrackActive && isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      surah.number
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-theme-primary truncate">
                        {surah.englishName}
                      </span>
                      <span className="text-[11px] text-theme-muted font-serif">
                        ({surah.name})
                      </span>
                    </div>
                    <span className="text-[10px] text-theme-secondary truncate">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
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
                      isSaved ? 'text-emerald-500' : 'text-theme-muted hover:text-theme-primary'
                    }`}
                    aria-label="Toggle offline save"
                  >
                    {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(surah.number);
                    }}
                    className="p-2 rounded-full text-theme-muted hover:text-rose-500 transition-colors"
                    aria-label="Toggle favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFavItem ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
