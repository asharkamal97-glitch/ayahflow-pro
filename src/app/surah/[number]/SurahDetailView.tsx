'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SURAHS } from '@/lib/constants';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTafsirSyncStore } from '@/store/useTafsirSyncStore';
import { Ayah } from '@/types/quran';
import { Play, Pause, ChevronLeft, ChevronRight, Heart, Volume2 } from 'lucide-react';

interface SurahDetailViewProps {
  number: string;
}

export default function SurahDetailView({ number }: SurahDetailViewProps) {
  const surahNum = parseInt(number, 10);
  const surah = SURAHS.find((s) => s.number === surahNum);

  const {
    currentTrack,
    isPlaying,
    selectedReciter,
    favorites,
    playSurah,
    togglePlay,
    toggleFavorite,
    seek,
  } = usePlayerStore();

  const { currentAyahNumber, timestamps, hasVerifiedTimestamps } = useTafsirSyncStore();

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!surah || isNaN(surahNum)) {
    notFound();
  }

  // Fetch full Arabic text + English translation from public AlQuran Cloud API
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load Surah text');
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
        const uthmaniData = data.data[0]?.ayahs || [];
        const englishData = data.data[1]?.ayahs || [];

        const combinedAyahs: Ayah[] = uthmaniData.map((ayah: any, index: number) => ({
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: englishData[index]?.text || '',
        }));

        setAyahs(combinedAyahs);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Error fetching ayahs:', err);
        setError('Could not load online text. You can still listen to the recitation below.');
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [surahNum]);

  const isCurrentSurahPlaying =
    currentTrack?.surah.number === surah.number && isPlaying;
  const isFav = favorites.includes(surah.number);

  const prevSurah = surahNum > 1 ? surahNum - 1 : null;
  const nextSurah = surahNum < 114 ? surahNum + 1 : null;

  return (
    <div className="flex flex-col gap-8 px-4 md:px-10 py-6 md:py-8 max-w-4xl mx-auto w-full pb-32">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Home
        </Link>

        <div className="flex items-center gap-2">
          {prevSurah && (
            <Link
              href={`/surah/${prevSurah}`}
              className="p-2 rounded-xl glass-panel text-theme-secondary hover:text-theme-primary transition-colors"
              title="Previous Surah"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}
          <span className="text-xs font-bold text-theme-primary px-3 py-1.5 rounded-xl glass-panel">
            Surah {surah.number} of 114
          </span>
          {nextSurah && (
            <Link
              href={`/surah/${nextSurah}`}
              className="p-2 rounded-xl glass-panel text-theme-secondary hover:text-theme-primary transition-colors"
              title="Next Surah"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Surah Header Card */}
      <div className="rounded-[32px] glass-panel p-6 md:p-8 border border-theme-subtle shadow-xl flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            {surah.revelationType} • {surah.numberOfAyahs} Ayahs • ~{Math.max(1, Math.round(surah.numberOfAyahs * 0.17))} mins
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-theme-primary tracking-tight">
          {surah.englishName}
        </h1>
        <p className="text-2xl md:text-3xl arabic-text text-emerald-600 dark:text-emerald-400 font-bold">
          {surah.name}
        </p>
        <p className="text-sm md:text-base text-theme-secondary">
          &ldquo;{surah.englishNameTranslation}&rdquo;
        </p>

        {/* Audio Player Trigger */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => {
              if (currentTrack?.surah.number === surah.number) {
                togglePlay();
              } else {
                playSurah(surah, selectedReciter);
              }
            }}
            className="py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            {isCurrentSurahPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause Recitation
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" /> Listen ({selectedReciter.englishName})
              </>
            )}
          </button>

          <button
            onClick={() => toggleFavorite(surah.number)}
            className="p-3 rounded-full glass-panel hover:bg-theme-elevated text-theme-muted hover:text-rose-500 transition-colors cursor-pointer"
            title={isFav ? "Saved to favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bismillah Header (for all except At-Tawbah #9) */}
      {surahNum !== 9 && (
        <div className="text-center py-4 text-2xl md:text-3xl arabic-text text-theme-arabic font-bold">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
      )}

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-theme-muted">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs">Loading Uthmani text & translation...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-200 text-xs text-center">
          {error}
        </div>
      )}

      {/* Ayahs Stream */}
      {!loading && ayahs.length > 0 && (
        <div className="flex flex-col gap-6">
          {ayahs.map((ayah) => {
            const isPlayingThis = currentTrack?.surah.number === surah.number;
            const isActiveAyah = isPlayingThis && currentAyahNumber === ayah.numberInSurah;

            const handleAyahClick = () => {
              if (!isPlayingThis) {
                playSurah(surah, selectedReciter);
              }
              if (hasVerifiedTimestamps) {
                const ts = timestamps.find((t) => t.verse_key === `${surah.number}:${ayah.numberInSurah}`);
                if (ts) {
                  seek(ts.timestamp_from / 1000);
                }
              }
            };

            return (
              <div
                key={ayah.number}
                onClick={handleAyahClick}
                className={`p-5 md:p-6 rounded-3xl glass-panel border transition-all flex flex-col gap-4 cursor-pointer ${
                  isActiveAyah
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'border-theme-subtle hover:border-theme-medium'
                }`}
              >
                {/* Top: Ayah Number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center transition-colors ${
                      isActiveAyah
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-theme-elevated border-theme-subtle text-theme-primary'
                    }`}>
                      {ayah.numberInSurah}
                    </span>
                    {isActiveAyah && isPlaying && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                        <Volume2 className="w-3 h-3 animate-pulse" /> Reciting Now
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-theme-muted font-mono">
                    {hasVerifiedTimestamps ? 'Tap to seek' : `Ayah ${ayah.number}`}
                  </span>
                </div>

                {/* Arabic text with Uthmani script */}
                <p
                  className={`text-2xl md:text-3xl arabic-text text-right leading-[2.5] font-normal transition-colors ${
                    isActiveAyah ? 'text-emerald-800 dark:text-emerald-200 font-semibold' : 'text-theme-arabic'
                  }`}
                  dir="rtl"
                >
                  {ayah.text}
                </p>

                {/* Translation */}
                <p className="text-sm md:text-base text-theme-secondary leading-relaxed font-sans pt-3 border-t border-theme-subtle">
                  {ayah.translation}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
