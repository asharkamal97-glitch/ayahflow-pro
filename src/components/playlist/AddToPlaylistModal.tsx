'use client';

import React, { useState } from 'react';
import { usePlaylistStore } from '@/store/usePlaylistStore';
import { SURAHS } from '@/lib/constants';
import { X, Check, Plus, Library } from 'lucide-react';

export default function AddToPlaylistModal() {
  const {
    selectedSurahForAdd,
    setSelectedSurahForAdd,
    playlists,
    addSurahToPlaylist,
    removeSurahFromPlaylist,
    setCreateModalOpen,
  } = usePlaylistStore();

  const [filterQuery, setFilterQuery] = useState('');

  if (selectedSurahForAdd === null) return null;

  const surah = SURAHS.find((s) => s.number === selectedSurahForAdd);
  if (!surah) return null;

  const handleClose = () => {
    setSelectedSurahForAdd(null);
  };

  const handleToggle = (playlistId: string, isAlreadyIn: boolean) => {
    if (isAlreadyIn) {
      removeSurahFromPlaylist(playlistId, surah.number);
    } else {
      addSurahToPlaylist(playlistId, surah.number);
    }
  };

  const filteredPlaylists = playlists.filter((pl) =>
    pl.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[99999] z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-[32px] glass-panel bg-theme-surface/95 border border-theme-subtle p-6 shadow-2xl backdrop-blur-2xl flex flex-col gap-5 max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-playlist-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-1 pr-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Add to Personal Playlist
          </span>
          <h2 id="add-playlist-title" className="text-lg md:text-xl font-black text-theme-primary truncate">
            Surah {surah.englishName} ({surah.name})
          </h2>
          <p className="text-xs text-theme-secondary">
            Select one or more playlists to include this Surah.
          </p>
        </div>

        {/* Quick Filter & Create New Button */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search playlists..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-theme-elevated border border-theme-subtle text-xs text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            type="button"
            onClick={() => {
              setCreateModalOpen(true);
            }}
            className="py-2 px-3 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-subtle text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Playlist List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 max-h-[300px]">
          {filteredPlaylists.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
              <Library className="w-8 h-8 text-theme-muted opacity-40" />
              <p className="text-xs text-theme-secondary">
                {playlists.length === 0
                  ? 'No personal playlists yet.'
                  : 'No playlists match your search.'}
              </p>
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create your first playlist</span>
              </button>
            </div>
          ) : (
            filteredPlaylists.map((pl) => {
              const isInPlaylist = pl.surahNumbers.includes(surah.number);
              return (
                <div
                  key={pl.id}
                  onClick={() => handleToggle(pl.id, isInPlaylist)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                    isInPlaylist
                      ? 'bg-emerald-500/15 border-emerald-500 text-theme-primary shadow-sm'
                      : 'bg-theme-surface hover:bg-theme-elevated border-theme-subtle text-theme-secondary hover:text-theme-primary'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="font-bold text-xs md:text-sm truncate">{pl.name}</span>
                    <span className="text-[11px] text-theme-muted">
                      {pl.surahNumbers.length} {pl.surahNumbers.length === 1 ? 'surah' : 'surahs'}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isInPlaylist
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-theme-subtle bg-theme-elevated'
                    }`}
                  >
                    {isInPlaylist && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-2.5 px-4 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-subtle text-xs font-bold text-theme-primary transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
