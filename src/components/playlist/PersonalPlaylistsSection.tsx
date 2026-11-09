'use client';

import React, { useState } from 'react';
import { usePlaylistStore } from '@/store/usePlaylistStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SURAHS } from '@/lib/constants';
import { UserPlaylist } from '@/types/quran';
import {
  Library,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Music,
  User,
  ShieldCheck,
  Cloud,
  CloudOff,
} from 'lucide-react';
import CreatePlaylistModal from './CreatePlaylistModal';

export default function PersonalPlaylistsSection() {
  const {
    playlists,
    activePlaylistId,
    deletePlaylist,
    removeSurahFromPlaylist,
    reorderSurahInPlaylist,
    setActivePlaylistId,
    getPlaylistTracks,
    setCreateModalOpen,
  } = usePlaylistStore();

  const { currentTrack, isPlaying, playPlaylist, togglePlay, selectedReciter } = usePlayerStore();
  const { currentUser, setAuthModalOpen } = useAuthStore();

  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
  const [playlistToEdit, setPlaylistToEdit] = useState<UserPlaylist | null>(null);

  const handlePlayPlaylist = (playlist: UserPlaylist, startIndex = 0) => {
    const tracks = getPlaylistTracks(playlist.id, selectedReciter);
    if (tracks.length === 0) return;

    setActivePlaylistId(playlist.id);
    playPlaylist(tracks, startIndex);
  };

  const isPlaylistActive = (playlistId: string) => {
    return activePlaylistId === playlistId && isPlaying;
  };

  return (
    <section className="flex flex-col gap-5">
      {/* Edit Modal */}
      {playlistToEdit && (
        <CreatePlaylistModal
          isOpen={true}
          onClose={() => setPlaylistToEdit(null)}
          playlistToEdit={playlistToEdit}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-theme-primary tracking-tight">
                Personal Playlists
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle">
                {playlists.length}
              </span>
            </div>
            <p className="text-xs text-theme-secondary">
              {currentUser
                ? `Saved to your private account (${currentUser.email})`
                : 'Local guest library • Sign in to sync across devices'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!currentUser && (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true, 'signin')}
              className="px-3 py-1.5 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-subtle text-xs font-semibold text-theme-secondary hover:text-theme-primary transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Sync</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Playlist Grid / Cards */}
      {playlists.length === 0 ? (
        <div className="rounded-[28px] glass-panel p-8 text-center border border-theme-subtle flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-theme-elevated border border-theme-subtle text-theme-muted flex items-center justify-center">
            <Library className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-base font-bold text-theme-primary">Create Your First Playlist</h3>
            <p className="text-xs text-theme-secondary">
              Organize your favorite surahs in custom sequence. Play them in order with continuous sequential advancement.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="py-2.5 px-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map((playlist) => {
            const isPlayingThis = isPlaylistActive(playlist.id);
            const isExpanded = expandedPlaylistId === playlist.id;
            const surahObjects = playlist.surahNumbers
              .map((num) => SURAHS.find((s) => s.number === num))
              .filter(Boolean);

            return (
              <div
                key={playlist.id}
                className={`rounded-[28px] glass-panel p-5 border transition-all flex flex-col justify-between gap-4 ${
                  isPlayingThis
                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg'
                    : 'border-theme-subtle hover:border-theme-medium shadow-md'
                }`}
              >
                {/* Playlist Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                        isPlayingThis
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md animate-pulse'
                          : 'bg-theme-elevated text-emerald-600 dark:text-emerald-400 border-theme-subtle'
                      }`}
                    >
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-bold text-base text-theme-primary truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-theme-secondary truncate">
                        {playlist.description || `${playlist.surahNumbers.length} Surahs`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPlaylistToEdit(playlist)}
                      className="p-1.5 rounded-xl hover:bg-theme-elevated text-theme-muted hover:text-theme-primary transition-colors cursor-pointer"
                      title="Rename playlist"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete playlist "${playlist.name}"?`)) {
                          deletePlaylist(playlist.id);
                        }
                      }}
                      className="p-1.5 rounded-xl hover:bg-theme-elevated text-theme-muted hover:text-rose-500 transition-colors cursor-pointer"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Surahs Summary & Play Action */}
                <div className="flex items-center justify-between pt-2 border-t border-theme-subtle">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPlaylistId(isExpanded ? null : playlist.id)
                    }
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{playlist.surahNumbers.length} Surahs</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    disabled={playlist.surahNumbers.length === 0}
                    onClick={() => {
                      if (isPlayingThis) {
                        togglePlay();
                      } else {
                        handlePlayPlaylist(playlist, 0);
                      }
                    }}
                    className="py-2 px-4 rounded-full bg-theme-elevated hover:bg-emerald-600 hover:text-white disabled:opacity-40 text-theme-primary text-xs font-bold transition-all border border-theme-subtle flex items-center gap-2 cursor-pointer"
                  >
                    {isPlayingThis ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>Play All</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded Surah List with Reorder & Remove Controls */}
                {isExpanded && (
                  <div className="flex flex-col gap-1.5 pt-3 border-t border-theme-subtle animate-in fade-in duration-150">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted pb-1">
                      Saved Order (Drag or tap arrows to reorder)
                    </span>
                    {surahObjects.length === 0 ? (
                      <p className="text-xs text-theme-muted italic py-2">
                        No surahs added yet. Browse surahs below to add them to this playlist.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
                        {surahObjects.map((s, idx) => {
                          if (!s) return null;
                          const isCurrentActive =
                            currentTrack?.surah.number === s.number &&
                            activePlaylistId === playlist.id;

                          return (
                            <div
                              key={`${s.number}_${idx}`}
                              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                                isCurrentActive
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                                  : 'bg-theme-elevated hover:bg-theme-surface text-theme-primary'
                              }`}
                            >
                              <div
                                onClick={() => handlePlayPlaylist(playlist, idx)}
                                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                              >
                                <span className="font-mono text-theme-muted text-[11px] w-5 text-right shrink-0">
                                  {idx + 1}.
                                </span>
                                <span className="truncate">{s.englishName}</span>
                                <span className="text-theme-muted font-serif text-[11px] shrink-0">
                                  ({s.name})
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => reorderSurahInPlaylist(playlist.id, idx, idx - 1)}
                                  className="p-1 rounded hover:bg-theme-surface disabled:opacity-20 text-theme-muted hover:text-theme-primary cursor-pointer"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === playlist.surahNumbers.length - 1}
                                  onClick={() => reorderSurahInPlaylist(playlist.id, idx, idx + 1)}
                                  className="p-1 rounded hover:bg-theme-surface disabled:opacity-20 text-theme-muted hover:text-theme-primary cursor-pointer"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSurahFromPlaylist(playlist.id, s.number)}
                                  className="p-1 rounded hover:bg-theme-surface text-theme-muted hover:text-rose-500 cursor-pointer ml-1"
                                  title="Remove from playlist"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
