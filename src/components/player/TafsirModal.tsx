'use client';

import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { TAFSIRS } from '@/lib/constants';
import { X, BookOpen, Check, ExternalLink } from 'lucide-react';

export const TafsirModal: React.FC = () => {
  const {
    isTafsirModalOpen,
    setTafsirModalOpen,
    selectedTafsirId,
    setSelectedTafsirId,
    currentTrack
  } = usePlayerStore();

  React.useEffect(() => {
    if (!isTafsirModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTafsirModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTafsirModalOpen, setTafsirModalOpen]);

  if (!isTafsirModalOpen || !currentTrack) return null;

  const currentTafsir = TAFSIRS.find((t) => t.id === selectedTafsirId) || TAFSIRS[0];

  return (
    <div
      onClick={() => setTafsirModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Tafsir & Translation"
      className="fixed inset-0 z-player-modal flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-theme-surface border border-theme-subtle rounded-3xl p-6 shadow-2xl overflow-hidden cursor-default text-theme-primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-theme-primary tracking-tight">
                Tafsir & Translation
              </h2>
              <p className="text-xs text-theme-secondary mt-0.5">
                Surah {currentTrack.surah.englishName} ({currentTrack.surah.name}) • {currentTrack.surah.numberOfAyahs} Ayahs
              </p>
            </div>
          </div>
          <button
            onClick={() => setTafsirModalOpen(false)}
            className="p-2 text-theme-muted hover:text-theme-primary rounded-full hover:bg-theme-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tafsir Source Selector */}
        <div className="py-4 border-b border-theme-subtle">
          <label className="text-xs font-semibold text-theme-muted uppercase tracking-wider block mb-2">
            Select Tafsir Source
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TAFSIRS.map((t) => {
              const isSelected = t.id === selectedTafsirId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTafsirId(t.id)}
                  className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-theme-primary shadow-sm'
                      : 'bg-theme-surface border-theme-subtle text-theme-secondary hover:bg-theme-elevated'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5 text-theme-primary">
                      {t.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-theme-muted mt-0.5">{t.author}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-theme-elevated text-theme-muted border border-theme-subtle shrink-0">
                    {t.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
          <div className="p-4 rounded-2xl bg-theme-elevated border border-theme-subtle">
            <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Surah Introduction ({currentTafsir.name})
            </h3>
            <p className="text-sm text-theme-secondary leading-relaxed">
              Surah {currentTrack.surah.englishName} (&ldquo;{currentTrack.surah.englishNameTranslation}&rdquo;) was revealed in{' '}
              <span className="text-theme-primary font-medium">{currentTrack.surah.revelationType}</span>. It comprises {currentTrack.surah.numberOfAyahs} ayahs. Scholars note this Surah establishes foundational principles of faith, monotheism, and moral guidance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-theme-elevated border border-theme-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-theme-primary">Ayah 1 Reflection</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                {currentTrack.surah.number}:1
              </span>
            </div>
            <div className="text-right font-serif text-xl text-theme-arabic py-2 border-b border-theme-subtle mb-2 leading-loose">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {currentTafsir.id === 'en-tafsir-ibn-kathir' &&
                'In the Name of Allah, the Most Gracious, the Most Merciful. Commencing with the name of Allah brings blessing upon every noble endeavor.'}
              {currentTafsir.id === 'ar-tafsir-muyassar' &&
                'أبتدئ قراءتي مستعينا باسم الله، وهو المستحق للعبادة وحده دون سواه، الرحمن الذي وسعت رحمته جميع الخلق.'}
              {currentTafsir.id === 'ar-tafsir-jalalayn' &&
                'أي أبدأ بتسمية الله تعالى، والرحمن الرحيم صفتان لله تعالى ذو الرحمة العظمى.'}
              {currentTafsir.id === 'en-saheeh' &&
                'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-theme-subtle flex items-center justify-between">
          <a
            href={`/surah/${currentTrack.surah.number}`}
            onClick={() => setTafsirModalOpen(false)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>Open full Surah reader</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setTafsirModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
