'use client';

import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Moon, X, Check } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SleepTimerModal({ isOpen, onClose }: SleepTimerModalProps) {
  const { sleepTimerEnd, sleepTimerMinutes, setSleepTimer } = usePlayerStore();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!sleepTimerEnd) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      const remainingMs = sleepTimerEnd - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const options = [15, 30, 45, 60];

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sleep Timer"
      className="fixed inset-0 z-player-modal flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[32px] bg-theme-surface p-6 border border-theme-subtle shadow-2xl flex flex-col gap-5 cursor-default text-theme-primary"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-theme-primary">Sleep Timer</h3>
              <p className="text-xs text-theme-secondary">Stop audio automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-theme-elevated text-theme-muted hover:text-theme-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {timeLeft && (
          <div className="py-2.5 px-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Active timer remaining:</span>
            <span className="text-sm font-mono font-bold text-purple-700 dark:text-purple-200">{timeLeft}</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {options.map((mins) => {
            const isSelected = sleepTimerMinutes === mins && !!sleepTimerEnd;
            return (
              <button
                key={mins}
                onClick={() => {
                  setSleepTimer(mins);
                  onClose();
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'bg-theme-elevated text-theme-secondary hover:text-theme-primary hover:bg-theme-hover border border-theme-subtle'
                }`}
              >
                <span>{mins} minutes</span>
                {isSelected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              </button>
            );
          })}

          {sleepTimerEnd && (
            <button
              onClick={() => {
                setSleepTimer(null);
                onClose();
              }}
              className="mt-1 p-3 rounded-2xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              Turn off timer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
