'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { RECITERS, SURAHS } from '@/lib/constants';
import { Play, Pause, Heart, ChevronLeft, Mic2, MapPin } from 'lucide-react';

interface ReciterDetailViewProps {
  id: string;
}

export default function ReciterDetailView({ id }: ReciterDetailViewProps) {
  const reciter = RECITERS.find((r) => r.id === id);

  const {
    currentTrack,
    isPlaying,
    favorites,
    playSurah,
    togglePlay,
    setSelectedReciter,
    toggleFavorite,
  } = usePlayerStore();

  if (!reciter) {
    notFound();
  }

  const isCurrentReciter = currentTrack?.reciter.id === reciter.id;

  return (
    <div className="flex flex-col gap-8 px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32">
      {/* Back button */}
      <div>
        <Link
          href="/reciters"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Reciters
        </Link>
      </div>

      {/* Reciter Hero Header */}
      <div className="rounded-[32px] glass-panel p-6 md:p-8 border border-theme-subtle shadow-xl flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-theme-medium shadow-2xl shrink-0 p-1 bg-theme-elevated">
          <img
            src={reciter.avatar}
            alt={reciter.englishName}
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 border border-emerald-500/20">
              <Mic2 className="w-3 h-3" /> {reciter.style}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {reciter.country}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-theme-primary tracking-tight">
            {reciter.englishName}
          </h1>
          <p className="text-lg md:text-xl text-emerald-600 dark:text-emerald-400 arabic-text">{reciter.name}</p>
          <p className="text-xs md:text-sm text-theme-secondary max-w-xl">
            Stream all 114 Surahs recited with precision, reverence, and spiritual depth.
          </p>

          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => {
                if (isCurrentReciter) {
                  togglePlay();
                } else {
                  setSelectedReciter(reciter);
                  playSurah(SURAHS[0], reciter);
                }
              }}
              className="py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              {isCurrentReciter && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" /> Play Surah Al-Fatihah
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 114 Surahs Tracklist */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
          <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
            Surah Tracklist ({SURAHS.length})
          </span>
          <span className="text-xs text-theme-muted">Recitation: {reciter.style}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {SURAHS.map((surah) => {
            const isTrackActive =
              currentTrack?.surah.number === surah.number &&
              currentTrack?.reciter.id === reciter.id;
            const isFav = favorites.includes(surah.number);

            return (
              <div
                key={surah.number}
                onClick={() => playSurah(surah, reciter)}
                className={`group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all ${
                  isTrackActive
                    ? 'bg-emerald-500/15 border border-emerald-500 shadow-sm'
                    : 'glass-panel hover:bg-theme-elevated border border-theme-subtle'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isTrackActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-theme-elevated text-theme-secondary group-hover:bg-emerald-600 group-hover:text-white'
                    }`}
                  >
                    {isTrackActive && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <span className="group-hover:hidden">{surah.number}</span>
                    )}
                    <Play className="w-3.5 h-3.5 fill-current hidden group-hover:inline ml-0.5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-theme-primary truncate">
                        {surah.englishName}
                      </span>
                      <span className="text-xs text-theme-muted arabic-text">
                        ({surah.name})
                      </span>
                    </div>
                    <span className="text-[11px] text-theme-secondary truncate">
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} ayahs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(surah.number);
                    }}
                    className="p-2 rounded-full text-theme-muted hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
