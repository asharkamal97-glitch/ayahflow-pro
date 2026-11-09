import { create } from 'zustand';
import { UserPlaylist, Track, Reciter } from '@/types/quran';
import { useAuthStore } from './useAuthStore';
import { SURAHS, RECITERS, getSurahAudioUrl } from '@/lib/constants';
import { syncService } from '@/lib/supabase/syncService';

interface PlaylistState {
  playlists: UserPlaylist[];
  activePlaylistId: string | null;
  isCreateModalOpen: boolean;
  selectedSurahForAdd: number | null; // For "Add to Playlist" picker

  // Actions
  loadPlaylists: () => void;
  createPlaylist: (name: string, description?: string, initialSurahNumbers?: number[]) => UserPlaylist;
  renamePlaylist: (id: string, newName: string) => void;
  updatePlaylistDescription: (id: string, description: string) => void;
  deletePlaylist: (id: string) => void;
  addSurahToPlaylist: (playlistId: string, surahNumber: number) => boolean;
  removeSurahFromPlaylist: (playlistId: string, surahNumber: number) => void;
  reorderSurahInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  setActivePlaylistId: (id: string | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setSelectedSurahForAdd: (surahNumber: number | null) => void;
  getPlaylistTracks: (playlistId: string, customReciter?: Reciter) => Track[];
}

function generatePlaylistId(): string {
  // Generate valid UUIDv4-like string so it integrates seamlessly with Supabase uuid column
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  activePlaylistId: null,
  isCreateModalOpen: false,
  selectedSurahForAdd: null,

  loadPlaylists: () => {
    const userData = useAuthStore.getState().getUserData();
    set({
      playlists: userData.playlists || [],
      activePlaylistId: userData.lastActivePlaylistId || null,
    });

    // If cloud connected and user signed in, sync latest cloud playlists in background
    const { currentUser, isCloudConnected } = useAuthStore.getState();
    if (currentUser && isCloudConnected) {
      syncService.pullUserPlaylists(currentUser.id).then((res) => {
        if (res.success && res.data) {
          set({ playlists: res.data });
          useAuthStore.getState().saveUserData({ playlists: res.data });
        }
      }).catch((err) => {
        console.warn('Background playlist sync skipped:', err);
      });
    }
  },

  createPlaylist: (name, description = '', initialSurahNumbers = []) => {
    const cleanName = name.trim() || 'My Playlist';
    const newPlaylist: UserPlaylist = {
      id: generatePlaylistId(),
      name: cleanName,
      description: description.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      surahNumbers: [...initialSurahNumbers],
    };

    const updated = [newPlaylist, ...get().playlists];
    set({ playlists: updated });
    useAuthStore.getState().saveUserData({ playlists: updated });

    // Cloud push
    const { currentUser, isCloudConnected } = useAuthStore.getState();
    if (currentUser && isCloudConnected) {
      syncService.pushPlaylist(currentUser.id, newPlaylist).catch(() => {});
    }

    return newPlaylist;
  },

  renamePlaylist: (id, newName) => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    let targetPl: UserPlaylist | undefined;
    const updated = get().playlists.map((pl) => {
      if (pl.id === id) {
        targetPl = { ...pl, name: cleanName, updatedAt: Date.now() };
        return targetPl;
      }
      return pl;
    });

    set({ playlists: updated });
    useAuthStore.getState().saveUserData({ playlists: updated });

    const { currentUser, isCloudConnected } = useAuthStore.getState();
    if (currentUser && isCloudConnected && targetPl) {
      syncService.pushPlaylist(currentUser.id, targetPl).catch(() => {});
    }
  },

  updatePlaylistDescription: (id, description) => {
    let targetPl: UserPlaylist | undefined;
    const updated = get().playlists.map((pl) => {
      if (pl.id === id) {
        targetPl = { ...pl, description: description.trim(), updatedAt: Date.now() };
        return targetPl;
      }
      return pl;
    });

    set({ playlists: updated });
    useAuthStore.getState().saveUserData({ playlists: updated });

    const { currentUser, isCloudConnected } = useAuthStore.getState();
    if (currentUser && isCloudConnected && targetPl) {
      syncService.pushPlaylist(currentUser.id, targetPl).catch(() => {});
    }
  },

  deletePlaylist: (id) => {
    const updated = get().playlists.filter((pl) => pl.id !== id);
    const { activePlaylistId } = get();
    const newActive = activePlaylistId === id ? null : activePlaylistId;

    set({ playlists: updated, activePlaylistId: newActive });
    useAuthStore.getState().saveUserData({
      playlists: updated,
      lastActivePlaylistId: newActive,
    });

    const { currentUser, isCloudConnected } = useAuthStore.getState();
    if (currentUser && isCloudConnected) {
      syncService.deleteCloudPlaylist(currentUser.id, id).catch(() => {});
    }
  },

  addSurahToPlaylist: (playlistId, surahNumber) => {
    if (surahNumber < 1 || surahNumber > 114) return false;

    let added = false;
    let targetPl: UserPlaylist | undefined;

    const updated = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        if (!pl.surahNumbers.includes(surahNumber)) {
          added = true;
          targetPl = {
            ...pl,
            surahNumbers: [...pl.surahNumbers, surahNumber],
            updatedAt: Date.now(),
          };
          return targetPl;
        }
      }
      return pl;
    });

    if (added) {
      set({ playlists: updated });
      useAuthStore.getState().saveUserData({ playlists: updated });

      const { currentUser, isCloudConnected } = useAuthStore.getState();
      if (currentUser && isCloudConnected && targetPl) {
        syncService.pushPlaylist(currentUser.id, targetPl).catch(() => {});
      }
    }
    return added;
  },

  removeSurahFromPlaylist: (playlistId, surahNumber) => {
    let targetPl: UserPlaylist | undefined;
    const updated = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        targetPl = {
          ...pl,
          surahNumbers: pl.surahNumbers.filter((n) => n !== surahNumber),
          updatedAt: Date.now(),
        };
        return targetPl;
      }
      return pl;
    });

    set({ playlists: updated });
    useAuthStore.getState().saveUserData({ playlists: updated });

    const { currentUser, isCloudConnected } = useAuthStore.getState();
    if (currentUser && isCloudConnected && targetPl) {
      syncService.pushPlaylist(currentUser.id, targetPl).catch(() => {});
    }
  },

  reorderSurahInPlaylist: (playlistId, fromIndex, toIndex) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist) return;
    if (fromIndex < 0 || fromIndex >= playlist.surahNumbers.length) return;
    if (toIndex < 0 || toIndex >= playlist.surahNumbers.length) return;
    if (fromIndex === toIndex) return;

    const reorderedNumbers = [...playlist.surahNumbers];
    const [moved] = reorderedNumbers.splice(fromIndex, 1);
    reorderedNumbers.splice(toIndex, 0, moved);

    let targetPl: UserPlaylist | undefined;
    const updated = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        targetPl = {
          ...pl,
          surahNumbers: reorderedNumbers,
          updatedAt: Date.now(),
        };
        return targetPl;
      }
      return pl;
    });

    set({ playlists: updated });
    useAuthStore.getState().saveUserData({ playlists: updated });

    const { currentUser, isCloudConnected } = useAuthStore.getState();
    if (currentUser && isCloudConnected && targetPl) {
      syncService.pushPlaylist(currentUser.id, targetPl).catch(() => {});
    }
  },

  setActivePlaylistId: (id) => {
    set({ activePlaylistId: id });
    useAuthStore.getState().saveUserData({ lastActivePlaylistId: id });
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setSelectedSurahForAdd: (surahNumber) => set({ selectedSurahForAdd: surahNumber }),

  getPlaylistTracks: (playlistId, customReciter) => {
    const playlist = get().playlists.find((pl) => pl.id === playlistId);
    if (!playlist || playlist.surahNumbers.length === 0) return [];

    const reciter = customReciter || RECITERS[0];
    // Preserve the exact saved order of surahs in playlist.surahNumbers
    const tracks: Track[] = [];
    for (const num of playlist.surahNumbers) {
      const surah = SURAHS.find((s) => s.number === num);
      if (surah) {
        tracks.push({
          surah,
          reciter,
          audioUrl: getSurahAudioUrl(reciter, surah.number),
        });
      }
    }
    return tracks;
  },
}));
