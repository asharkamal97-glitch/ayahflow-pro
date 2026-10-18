'use client';

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { X, Flag, CheckCircle2 } from 'lucide-react';

export const ReportDesyncModal: React.FC = () => {
  const {
    isReportModalOpen,
    setReportModalOpen,
    currentTrack,
    currentTime
  } = usePlayerStore();

  const [issueType, setIssueType] = useState<'timing' | 'audio_cut' | 'pronunciation' | 'other'>('timing');
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  React.useEffect(() => {
    if (!isReportModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReportModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReportModalOpen, setReportModalOpen]);

  if (!isReportModalOpen || !currentTrack) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setComments('');
      setReportModalOpen(false);
    }, 1800);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={() => setReportModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Report Audio or Timing Issue"
      className="fixed inset-0 z-player-modal flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-theme-surface border border-theme-subtle rounded-3xl p-6 shadow-2xl cursor-default text-theme-primary"
      >
        <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Flag className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-theme-primary tracking-tight">Report Audio Issue</h2>
              <p className="text-xs text-theme-secondary mt-0.5">
                Surah {currentTrack.surah.englishName} at {formatTime(currentTime)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReportModalOpen(false)}
            className="p-2 text-theme-muted hover:text-theme-primary rounded-full hover:bg-theme-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-3 animate-in zoom-in" />
            <h3 className="text-base font-bold text-theme-primary">JazakAllah Khair!</h3>
            <p className="text-xs text-theme-secondary mt-1 max-w-xs">
              Thank you for helping keep Quran recitation timing accurate for listeners.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider block mb-2">
                What seems to be the issue?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'timing', label: 'Audio and verse text are not synchronized' },
                  { id: 'audio_cut', label: 'Audio cuts off or stutters' },
                  { id: 'pronunciation', label: 'Mispronunciation or audio glitch' },
                  { id: 'other', label: 'Other recitation or metadata issue' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      issueType === item.id
                        ? 'bg-amber-500/10 border-amber-500 text-theme-primary'
                        : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:bg-theme-elevated'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      checked={issueType === item.id}
                      onChange={() => setIssueType(item.id as 'timing' | 'audio_cut' | 'pronunciation' | 'other')}
                      className="accent-amber-500"
                    />
                    <span className="text-xs font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider block mb-1.5">
                Additional details (optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Mention specific ayah number or what happened..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl bg-theme-elevated border border-theme-subtle text-theme-primary placeholder-theme-muted focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-full text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-full bg-amber-500 hover:bg-amber-400 text-black transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
