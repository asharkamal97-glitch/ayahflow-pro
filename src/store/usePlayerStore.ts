import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Surah, Reciter, Track, AmbientSound, ListeningInsights } from '@/types/quran';
import { SURAHS, RECITERS, getSurahAudioUrl, getCurrentTimeOfDayPeriod, AMBIENT_SOUNDS } from '@/lib/constants';
import { audioManager } from '@/lib/audioManager';
import { useTafsirSyncStore } from './useTafsirSyncStore';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  selectedReciter: Reciter;
  queue: Track[];
  playlist: Track[] | null;
  playlistIndex: number;
  sleepTimerEnd: number | null;
  sleepTimerMinutes: number | null;
  favorites: number[]; // Surah numbers

  // Mobile & Audio Enhancements
  playbackSpeed: number;
  selectedAmbientSound: AmbientSound | null;
  ambientVolume: number;
  isAmbientPlaying: boolean;

  // Modals & Sheets
  isFullScreenPlayerOpen: boolean;
  isTafsirModalOpen: boolean;
  isLiveTafsirActive: boolean;
  isAmbientModalOpen: boolean;
  isReportModalOpen: boolean;
  selectedTafsirId: string;

  // Offline Downloads
  downloadedSurahs: number[];

  // Habit & Insights
  insights: ListeningInsights;

  // Actions
  playSurah: (surah: Surah, reciter?: Reciter) => void;
  playPlaylist: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  skipBy: (seconds: number) => void;
  handleTrackEnded: (fromAudioUrl?: string) => void;
  handleAudioError: (failedUrl?: string) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setSelectedReciter: (reciter: Reciter) => void;
  setSleepTimer: (minutes: number | null) => void;
  toggleFavorite: (surahNumber: number) => void;
  setQueue: (tracks: Track[]) => void;
  updateProgress: (currentTime: number, duration: number) => void;

  // New Actions
  setPlaybackSpeed: (speed: number) => void;
  setSelectedAmbientSound: (sound: AmbientSound | null) => void;
  setAmbientVolume: (volume: number) => void;
  toggleAmbientPlay: () => void;
  setFullScreenPlayerOpen: (open: boolean) => void;
  setTafsirModalOpen: (open: boolean) => void;
  toggleLiveTafsir: () => void;
  setLiveTafsirActive: (active: boolean) => void;
  setAmbientModalOpen: (open: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  setSelectedTafsirId: (id: string) => void;
  toggleDownloadedSurah: (surahNumber: number) => void;
  recordListeningTime: (seconds: number) => void;
}

const initialInsights: ListeningInsights = {
  totalMinutesListened: 142,
  currentStreak: 4,
  bestStreak: 12,
  lastListenedDate: new Date().toISOString().split('T')[0],
  dailyMinutes: {
    [new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]]: 25,
    [new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0]]: 40,
    [new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0]]: 35,
    [new Date().toISOString().split('T')[0]]: 42,
  },
  timeOfDayStats: {
    afterFajr: 45,
    morning: 20,
    dhuhr: 15,
    afternoon: 10,
    afterMaghrib: 30,
    evening: 18,
    lateNight: 4,
  },
  reciterListens: {
    'yasser-al-dosari-sa': 68,
    'mishari-rashid-al-afasy-kw': 44,
    'abdul-basit-abd-us-samad-eg': 30,
  },
  surahListens: {
    1: 15,
    18: 38,
    36: 29,
    55: 22,
    67: 38,
  },
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: {
        surah: SURAHS[0], // Al-Fatihah
        reciter: RECITERS[0], // Yasser Al-Dosari
        audioUrl: getSurahAudioUrl(RECITERS[0], 1)
      },
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      isShuffle: false,
      repeatMode: 'all',
      selectedReciter: RECITERS[0],
      queue: [],
      playlist: null,
      playlistIndex: -1,
      sleepTimerEnd: null,
      sleepTimerMinutes: null,
      favorites: [1, 2, 18, 36, 55, 67, 112, 113, 114],

      // Mobile Enhancements
      playbackSpeed: 1.0,
      selectedAmbientSound: null,
      ambientVolume: 0.25,
      isAmbientPlaying: false,

      // Modals
      isFullScreenPlayerOpen: false,
      isTafsirModalOpen: false,
      isLiveTafsirActive: false,
      isAmbientModalOpen: false,
      isReportModalOpen: false,
      selectedTafsirId: 'en-tafsir-ibn-kathir',

      // Offline
      downloadedSurahs: [1, 18, 36, 67, 112, 113, 114],

      // Insights
      insights: initialInsights,

      playSurah: (surah, reciter) => {
        const activeReciter = reciter || get().selectedReciter;
        const track: Track = {
          surah,
          reciter: activeReciter,
          audioUrl: getSurahAudioUrl(activeReciter, surah.number)
        };
        set({
          currentTrack: track,
          selectedReciter: activeReciter,
          playlist: null,
          playlistIndex: -1,
          queue: [],
          isPlaying: true,
          currentTime: 0,
          duration: 0
        });

        // Load verified timestamps and text for live Tafsir synchronization
        useTafsirSyncStore.getState().loadSurahMetadata(surah.number, activeReciter.id);

        // Record surah / reciter listen
        const { insights } = get();
        const surahCount = (insights.surahListens[surah.number] || 0) + 1;
        const reciterCount = (insights.reciterListens[activeReciter.id] || 0) + 1;

        set({
          insights: {
            ...insights,
            surahListens: { ...insights.surahListens, [surah.number]: surahCount },
            reciterListens: { ...insights.reciterListens, [activeReciter.id]: reciterCount },
          }
        });
      },

      playPlaylist: (tracks, startIndex = 0) => {
        if (!tracks || tracks.length === 0) return;
        const idx = Math.max(0, Math.min(tracks.length - 1, startIndex));
        const track = tracks[idx];
        set({
          playlist: tracks,
          playlistIndex: idx,
          currentTrack: track,
          selectedReciter: track.reciter,
          queue: tracks.slice(idx + 1),
          isPlaying: true,
          currentTime: 0,
          duration: 0
        });

        useTafsirSyncStore.getState().loadSurahMetadata(track.surah.number, track.reciter.id);

        const { insights } = get();
        const surahCount = (insights.surahListens[track.surah.number] || 0) + 1;
        const reciterCount = (insights.reciterListens[track.reciter.id] || 0) + 1;

        set({
          insights: {
            ...insights,
            surahListens: { ...insights.surahListens, [track.surah.number]: surahCount },
            reciterListens: { ...insights.reciterListens, [track.reciter.id]: reciterCount },
          }
        });
      },

      togglePlay: () => {
        set((state) => ({ isPlaying: !state.isPlaying }));
      },

      pause: () => set({ isPlaying: false }),
      resume: () => set({ isPlaying: true }),

      handleTrackEnded: (fromAudioUrl) => {
        const { currentTrack, repeatMode, playlist, playlistIndex, queue, isShuffle, selectedReciter } = get();
        if (!currentTrack) return;
        if (fromAudioUrl && currentTrack.audioUrl !== fromAudioUrl) return;

        // 1. Repeat single track mode
        if (repeatMode === 'one') {
          audioManager.seek(0);
          set({ currentTime: 0, isPlaying: true });
          audioManager.playRecitation(currentTrack.audioUrl);
          return;
        }

        // 2. Playlist mode (explicit playlist queue active)
        if (playlist && playlist.length > 0) {
          const nextIdx = playlistIndex + 1;
          if (nextIdx < playlist.length) {
            const nextTrack = playlist[nextIdx];
            set({
              playlistIndex: nextIdx,
              currentTrack: nextTrack,
              queue: playlist.slice(nextIdx + 1),
              currentTime: 0,
              duration: 0,
              isPlaying: true
            });
            useTafsirSyncStore.getState().loadSurahMetadata(nextTrack.surah.number, nextTrack.reciter.id);
            const { insights } = get();
            set({
              insights: {
                ...insights,
                surahListens: { ...insights.surahListens, [nextTrack.surah.number]: (insights.surahListens[nextTrack.surah.number] || 0) + 1 },
                reciterListens: { ...insights.reciterListens, [nextTrack.reciter.id]: (insights.reciterListens[nextTrack.reciter.id] || 0) + 1 },
              }
            });
            return;
          }

          // Last track in playlist finished
          if (repeatMode === 'all') {
            const firstTrack = playlist[0];
            set({
              playlistIndex: 0,
              currentTrack: firstTrack,
              queue: playlist.slice(1),
              currentTime: 0,
              duration: 0,
              isPlaying: true
            });
            useTafsirSyncStore.getState().loadSurahMetadata(firstTrack.surah.number, firstTrack.reciter.id);
            const { insights } = get();
            set({
              insights: {
                ...insights,
                surahListens: { ...insights.surahListens, [firstTrack.surah.number]: (insights.surahListens[firstTrack.surah.number] || 0) + 1 },
                reciterListens: { ...insights.reciterListens, [firstTrack.reciter.id]: (insights.reciterListens[firstTrack.reciter.id] || 0) + 1 },
              }
            });
            return;
          }

          // repeatMode === 'off': finish cleanly without loop or jumping out of playlist
          set({ isPlaying: false, currentTime: 0 });
          return;
        }

        // 3. Custom ad-hoc queue
        if (queue.length > 0) {
          const nextTrack = queue[0];
          set({
            currentTrack: nextTrack,
            queue: queue.slice(1),
            currentTime: 0,
            duration: 0,
            isPlaying: true
          });
          useTafsirSyncStore.getState().loadSurahMetadata(nextTrack.surah.number, nextTrack.reciter.id);
          const { insights } = get();
          set({
            insights: {
              ...insights,
              surahListens: { ...insights.surahListens, [nextTrack.surah.number]: (insights.surahListens[nextTrack.surah.number] || 0) + 1 },
              reciterListens: { ...insights.reciterListens, [nextTrack.reciter.id]: (insights.reciterListens[nextTrack.reciter.id] || 0) + 1 },
            }
          });
          return;
        }

        // 4. Shuffle mode
        if (isShuffle) {
          const randomIdx = Math.floor(Math.random() * SURAHS.length);
          const nextSurah = SURAHS[randomIdx];
          get().playSurah(nextSurah, selectedReciter);
          return;
        }

        // 5. Automatic next-Surah in natural order (1 -> 2 -> ... -> 114)
        const currentNum = currentTrack.surah.number;
        if (currentNum < 114) {
          const nextSurah = SURAHS.find((s) => s.number === currentNum + 1) || SURAHS[currentNum];
          get().playSurah(nextSurah, selectedReciter);
          return;
        }

        // Final Surah 114 finished
        if (repeatMode === 'all') {
          get().playSurah(SURAHS[0], selectedReciter);
          return;
        }

        // repeatMode === 'off': finish cleanly at Surah 114
        set({ isPlaying: false, currentTime: 0 });
      },

      handleAudioError: (failedUrl) => {
        const { currentTrack, playlist, playlistIndex, queue } = get();
        console.warn('Playback error encountered on track:', currentTrack?.surah.englishName, failedUrl);
        if (playlist && playlist.length > 0 && playlistIndex + 1 < playlist.length) {
          get().next();
        } else if (queue.length > 0) {
          get().next();
        } else {
          set({ isPlaying: false });
        }
      },

      next: () => {
        const { currentTrack, isShuffle, selectedReciter, queue, playlist, playlistIndex } = get();
        if (!currentTrack) return;

        if (playlist && playlist.length > 0) {
          const nextIdx = (playlistIndex + 1) % playlist.length;
          const nextTrack = playlist[nextIdx];
          set({
            playlistIndex: nextIdx,
            currentTrack: nextTrack,
            queue: playlist.slice(nextIdx + 1),
            currentTime: 0,
            duration: 0,
            isPlaying: true
          });
          useTafsirSyncStore.getState().loadSurahMetadata(nextTrack.surah.number, nextTrack.reciter.id);
          return;
        }

        if (queue.length > 0) {
          const nextTrack = queue[0];
          set({
            currentTrack: nextTrack,
            queue: queue.slice(1),
            currentTime: 0,
            duration: 0,
            isPlaying: true
          });
          useTafsirSyncStore.getState().loadSurahMetadata(nextTrack.surah.number, nextTrack.reciter.id);
          return;
        }

        if (isShuffle) {
          const randomIdx = Math.floor(Math.random() * SURAHS.length);
          const nextSurah = SURAHS[randomIdx];
          get().playSurah(nextSurah, selectedReciter);
          return;
        }

        const nextNum = currentTrack.surah.number >= 114 ? 1 : currentTrack.surah.number + 1;
        const nextSurah = SURAHS.find((s) => s.number === nextNum) || SURAHS[0];
        get().playSurah(nextSurah, selectedReciter);
      },

      previous: () => {
        const { currentTrack, selectedReciter, currentTime, playlist, playlistIndex } = get();
        if (!currentTrack) return;

        if (currentTime > 3) {
          get().seek(0);
          return;
        }

        if (playlist && playlist.length > 0) {
          const prevIdx = playlistIndex <= 0 ? playlist.length - 1 : playlistIndex - 1;
          const prevTrack = playlist[prevIdx];
          set({
            playlistIndex: prevIdx,
            currentTrack: prevTrack,
            queue: playlist.slice(prevIdx + 1),
            currentTime: 0,
            duration: 0,
            isPlaying: true
          });
          useTafsirSyncStore.getState().loadSurahMetadata(prevTrack.surah.number, prevTrack.reciter.id);
          return;
        }

        const prevNum = currentTrack.surah.number <= 1 ? 114 : currentTrack.surah.number - 1;
        const prevSurah = SURAHS.find((s) => s.number === prevNum) || SURAHS[113];
        get().playSurah(prevSurah, selectedReciter);
      },

      seek: (seconds) => {
        const safeTarget = Math.max(0, seconds);
        const result = audioManager.seek(safeTarget);
        if (result.status === 'applied') {
          const appliedTarget = result.target ?? safeTarget;
          set({ currentTime: appliedTarget });
          useTafsirSyncStore.getState().updateByTime(appliedTarget);
        } else if (result.status === 'queued') {
          set({ currentTime: safeTarget });
          useTafsirSyncStore.getState().updateByTime(safeTarget);
        } else {
          // Rejected: do NOT update currentTime with a false position
          audioManager.notifyProgress();
        }
      },

      skipBy: (seconds) => {
        const { currentTime, duration } = get();
        let target = currentTime + seconds;
        if (target < 0) target = 0;
        if (duration > 0 && target > duration) target = duration;
        get().seek(target);
      },

      setVolume: (volume) => {
        const safe = Math.max(0, Math.min(1, volume));
        audioManager.setVolume(safe, get().isMuted);
        set({ volume: safe, isMuted: safe === 0 });
      },

      toggleMute: () => {
        const nextMuted = !get().isMuted;
        audioManager.setVolume(get().volume, nextMuted);
        set({ isMuted: nextMuted });
      },

      toggleShuffle: () => {
        set((state) => ({ isShuffle: !state.isShuffle }));
      },

      toggleRepeat: () => {
        const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const nextIdx = (modes.indexOf(get().repeatMode) + 1) % modes.length;
        set({ repeatMode: modes[nextIdx] });
      },

      setSelectedReciter: (reciter) => {
        set({ selectedReciter: reciter });
        const { currentTrack } = get();
        if (currentTrack) {
          const updatedTrack: Track = {
            surah: currentTrack.surah,
            reciter,
            audioUrl: getSurahAudioUrl(reciter, currentTrack.surah.number)
          };
          set({ currentTrack: updatedTrack, currentTime: 0, duration: 0 });
          useTafsirSyncStore.getState().loadSurahMetadata(currentTrack.surah.number, reciter.id);
        }
      },

      setSleepTimer: (minutes) => {
        if (minutes === null) {
          set({ sleepTimerEnd: null, sleepTimerMinutes: null });
        } else {
          const endTime = Date.now() + minutes * 60 * 1000;
          set({ sleepTimerEnd: endTime, sleepTimerMinutes: minutes });
        }
      },

      toggleFavorite: (surahNumber) => {
        set((state) => {
          const exists = state.favorites.includes(surahNumber);
          return {
            favorites: exists
              ? state.favorites.filter((id) => id !== surahNumber)
              : [...state.favorites, surahNumber]
          };
        });
      },

      setQueue: (tracks) => set({ queue: tracks }),

      updateProgress: (currentTime, duration) => {
        const currentStoredDuration = get().duration;
        const incomingDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
        const safeDuration = incomingDuration > 0 ? incomingDuration : currentStoredDuration;
        const nonNegativeTime = Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
        const safeCurrentTime = safeDuration > 0 ? Math.min(nonNegativeTime, safeDuration) : nonNegativeTime;
        const { sleepTimerEnd } = get();
        if (sleepTimerEnd && Date.now() >= sleepTimerEnd) {
          set({ isPlaying: false, sleepTimerEnd: null, sleepTimerMinutes: null });
        }
        set({ currentTime: safeCurrentTime, duration: safeDuration });
        useTafsirSyncStore.getState().updateByTime(safeCurrentTime);
      },

      setPlaybackSpeed: (speed) => {
        audioManager.setPlaybackRate(speed);
        set({ playbackSpeed: speed });
      },

      setSelectedAmbientSound: (sound) => {
        const canonical = sound ? AMBIENT_SOUNDS.find((s) => s.id === sound.id) || sound : null;
        set({
          selectedAmbientSound: canonical,
          isAmbientPlaying: canonical !== null
        });
      },

      setAmbientVolume: (volume) => {
        set({ ambientVolume: Math.max(0, Math.min(1, volume)) });
      },

      toggleAmbientPlay: () => {
        set((state) => ({ isAmbientPlaying: !state.isAmbientPlaying }));
      },

      setFullScreenPlayerOpen: (open) => set({ isFullScreenPlayerOpen: open }),
      setTafsirModalOpen: (open) => set({ isTafsirModalOpen: open }),
      toggleLiveTafsir: () => set((state) => ({ isLiveTafsirActive: !state.isLiveTafsirActive })),
      setLiveTafsirActive: (active) => set({ isLiveTafsirActive: active }),
      setAmbientModalOpen: (open) => set({ isAmbientModalOpen: open }),
      setReportModalOpen: (open) => set({ isReportModalOpen: open }),
      setSelectedTafsirId: (id) => {
        set({ selectedTafsirId: id });
        const { currentTrack } = get();
        if (currentTrack) {
          const syncState = useTafsirSyncStore.getState();
          syncState.loadTafsirForCurrentAyah(currentTrack.surah.number, syncState.currentAyahNumber, id);
        }
      },

      toggleDownloadedSurah: (surahNumber) => {
        set((state) => {
          const exists = state.downloadedSurahs.includes(surahNumber);
          return {
            downloadedSurahs: exists
              ? state.downloadedSurahs.filter((num) => num !== surahNumber)
              : [...state.downloadedSurahs, surahNumber]
          };
        });
      },

      recordListeningTime: (seconds) => {
        if (seconds <= 0) return;
        const minutes = Math.round(seconds / 60);
        if (minutes <= 0) return;

        const today = new Date().toISOString().split('T')[0];
        const period = getCurrentTimeOfDayPeriod();
        const { insights } = get();

        const dailyMinutes = {
          ...insights.dailyMinutes,
          [today]: (insights.dailyMinutes[today] || 0) + minutes
        };

        const timeOfDayStats = {
          ...insights.timeOfDayStats,
          [period]: (insights.timeOfDayStats[period] || 0) + minutes
        };

        // Streak calculation
        let currentStreak = insights.currentStreak;
        let bestStreak = insights.bestStreak;
        if (insights.lastListenedDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (insights.lastListenedDate === yesterday) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }
          if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
          }
        }

        set({
          insights: {
            ...insights,
            totalMinutesListened: insights.totalMinutesListened + minutes,
            currentStreak,
            bestStreak,
            lastListenedDate: today,
            dailyMinutes,
            timeOfDayStats
          }
        });
      }
    }),
    {
      name: 'quranify-player-storage-v3',
      partialize: (state) => ({
        selectedReciter: state.selectedReciter,
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        favorites: state.favorites,
        playbackSpeed: state.playbackSpeed,
        ambientVolume: state.ambientVolume,
        selectedAmbientSound: state.selectedAmbientSound,
        downloadedSurahs: state.downloadedSurahs,
        insights: state.insights,
      })
    }
  )
);
