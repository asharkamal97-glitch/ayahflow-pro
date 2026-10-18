'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SURAHS, RECITERS, COLLECTIONS } from '@/lib/constants';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Search, Play, Pause, Library, Mic2, BookOpen, X } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { currentTrack, isPlaying, selectedReciter, playSurah, setSelectedReciter } = usePlayerStore();

  const cleanQuery = query.trim().toLowerCase();

  const matchedSurahs = cleanQuery
    ? SURAHS.filter(
        (s) =>
          s.englishName.toLowerCase().includes(cleanQuery) ||
          s.englishNameTranslation.toLowerCase().includes(cleanQuery) ||
          s.name.includes(cleanQuery) ||
          String(s.number) === cleanQuery
      )
    : [];

  const matchedReciters = cleanQuery
    ? RECITERS.filter(
        (r) =>
          r.englishName.toLowerCase().includes(cleanQuery) ||
          r.name.includes(cleanQuery) ||
          r.country.toLowerCase().includes(cleanQuery) ||
          r.style.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedCollections = cleanQuery
    ? COLLECTIONS.filter(
        (c) =>
          c.title.toLowerCase().includes(cleanQuery) ||
          c.description.toLowerCase().includes(cleanQuery) ||
          c.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const hasResults =
    matchedSurahs.length > 0 || matchedReciters.length > 0 || matchedCollections.length > 0;

  return (
    <div className="flex flex-col gap-8 px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32">
      {/* Header & Big Search Input */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-theme-primary tracking-tight">Search</h1>

        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
          <input
            type="text"
            autoFocus
            placeholder="Search surahs, reciters, playlists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-full bg-theme-surface border border-theme-subtle text-base text-theme-primary placeholder-theme-muted focus:outline-none focus:border-emerald-500 transition-all shadow-md"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-theme-elevated text-theme-muted hover:text-theme-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* When Empty: Quick Exploration Chips */}
      {!query && (
        <div className="flex flex-col gap-6">
          <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider">
            Popular Searches
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'Al-Kahf',
              'Al-Mulk',
              'Ya-Sin',
              'Ar-Rahman',
              'Yasser Al-Dosari',
              'Mishary Alafasy',
              'Abdul Basit',
              'Focus & Work',
              'Sleep Mode',
            ].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-4 py-2 rounded-full bg-theme-surface border border-theme-subtle text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Quick Surahs Grid */}
          <div className="mt-4">
            <h2 className="text-sm font-semibold text-theme-secondary mb-3">Browse Top Surahs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SURAHS.slice(0, 9).map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => playSurah(surah, selectedReciter)}
                  className="p-3 rounded-2xl glass-panel border border-theme-subtle flex items-center justify-between cursor-pointer hover:bg-theme-elevated transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                      {surah.number}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-theme-primary block">{surah.englishName}</span>
                      <span className="text-xs text-theme-muted arabic-text">{surah.name}</span>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-theme-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {query && !hasResults && (
        <div className="py-16 text-center text-theme-muted text-sm">
          No results found for &ldquo;<span className="text-theme-primary font-semibold">{query}</span>&rdquo;. Try searching for a Surah name (e.g. &ldquo;Al-Kahf&rdquo;) or reciter (e.g. &ldquo;Mishary&rdquo;).
        </div>
      )}

      {query && hasResults && (
        <div className="flex flex-col gap-8">
          {/* Matched Surahs */}
          {matchedSurahs.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-theme-secondary text-xs uppercase font-bold tracking-wider">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Surahs ({matchedSurahs.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {matchedSurahs.map((surah) => {
                  const isActive =
                    currentTrack?.surah.number === surah.number &&
                    currentTrack?.reciter.id === selectedReciter.id;

                  return (
                    <div
                      key={surah.number}
                      onClick={() => playSurah(surah, selectedReciter)}
                      className="p-3.5 rounded-2xl glass-panel border border-theme-subtle hover:bg-theme-elevated flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-theme-elevated border border-theme-subtle flex items-center justify-center font-bold text-xs text-theme-primary">
                          {isActive && isPlaying ? (
                            <Pause className="w-4 h-4 fill-current text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            surah.number
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-theme-primary">{surah.englishName}</span>
                            <span className="text-xs text-theme-muted arabic-text">({surah.name})</span>
                          </div>
                          <span className="text-xs text-theme-secondary">
                            {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
          )}

          {/* Matched Reciters */}
          {matchedReciters.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-theme-secondary text-xs uppercase font-bold tracking-wider">
                <Mic2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reciters ({matchedReciters.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchedReciters.map((reciter) => (
                  <Link
                    key={reciter.id}
                    href={`/reciters/${reciter.id}`}
                    className="p-3.5 rounded-2xl glass-panel border border-theme-subtle hover:bg-theme-elevated flex items-center gap-3.5 transition-all"
                  >
                    <img
                      src={reciter.avatar}
                      alt={reciter.englishName}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-theme-subtle"
                    />
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-theme-primary block truncate">
                        {reciter.englishName}
                      </span>
                      <span className="text-xs text-theme-muted truncate block">
                        {reciter.country} • {reciter.style}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matched Collections */}
          {matchedCollections.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-theme-secondary text-xs uppercase font-bold tracking-wider">
                <Library className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Playlists ({matchedCollections.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchedCollections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.slug}`}
                    className="p-4 rounded-2xl glass-panel border border-theme-subtle hover:bg-theme-elevated flex flex-col gap-1 transition-all"
                  >
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      {col.category}
                    </span>
                    <span className="text-sm font-bold text-theme-primary">{col.title}</span>
                    <span className="text-xs text-theme-secondary">{col.subtitle}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
