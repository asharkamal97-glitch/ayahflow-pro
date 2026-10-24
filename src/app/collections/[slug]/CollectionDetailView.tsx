'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COLLECTIONS, SURAHS, RECITERS, getSurahAudioUrl } from '@/lib/constants';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Track } from '@/types/quran';
import { Play, Pause, ChevronLeft, Heart } from 'lucide-react';

interface CollectionDetailViewProps {
  slug: string;
}

export default function CollectionDetailView({ slug }: CollectionDetailViewProps) {
  const collection = COLLECTIONS.find((c) => c.slug === slug);

  const {
    currentTrack,
    isPlaying,
    favorites,
    playPlaylist,
    togglePlay,
    toggleFavorite,
  } = usePlayerStore();

  if (!collection) {
    notFound();
  }

  const reciter = RECITERS.find((r) => r.id === collection.reciterId) || RECITERS[0];
  const collectionSurahs = SURAHS.filter((s) => collection.surahNumbers.includes(s.number));

  const collectionTracks: Track[] = collectionSurahs.map((s) => ({
    surah: s,
    reciter,
    audioUrl: getSurahAudioUrl(reciter, s.number),
  }));

  const handlePlayAll = () => {
    if (collectionTracks.length === 0) return;
    playPlaylist(collectionTracks, 0);
  };

  return (
    <div className="flex flex-col gap-8 px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32">
      {/* Back link */}
      <div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Collections
        </Link>
      </div>

      {/* Banner */}
      <div
        className={`relative rounded-[32px] overflow-hidden p-6 md:p-10 border border-theme-subtle bg-gradient-to-br ${collection.coverGradient} shadow-2xl flex flex-col justify-end min-h-[240px]`}
      >
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
              {collection.category} Playlist
            </span>
            <span className="text-xs text-white/80">{collectionSurahs.length} Tracks</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            {collection.title}
          </h1>
          <p className="text-sm md:text-base text-white/90 max-w-2xl leading-relaxed">
            {collection.description}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={handlePlayAll}
              className="py-3 px-7 rounded-full bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" /> Play All
            </button>
            <span className="text-xs text-white/80">Recited by {reciter.englishName}</span>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-theme-secondary uppercase tracking-wider pb-2 border-b border-theme-subtle">
          Surahs in this Playlist
        </h2>

        <div className="flex flex-col gap-2">
          {collectionSurahs.map((surah, idx) => {
            const isTrackActive =
              currentTrack?.surah.number === surah.number &&
              currentTrack?.reciter.id === reciter.id;
            const isFav = favorites.includes(surah.number);

            const handleTrackClick = () => {
              if (isTrackActive) {
                togglePlay();
              } else {
                playPlaylist(collectionTracks, idx);
              }
            };

            return (
              <div
                key={surah.number}
                onClick={handleTrackClick}
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
                      <span className="group-hover:hidden">{idx + 1}</span>
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
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(surah.number);
                    }}
                    className="p-1.5 rounded-full text-theme-muted hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                  <Link
                    href={`/surah/${surah.number}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline px-2.5 py-1 rounded-lg bg-theme-elevated border border-theme-subtle font-semibold"
                  >
                    Read
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
