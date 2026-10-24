'use client';

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTafsirSyncStore } from '@/store/useTafsirSyncStore';
import { PLAYBACK_SPEEDS, TAFSIRS } from '@/lib/constants';
import { formatAudioTime, formatAudioDuration } from '@/lib/audioManager';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Heart,
  Sparkles,
  BookOpen,
  Clock,
  Download,
  CheckCircle,
  Flag,
  X,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

export const FullScreenPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    next,
    previous,
    seek,
    skipBy,
    favorites,
    toggleFavorite,
    isFullScreenPlayerOpen,
    setFullScreenPlayerOpen,
    setAmbientModalOpen,
    setReportModalOpen,
    selectedAmbientSound,
    playbackSpeed,
    setPlaybackSpeed,
    sleepTimerEnd,
    downloadedSurahs,
    toggleDownloadedSurah,
    isLiveTafsirActive,
    toggleLiveTafsir,
    setLiveTafsirActive,
    selectedTafsirId,
    setSelectedTafsirId
  } = usePlayerStore();

  const {
    currentAyahNumber,
    ayahs,
    hasVerifiedTimestamps,
    currentTafsirText,
    isLoadingTafsir,
    setManualAyah
  } = useTafsirSyncStore();

  // Local drag state for reliable touch and mouse scrubbing
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  if (!isFullScreenPlayerOpen || !currentTrack) return null;

  const isFav = favorites.includes(currentTrack.surah.number);
  const isDownloaded = downloadedSurahs.includes(currentTrack.surah.number);

  const effectiveTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (effectiveTime / duration) * 100)) : 0;

  // Find active ayah object
  const currentAyah = ayahs.find((a) => a.numberInSurah === currentAyahNumber) || ayahs[0];
  const currentTafsirMeta = TAFSIRS.find((t) => t.id === selectedTafsirId) || TAFSIRS[0];

  const handlePointerDown = () => {
    setIsDragging(true);
    setDragTime(currentTime);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isDragging) {
      setDragTime(isNaN(val) ? 0 : val);
    } else {
      seek(isNaN(val) ? 0 : val);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    const safeTarget = isNaN(dragTime) ? 0 : dragTime;
    seek(safeTarget);
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-player-fullscreen flex flex-col justify-between bg-theme-app text-theme-primary p-4 md:p-8 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto shrink-0">
        <button
          type="button"
          onClick={() => setFullScreenPlayerOpen(false)}
          className="p-2.5 rounded-full bg-theme-elevated hover:bg-theme-hover text-theme-secondary hover:text-theme-primary border border-theme-subtle transition-colors cursor-pointer"
          title="Minimize player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            Now Reciting
          </span>
          <div className="text-sm font-semibold text-theme-primary">
            {currentTrack.reciter.name}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReportModalOpen(true)}
          className="p-2.5 rounded-full bg-theme-elevated hover:bg-theme-hover text-theme-muted hover:text-amber-500 border border-theme-subtle transition-colors cursor-pointer"
          title="Report audio or timing issue"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Center Display: Calligraphy Card OR Live Tafsir Subtitles */}
      <div className="my-auto py-4 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
        {isLiveTafsirActive ? (
          /* Live Tafsir & Subtitles Mode */
          <div className="w-full rounded-3xl bg-theme-surface border border-theme-subtle shadow-2xl p-5 md:p-6 flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Tafsir Header Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-theme-primary">
                  Surah {currentTrack.surah.englishName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-semibold">
                  Ayah {currentAyahNumber} of {currentTrack.surah.numberOfAyahs}
                </span>
                {hasVerifiedTimestamps ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold hidden sm:inline-flex items-center gap-1">
                    ✨ Live Synced
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle hidden sm:inline-flex">
                    Continuous
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Tafsir Source Switcher */}
                <select
                  value={selectedTafsirId}
                  onChange={(e) => setSelectedTafsirId(e.target.value)}
                  aria-label="Tafsir edition"
                  className="appearance-none bg-theme-elevated border border-theme-subtle text-theme-secondary text-[11px] font-semibold px-2.5 py-1 rounded-xl cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  {TAFSIRS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-theme-surface text-theme-primary">
                      {t.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setLiveTafsirActive(false)}
                  className="p-1.5 rounded-full hover:bg-theme-elevated text-theme-muted hover:text-theme-primary transition-colors cursor-pointer"
                  title="Switch to calligraphy view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Arabic Verse Display */}
            <div className="text-right font-serif text-2xl md:text-3xl text-theme-arabic leading-loose tracking-wide py-1 select-text">
              {currentAyah ? currentAyah.text : 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
            </div>

            {/* English Translation */}
            {currentAyah?.translation && (
              <div className="text-xs md:text-sm text-theme-secondary italic leading-relaxed border-l-2 border-emerald-500/50 pl-3 py-1">
                &ldquo;{currentAyah.translation}&rdquo;
              </div>
            )}

            {/* Tafsir Explanation Body */}
            <div className="p-3.5 rounded-2xl bg-theme-elevated border border-theme-subtle flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {currentTafsirMeta.name} Explanation
                </span>
                <span className="text-[10px] text-theme-muted">
                  {currentTafsirMeta.author}
                </span>
              </div>

              {isLoadingTafsir ? (
                <div className="py-4 flex items-center justify-center gap-2 text-xs text-theme-muted">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading authentic Tafsir...</span>
                </div>
              ) : (
                <div className="max-h-36 md:max-h-44 overflow-y-auto pr-2 text-xs md:text-sm text-theme-primary leading-relaxed select-text">
                  {currentTafsirText || 'No commentary is available for this verse.'}
                </div>
              )}
            </div>

            {/* Ayah Navigation Footbar */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  const prev = Math.max(1, currentAyahNumber - 1);
                  setManualAyah(prev, currentTrack.surah.number);
                }}
                disabled={currentAyahNumber <= 1}
                className="px-3 py-1.5 rounded-full bg-theme-elevated text-xs font-semibold text-theme-secondary hover:text-theme-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Ayah</span>
              </button>

              <span className="text-[11px] text-theme-muted font-mono">
                Ayah {currentAyahNumber}
              </span>

              <button
                type="button"
                onClick={() => {
                  const nextAyah = Math.min(currentTrack.surah.numberOfAyahs, currentAyahNumber + 1);
                  setManualAyah(nextAyah, currentTrack.surah.number);
                }}
                disabled={currentAyahNumber >= currentTrack.surah.numberOfAyahs}
                className="px-3 py-1.5 rounded-full bg-theme-elevated text-xs font-semibold text-theme-secondary hover:text-theme-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Next Ayah</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Calligraphy View Mode */
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-theme-surface border border-theme-subtle shadow-2xl flex flex-col items-center justify-center p-6 text-center overflow-hidden group">
            {/* Subtle Ambient Wave Effect */}
            {selectedAmbientSound && (
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse rounded-3xl pointer-events-none" />
            )}

            <div className="font-serif text-5xl md:text-6xl text-emerald-600 dark:text-emerald-300/90 drop-shadow-sm mb-3 tracking-wide">
              {currentTrack.surah.name}
            </div>

            <div className="text-lg font-bold text-theme-primary tracking-tight">
              Surah {currentTrack.surah.englishName}
            </div>
            <div className="text-xs text-theme-secondary mt-1">
              &ldquo;{currentTrack.surah.englishNameTranslation}&rdquo;
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {currentTrack.surah.revelationType} • {currentTrack.surah.numberOfAyahs} Ayahs
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle">
                {currentTrack.reciter.style}
              </span>
            </div>

            {/* Active Ambient Overlay Pill */}
            {selectedAmbientSound && (
              <button
                type="button"
                onClick={() => setAmbientModalOpen(true)}
                className="absolute bottom-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 cursor-pointer transition-colors active:scale-95 shadow-sm"
                title="Change ambient sound"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>{selectedAmbientSound.name}</span>
              </button>
            )}
          </div>
        )}

        {/* Surah Title & Actions Row */}
        <div className="w-full flex items-center justify-between mt-5 px-1">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-theme-primary">
              {currentTrack.surah.englishName}
            </h1>
            <p className="text-sm text-theme-secondary">
              {currentTrack.reciter.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleDownloadedSurah(currentTrack.surah.number)}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isDownloaded
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                  : 'text-theme-muted hover:text-theme-primary bg-theme-elevated hover:bg-theme-hover border border-theme-subtle'
              }`}
              title={isDownloaded ? 'Downloaded for offline playback' : 'Download for offline playback'}
            >
              {isDownloaded ? <CheckCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(currentTrack.surah.number)}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isFav
                  ? 'text-rose-500 bg-rose-500/10 border border-rose-500/20'
                  : 'text-theme-muted hover:text-theme-primary bg-theme-elevated hover:bg-theme-hover border border-theme-subtle'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Playback Controls & Reliable Scrubber */}
      <div className="w-full max-w-xl mx-auto space-y-3 shrink-0">
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <div className="relative w-full h-3 flex items-center group touch-none">
            {/* Visual Track */}
            <div className="w-full h-2 bg-theme-elevated border border-theme-subtle rounded-full overflow-hidden relative">
              <div
                className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Interactive Input Slider */}
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              step={0.1}
              value={effectiveTime}
              onPointerDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              onChange={handleSliderChange}
              onPointerUp={handlePointerUp}
              onTouchEnd={handlePointerUp}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Quran playback progress scrubber"
            />
          </div>

          <div className="flex justify-between text-xs text-theme-muted font-mono">
            <span>{formatAudioTime(effectiveTime)}</span>
            <span>{formatAudioDuration(duration)}</span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-6 md:gap-8">
          <button
            type="button"
            onClick={() => skipBy(-10)}
            className="p-2 text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer active:scale-95"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={previous}
            className="p-2 text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer active:scale-95"
            title="Previous Surah"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 transition-transform active:scale-95 cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={next}
            className="p-2 text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer active:scale-95"
            title="Next Surah"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => skipBy(10)}
            className="p-2 text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer active:scale-95"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary Action Bar (Ambient, Tafsir, Speed, Sleep Timer) */}
        <div className="flex items-center justify-between pt-2 px-1 border-t border-theme-subtle">
          {/* Ambient Soundscape Button */}
          <button
            type="button"
            onClick={() => setAmbientModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
              selectedAmbientSound
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary'
            }`}
            title="Choose ambient soundscape"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{selectedAmbientSound ? selectedAmbientSound.name : 'Ambient Sound'}</span>
          </button>

          {/* Tafsir Toggle Button */}
          <button
            type="button"
            onClick={toggleLiveTafsir}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
              isLiveTafsirActive
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:text-theme-primary'
            }`}
            title={isLiveTafsirActive ? "Hide Live Tafsir" : "Show Live Tafsir"}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isLiveTafsirActive ? 'Tafsir Active' : 'Live Tafsir'}</span>
          </button>

          {/* Speed Selector */}
          <div className="relative group">
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              aria-label="Playback speed"
              className="appearance-none bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {PLAYBACK_SPEEDS.map((s) => (
                <option key={s} value={s} className="bg-theme-surface text-theme-primary">
                  {s}x Speed
                </option>
              ))}
            </select>
          </div>

          {/* Sleep Timer Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-theme-muted">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{sleepTimerEnd ? 'Timer Active' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
