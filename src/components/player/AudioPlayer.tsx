'use client';

import React, { useRef, useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { PLAYBACK_SPEEDS, AMBIENT_SOUNDS } from '@/lib/constants';
import { audioManager, formatAudioTime, formatAudioDuration } from '@/lib/audioManager';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Moon,
  Heart,
  BookOpen,
  Sparkles,
  Maximize2
} from 'lucide-react';
import SleepTimerModal from './SleepTimerModal';
import { AmbientSoundPickerModal } from './AmbientSoundPickerModal';
import { TafsirModal } from './TafsirModal';
import { ReportDesyncModal } from './ReportDesyncModal';
import { FullScreenPlayer } from './FullScreenPlayer';

function subscribe() {
  return () => {};
}

export default function AudioPlayer() {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Reliable scrubbing state
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    sleepTimerEnd,
    favorites,
    togglePlay,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    updateProgress,
    toggleFavorite,
    playbackSpeed,
    setPlaybackSpeed,
    selectedAmbientSound,
    ambientVolume,
    isAmbientPlaying,
    isAmbientModalOpen,
    setAmbientModalOpen,
    setLiveTafsirActive,
    setFullScreenPlayerOpen,
    recordListeningTime,
    handleTrackEnded,
    handleAudioError
  } = usePlayerStore();

  // Resolve actual local audio url from AMBIENT_SOUNDS
  const currentAmbient = AMBIENT_SOUNDS.find((s) => s.id === selectedAmbientSound?.id);
  const ambientAudioUrl = currentAmbient ? currentAmbient.audioUrl : (selectedAmbientSound?.audioUrl || '');

  // Callback ref guarantees real DOM element is immediately registered with AudioManager
  const handleAudioRef = useCallback((element: HTMLAudioElement | null) => {
    audioRef.current = element;
    if (element) {
      audioManager.registerAudioElement(element);
    }
  }, []);

  // Subscribe to authoritative media events from AudioManager
  useEffect(() => {
    if (audioRef.current) {
      audioManager.registerAudioElement(audioRef.current);
    }

    const unsubProgress = audioManager.onProgress((time, dur) => {
      updateProgress(time, dur);
    });

    const unsubEnded = audioManager.onEnded(() => {
      handleTrackEnded(currentTrack?.audioUrl);
    });

    const unsubError = audioManager.onError(() => {
      handleAudioError(currentTrack?.audioUrl);
    });

    return () => {
      unsubProgress();
      unsubEnded();
      unsubError();
    };
  }, [updateProgress, handleTrackEnded, handleAudioError, currentTrack?.audioUrl]);

  // Sync main recitation play/pause
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch((err: any) => {
        if (err.name === 'AbortError') {
          // Play request was interrupted by a new load or play call; normal during track transitions
          return;
        }
        if (err.name === 'NotAllowedError') {
          console.warn('Playback prevented by browser autoplay policy:', err);
          pause();
        }
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack?.audioUrl, playbackSpeed, pause]);

  // Sync recitation volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sync playback speed
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Sync secondary ambient audio element
  useEffect(() => {
    const ambientEl = ambientAudioRef.current;
    if (!ambientEl) {
      audioManager.registerAmbientElement(null);
      return;
    }

    ambientEl.volume = isMuted ? 0 : ambientVolume;

    if (ambientAudioUrl) {
      const shouldPlay = isAmbientPlaying && (isPlaying || isAmbientModalOpen);

      if (shouldPlay) {
        ambientEl.play().catch((err) => {
          console.warn('Ambient sound play prevented:', err);
        });
      } else {
        ambientEl.pause();
      }
    } else {
      ambientEl.pause();
    }
  }, [ambientAudioUrl, selectedAmbientSound, isAmbientPlaying, isPlaying, isAmbientModalOpen, ambientVolume, isMuted]);

  // Record periodic listening time for insights
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      recordListeningTime(15);
    }, 15000);

    return () => clearInterval(interval);
  }, [isPlaying, recordListeningTime]);

  // MediaSession API setup for lock screen / notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${currentTrack.surah.number}. ${currentTrack.surah.englishName} (${currentTrack.surah.name})`,
      artist: `${currentTrack.reciter.englishName} • AyahFlow Pro`,
      album: 'The Holy Quran',
      artwork: [
        { src: currentTrack.reciter.avatar, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => next());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seek(details.seekTime);
      }
    });
  }, [currentTrack, pause, resume, next, previous, seek]);

  if (!isClient || !currentTrack) return null;

  const isFav = favorites.includes(currentTrack.surah.number);

  const effectiveTime = isDragging ? dragTime : currentTime;

  const handlePointerDown = () => {
    setIsDragging(true);
    setDragTime(currentTime);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (isDragging) {
      setDragTime(isNaN(val) ? 0 : val);
    } else {
      seek(isNaN(val) ? 0 : val);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    const safeTarget = isNaN(dragTime) ? 0 : dragTime;
    seek(safeTarget);
    setIsDragging(false);
  };

  return (
    <>
      {/* Primary Recitation Audio Element */}
      <audio
        ref={handleAudioRef}
        data-quran-audio="true"
        src={currentTrack.audioUrl}
        preload="metadata"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!audioManager.isSeeking()) {
            updateProgress(el.currentTime, el.duration);
          }
        }}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          el.playbackRate = playbackSpeed;
          updateProgress(el.currentTime, el.duration);
          if (isPlaying && el.paused) {
            el.play().catch(() => {});
          }
        }}
        onDurationChange={(e) => {
          const el = e.currentTarget;
          updateProgress(el.currentTime, el.duration);
        }}
        onCanPlay={(e) => {
          const el = e.currentTarget;
          updateProgress(el.currentTime, el.duration);
          if (isPlaying && el.paused) {
            el.play().catch(() => {});
          }
        }}
        onEnded={() => {
          handleTrackEnded(currentTrack.audioUrl);
        }}
        onError={() => {
          handleAudioError(currentTrack.audioUrl);
        }}
      />

      {/* Secondary Ambient Loop Audio Element - Only render when valid URL exists */}
      {ambientAudioUrl ? (
        <audio
          ref={(node) => {
            ambientAudioRef.current = node;
            audioManager.registerAmbientElement(node);
          }}
          src={ambientAudioUrl}
          loop
          preload="auto"
        />
      ) : null}

      {/* Persistent Floating Bottom Bar */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+max(0.35rem,env(safe-area-inset-bottom,0px)))] md:bottom-0 z-player-dock p-2 md:p-3 pointer-events-none">
        <div className="max-w-7xl mx-auto rounded-[28px] md:rounded-[32px] glass-panel bg-theme-surface/95 backdrop-blur-2xl border border-theme-subtle px-4 py-2.5 md:px-6 md:py-3.5 shadow-2xl flex items-center justify-between gap-3 md:gap-8 pointer-events-auto">
          {/* Left: Track Info & Expand Button */}
          <div className="flex items-center gap-3 min-w-0 md:w-1/4">
            <button
              onClick={() => setFullScreenPlayerOpen(true)}
              className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden shrink-0 bg-theme-elevated border border-theme-subtle shadow-md group cursor-pointer"
              title="Expand full screen player"
            >
              <img
                src={currentTrack.reciter.avatar}
                alt={currentTrack.reciter.englishName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-5 h-5 text-white drop-shadow" />
              </div>
            </button>

            <div
              onClick={() => setFullScreenPlayerOpen(true)}
              className="flex flex-col min-w-0 cursor-pointer"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-sm md:text-base text-theme-primary truncate hover:underline">
                  {currentTrack.surah.englishName}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-serif">
                  ({currentTrack.surah.name})
                </span>
              </div>
              <p className="text-xs text-theme-secondary truncate">
                {currentTrack.reciter.englishName}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentTrack.surah.number)}
              className="p-1.5 rounded-full hover:bg-theme-elevated text-theme-muted hover:text-rose-500 transition-colors cursor-pointer shrink-0"
              title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
            {/* Control buttons */}
            <div className="flex items-center gap-3 md:gap-6">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-full transition-colors cursor-pointer hidden sm:block ${
                  isShuffle ? 'text-emerald-600 dark:text-emerald-400' : 'text-theme-muted hover:text-theme-primary'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={previous}
                className="p-1.5 rounded-full text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer active:scale-95"
                title="Previous Surah"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={next}
                className="p-1.5 rounded-full text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer active:scale-95"
                title="Next Surah"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-full transition-colors cursor-pointer hidden sm:block ${
                  repeatMode !== 'off' ? 'text-emerald-600 dark:text-emerald-400' : 'text-theme-muted hover:text-theme-primary'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Scrubber slider */}
            <div className="w-full flex items-center gap-2.5 text-[11px] text-theme-muted font-mono">
              <span className="w-10 text-right shrink-0">{formatAudioTime(effectiveTime)}</span>
              <div className="relative flex-1 flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={duration > 0 ? duration : 100}
                  step={0.1}
                  value={effectiveTime}
                  onPointerDown={handlePointerDown}
                  onTouchStart={handlePointerDown}
                  onChange={handleSliderChange}
                  onPointerUp={handlePointerUp}
                  onTouchEnd={handlePointerUp}
                  aria-label="Quran playback seeker"
                  className="w-full h-1 bg-theme-elevated border border-theme-subtle rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:h-1.5 transition-all"
                />
              </div>
              <span className="w-10 shrink-0">{formatAudioDuration(duration)}</span>
            </div>
          </div>

          {/* Right: Ambient Sound, Tafsir, Speed & Volume */}
          <div className="hidden lg:flex items-center justify-end gap-3 w-1/4">
            {/* Ambient Sound Button */}
            <button
              onClick={() => setAmbientModalOpen(true)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                selectedAmbientSound
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
              }`}
              title="Ambient atmospheric sounds"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px]">{selectedAmbientSound ? selectedAmbientSound.name : 'Ambient'}</span>
            </button>

            {/* Tafsir Button */}
            <button
              onClick={() => {
                setLiveTafsirActive(true);
                setFullScreenPlayerOpen(true);
              }}
              className="p-2 rounded-xl text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="Open Live Tafsir & Subtitles"
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px]">Tafsir</span>
            </button>

            {/* Speed Selector */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              aria-label="Playback speed"
              className="appearance-none bg-theme-elevated border border-theme-subtle text-theme-primary text-[11px] font-semibold px-2 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              {PLAYBACK_SPEEDS.map((s) => (
                <option key={s} value={s} className="bg-theme-surface text-theme-primary">
                  {s}x
                </option>
              ))}
            </select>

            {/* Sleep Timer */}
            <button
              onClick={() => setIsTimerOpen(true)}
              className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                sleepTimerEnd
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="text-theme-secondary hover:text-theme-primary p-1 transition-colors cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Recitation volume"
                className="w-14 h-1 bg-theme-elevated border border-theme-subtle rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals & FullScreen Overlays */}
      <FullScreenPlayer />
      <SleepTimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
      <AmbientSoundPickerModal />
      <TafsirModal />
      <ReportDesyncModal />
    </>
  );
}
