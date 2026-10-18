'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlayerStore';
import { RECITERS } from '@/lib/constants';
import { Search, Play, Pause } from 'lucide-react';

export default function RecitersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const { selectedReciter, isPlaying, setSelectedReciter, togglePlay } = usePlayerStore();

  const countries = ['All', ...Array.from(new Set(RECITERS.map((r) => r.country)))];
  const tags = ['All', 'popular', 'tajwid', 'emotional', 'classic'];

  const filteredReciters = RECITERS.filter((reciter) => {
    const matchesSearch =
      reciter.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reciter.name.includes(searchQuery);
    const matchesCountry = selectedCountry === 'All' || reciter.country === selectedCountry;
    const matchesTag = selectedTag === 'All' || reciter.tags?.includes(selectedTag);
    return matchesSearch && matchesCountry && matchesTag;
  });

  return (
    <div className="flex flex-col gap-8 px-4 md:px-10 py-6 md:py-8 max-w-7xl mx-auto w-full pb-32">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-theme-primary tracking-tight">Reciters</h1>
        <p className="text-xs md:text-sm text-theme-secondary">
          Listen to the Holy Quran recited by world-renowned Qaris across different styles and traditions
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            placeholder="Search reciter by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-theme-surface border border-theme-subtle text-sm text-theme-primary placeholder-theme-muted focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {countries.map((country) => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCountry === country
                  ? 'glass-nav-active font-semibold shadow-sm'
                  : 'bg-theme-surface border border-theme-subtle text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* Reciters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredReciters.map((reciter) => {
          const isSelected = selectedReciter.id === reciter.id;
          return (
            <div
              key={reciter.id}
              className={`group flex flex-col p-4 rounded-3xl glass-panel border transition-all duration-200 hover:bg-theme-elevated ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-theme-subtle'
              }`}
            >
              {/* Reciter Avatar & Quick Play */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-theme-elevated border border-theme-subtle shadow-md">
                <img
                  src={reciter.avatar}
                  alt={reciter.englishName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      togglePlay();
                    } else {
                      setSelectedReciter(reciter);
                    }
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
                >
                  {isSelected && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-sm text-theme-primary line-clamp-1">{reciter.englishName}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 arabic-text mt-0.5">{reciter.name}</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-theme-subtle text-[11px]">
                  <span className="text-theme-muted">{reciter.country}</span>
                  <Link
                    href={`/reciters/${reciter.id}`}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    View Surahs
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
