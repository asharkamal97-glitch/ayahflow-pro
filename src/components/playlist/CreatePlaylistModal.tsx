'use client';

import React, { useState } from 'react';
import { usePlaylistStore } from '@/store/usePlaylistStore';
import { X, Library, Plus } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  playlistToEdit?: { id: string; name: string; description?: string } | null;
}

interface CreatePlaylistModalContentProps {
  onClose: () => void;
  playlistToEdit?: { id: string; name: string; description?: string } | null;
}

function CreatePlaylistModalContent({ onClose, playlistToEdit }: CreatePlaylistModalContentProps) {
  const { createPlaylist, renamePlaylist, updatePlaylistDescription } = usePlaylistStore();

  const [name, setName] = useState(playlistToEdit?.name || '');
  const [description, setDescription] = useState(playlistToEdit?.description || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please provide a name for your playlist.');
      return;
    }

    if (playlistToEdit) {
      renamePlaylist(playlistToEdit.id, cleanName);
      updatePlaylistDescription(playlistToEdit.id, description.trim());
    } else {
      createPlaylist(cleanName, description.trim());
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-[32px] glass-panel bg-theme-surface/95 border border-theme-subtle p-6 shadow-2xl backdrop-blur-2xl flex flex-col gap-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="playlist-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
            <Library className="w-6 h-6" />
          </div>
          <h2 id="playlist-modal-title" className="text-xl md:text-2xl font-black text-theme-primary tracking-tight">
            {playlistToEdit ? 'Edit Playlist' : 'Create Personal Playlist'}
          </h2>
          <p className="text-xs text-theme-secondary max-w-xs">
            {playlistToEdit
              ? 'Update the title and reflections for this playlist.'
              : 'Curate a sanctuary of your favorite Surahs in your own custom order.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <span>•</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme-secondary">Playlist Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Fajr Reflections, Tahajjud Peace..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-theme-elevated border border-theme-subtle text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme-secondary">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Personal notes, intentions, or reflection reminders..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-theme-elevated border border-theme-subtle text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-theme-subtle text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {playlistToEdit ? (
                <span>Save Changes</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Playlist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreatePlaylistModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  playlistToEdit,
}: CreatePlaylistModalProps) {
  const { isCreateModalOpen, setCreateModalOpen } = usePlaylistStore();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isCreateModalOpen;
  const handleClose = propOnClose || (() => setCreateModalOpen(false));

  if (!isOpen) return null;

  return (
    <CreatePlaylistModalContent
      key={playlistToEdit?.id || 'new-playlist'}
      onClose={handleClose}
      playlistToEdit={playlistToEdit}
    />
  );
}
