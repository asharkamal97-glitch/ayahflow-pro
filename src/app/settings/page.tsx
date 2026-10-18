'use client';

import React from 'react';
import Image from 'next/image';
import { useThemeStore, ThemePreference } from '@/store/useThemeStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Sparkles,
  BookOpen,
  Volume2,
  Download,
  Info,
  ChevronRight,
  ShieldCheck,
  Heart
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { themePreference, resolvedTheme, setThemePreference } = useThemeStore();
  const { downloadedSurahs, favorites, playbackSpeed, setPlaybackSpeed } = usePlayerStore();

  const appearanceOptions: {
    id: ThemePreference;
    title: string;
    description: string;
    icon: typeof Sun;
    previewBg: string;
    previewCard: string;
    previewText: string;
    previewAccent: string;
  }[] = [
    {
      id: 'light',
      title: 'Light Mode',
      description: 'Warm ivory background with dark charcoal text and emerald green.',
      icon: Sun,
      previewBg: 'bg-[#FBF9F5]',
      previewCard: 'bg-white border-[#EAE5DC]',
      previewText: 'bg-[#1C1917]',
      previewAccent: 'bg-[#059669]',
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      description: 'Deep layered charcoal designed for nighttime comfort without harsh contrast.',
      icon: Moon,
      previewBg: 'bg-[#121316]',
      previewCard: 'bg-[#181A1F] border-[#242730]',
      previewText: 'bg-[#F5F5F5]',
      previewAccent: 'bg-[#10B981]',
    },
    {
      id: 'system',
      title: 'System Default',
      description: "Automatically adjusts to your Android or iOS device's appearance setting.",
      icon: Laptop,
      previewBg: 'bg-gradient-to-r from-[#FBF9F5] to-[#121316]',
      previewCard: 'bg-white/90 dark:bg-[#181A1F] border-black/10 dark:border-white/10',
      previewText: 'bg-black/80 dark:bg-white/80',
      previewAccent: 'bg-emerald-500',
    },
  ];

  return (
    <div className="flex flex-col gap-8 md:gap-10 px-4 md:px-10 py-6 md:py-8 max-w-4xl mx-auto w-full pb-32">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Preferences
          </span>
          <span className="text-xs text-theme-muted font-medium">
            Active: {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-theme-primary">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-theme-secondary">
          Configure app appearance, Quran typography, audio preferences, and offline storage.
        </p>
      </div>

      {/* SECTION 1: APPEARANCE */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-theme-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Appearance
            </h2>
            <p className="text-xs text-theme-secondary mt-0.5">
              Choose your preferred visual presentation for AyahFlow on mobile and desktop.
            </p>
          </div>
        </div>

        {/* 3 Appearance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {appearanceOptions.map((opt) => {
            const isSelected = themePreference === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setThemePreference(opt.id)}
                className={`relative flex flex-col items-start p-4 rounded-3xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-theme-surface border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-theme-surface border-theme-subtle hover:border-theme-medium hover:bg-theme-elevated shadow-sm'
                }`}
              >
                {/* Visual Preview Box */}
                <div
                  className={`w-full h-24 rounded-2xl p-2.5 mb-3 flex flex-col justify-between border border-theme-subtle overflow-hidden ${opt.previewBg}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${opt.previewAccent}`} />
                      <div className={`w-10 h-2 rounded-full ${opt.previewText} opacity-40`} />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Mock Card Preview */}
                  <div className={`p-2 rounded-xl border ${opt.previewCard} flex items-center gap-2`}>
                    <div className={`w-4 h-4 rounded-md ${opt.previewAccent} opacity-80`} />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className={`w-14 h-1.5 rounded-full ${opt.previewText} opacity-80`} />
                      <div className={`w-8 h-1 rounded-full ${opt.previewText} opacity-40`} />
                    </div>
                  </div>
                </div>

                {/* Option Header */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-xl ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-theme-elevated text-theme-secondary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-theme-primary">{opt.title}</span>
                  </div>
                </div>

                <p className="text-xs text-theme-muted mt-2 leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Informational Callout */}
        <div className="p-3.5 rounded-2xl bg-theme-surface border border-theme-subtle flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-theme-secondary leading-relaxed">
            {themePreference === 'system'
              ? `System Default active: AyahFlow dynamically tracks your device's light and dark schedule without requiring app restart.`
              : `Manual override active (${themePreference === 'light' ? 'Light Mode' : 'Dark Mode'}). Switch to System Default anytime to follow your device schedule.`}
          </p>
        </div>
      </section>

      {/* SECTION 2: AUDIO & PLAYBACK */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-theme-primary flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-500" />
            Audio & Playback
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            Default playback speed and background sound preferences.
          </p>
        </div>

        <div className="rounded-3xl bg-theme-surface border border-theme-subtle divide-y divide-theme-subtle overflow-hidden">
          {/* Playback speed */}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-theme-primary">Default Playback Speed</p>
              <p className="text-xs text-theme-muted">Adjust narration tempo to your pace</p>
            </div>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-theme-elevated border border-theme-subtle text-theme-primary text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((s) => (
                <option key={s} value={s}>
                  {s}x Speed
                </option>
              ))}
            </select>
          </div>

          {/* Quick links to Ambience */}
          <Link
            href="/"
            className="p-4 flex items-center justify-between hover:bg-theme-elevated transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-theme-primary">Ambient Soundscapes</p>
              <p className="text-xs text-theme-muted">Layer rain, stream, or thunder with recitations</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Choose on Home</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 3: STORAGE & OFFLINE */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-theme-primary flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-500" />
            Offline Downloads & Library
          </h2>
          <p className="text-xs text-theme-secondary mt-0.5">
            Manage saved offline audio and bookmarks.
          </p>
        </div>

        <div className="rounded-3xl bg-theme-surface border border-theme-subtle divide-y divide-theme-subtle overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-theme-primary">Downloaded Surahs</p>
              <p className="text-xs text-theme-muted">Available for offline listening without internet</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {downloadedSurahs.length} Surahs
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-theme-primary">Favorite Surahs</p>
              <p className="text-xs text-theme-muted">Pinned to your favorites collection</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500">
              {favorites.length} Saved
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 4: ABOUT */}
      <section className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Image src="/app_icon.png" alt="" aria-hidden="true" width={40} height={40} className="w-10 h-10 rounded-2xl shadow" />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-theme-primary">AyahFlow</h3>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">Pro</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-theme-elevated text-theme-muted uppercase font-semibold border border-theme-subtle ml-1">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-theme-muted">
              Listen. Reflect. Find Peace.
            </p>
          </div>
        </div>
        <p className="text-xs text-theme-secondary leading-relaxed pt-2 border-t border-theme-subtle">
          AyahFlow Pro combines spatial audio streaming, live synchronized Tafsir, ambient soundscapes, and habit reflection.
        </p>
      </section>
    </div>
  );
}
