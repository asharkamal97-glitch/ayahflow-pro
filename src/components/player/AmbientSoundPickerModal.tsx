'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { AMBIENT_SOUNDS } from '@/lib/constants';
import {
  X,
  Volume2,
  VolumeX,
  CloudRain,
  Flame,
  Droplets,
  SunMedium,
  Wind,
  Waves,
  Sparkles,
  Check,
  Zap,
  CloudLightning
} from 'lucide-react';

export const AmbientSoundPickerModal: React.FC = () => {
  const {
    isAmbientModalOpen,
    setAmbientModalOpen,
    selectedAmbientSound,
    setSelectedAmbientSound,
    ambientVolume,
    setAmbientVolume,
    isAmbientPlaying,
    toggleAmbientPlay,
  } = usePlayerStore();

  React.useEffect(() => {
    if (!isAmbientModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAmbientModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAmbientModalOpen, setAmbientModalOpen]);

  if (!isAmbientModalOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain': return <CloudRain className="w-5 h-5" />;
      case 'Flame': return <Flame className="w-5 h-5" />;
      case 'Droplets': return <Droplets className="w-5 h-5" />;
      case 'SunMedium': return <SunMedium className="w-5 h-5" />;
      case 'Wind': return <Wind className="w-5 h-5" />;
      case 'Waves': return <Waves className="w-5 h-5" />;
      case 'CloudLightning': return <CloudLightning className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div
      onClick={() => setAmbientModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Ambient Soundscapes"
      className="fixed inset-0 z-player-modal flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-theme-surface border border-theme-subtle rounded-3xl p-6 shadow-2xl cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-theme-primary tracking-tight">Ambient Soundscapes</h2>
            </div>
            <p className="text-xs text-theme-secondary mt-1">
              Layer calm atmospheric sounds beneath recitation for deep focus and tranquility
            </p>
          </div>
          <button
            onClick={() => setAmbientModalOpen(false)}
            className="p-2 text-theme-muted hover:text-theme-primary rounded-full hover:bg-theme-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Selection Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 max-h-[50vh] overflow-y-auto pr-1">
          {AMBIENT_SOUNDS.map((sound) => {
            const isSelected = selectedAmbientSound?.id === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedAmbientSound(null);
                  } else {
                    setSelectedAmbientSound(sound);
                  }
                }}
                className={`relative flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-sm'
                    : 'bg-theme-surface border-theme-subtle hover:bg-theme-elevated hover:border-theme-medium'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-xl ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-theme-elevated text-theme-secondary'
                  }`}>
                    {getIcon(sound.icon)}
                  </div>
                  {sound.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-theme-elevated text-theme-secondary border border-theme-subtle">
                      {sound.badge}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-sm text-theme-primary flex items-center gap-1.5">
                  {sound.name}
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] text-theme-muted line-clamp-1 mt-0.5">
                  {sound.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Ambient Volume Control */}
        {selectedAmbientSound && (
          <div className="p-4 rounded-2xl bg-theme-elevated border border-theme-subtle mb-4 animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-theme-primary flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Ambient Sound Volume
              </span>
              <span className="text-xs text-theme-muted font-mono">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAmbientPlay}
                className="text-xs px-2.5 py-1 rounded-lg bg-theme-surface hover:bg-theme-hover text-theme-primary border border-theme-subtle transition-colors cursor-pointer"
              >
                {isAmbientPlaying ? 'Pause' : 'Resume'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-theme-surface border border-theme-subtle rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          {selectedAmbientSound ? (
            <button
              onClick={() => setSelectedAmbientSound(null)}
              className="text-xs text-theme-secondary hover:text-rose-500 transition-colors cursor-pointer"
            >
              Turn off ambient sound
            </button>
          ) : (
            <span className="text-xs text-theme-muted">No background sound selected</span>
          )}

          <button
            onClick={() => setAmbientModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
