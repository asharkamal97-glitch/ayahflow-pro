'use client';

import React from 'react';
import Link from 'next/link';
import { COLLECTIONS, SURAHS, RECITERS } from '@/lib/constants';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Sparkles, Heart } from 'lucide-react';

export default function CollectionsPage() {
  const { favorites, playSurah, selectedReciter } = usePlayerStore();

  const favoriteSurahs = SURAHS.filter((s) => favorites.includes(s.number));

  return (
    <div className="flex flex-col gap-10 px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-theme-primary tracking-tight">Collections</h1>
        <p className="text-xs md:text-sm text-theme-secondary">
          Curated thematic Quran recitations designed for your daily routine, prayer, and contemplation
        </p>
      </div>

      {/* Curated Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COLLECTIONS.map((col) => {
          const reciter = RECITERS.find((r) => r.id === col.reciterId) || RECITERS[0];
          return (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative flex flex-col justify-between p-6 rounded-[32px] overflow-hidden aspect-[16/10] border border-theme-subtle hover:border-emerald-500/50 transition-all hover:-translate-y-1 shadow-lg bg-theme-surface"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-t ${col.coverGradient} opacity-75 group-hover:opacity-90 transition-opacity`}
              />

              {/* Top Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
                  {col.category}
                </span>
                <span className="text-xs text-white/80">{col.surahNumbers.length} Surahs</span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 flex flex-col gap-1.5">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  {col.title}
                </h2>
                <p className="text-xs text-white/80 line-clamp-1">{col.subtitle}</p>
                <p className="text-[11px] text-white/60 mt-1">Reciter: {reciter.englishName}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Favorites / Saved Surahs Section */}
      <div className="flex flex-col gap-4 pt-6 border-t border-theme-subtle">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h2 className="text-lg md:text-xl font-bold text-theme-primary tracking-tight">Your Saved Surahs</h2>
        </div>

        {favoriteSurahs.length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel text-center text-theme-muted text-sm border border-theme-subtle">
            You haven&apos;t bookmarked any Surahs yet. Click the heart icon on any Surah to save it here!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {favoriteSurahs.map((surah) => (
              <div
                key={surah.number}
                onClick={() => playSurah(surah, selectedReciter)}
                className="flex items-center justify-between p-3.5 rounded-2xl glass-panel hover:bg-theme-elevated cursor-pointer transition-all border border-theme-subtle"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                    {surah.number}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-theme-primary">{surah.englishName}</span>
                    <span className="text-xs text-theme-muted arabic-text">{surah.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
