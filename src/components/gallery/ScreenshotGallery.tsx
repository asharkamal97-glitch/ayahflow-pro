'use client';

import React, { useState } from 'react';
import { Sparkles, Radio, Smartphone } from 'lucide-react';

interface ScreenshotItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  src: string;
  alt: string;
  highlights: string[];
}

const SCREENSHOTS: ScreenshotItem[] = [
  {
    id: 'ambient-soundspace',
    title: 'Ambient Soundspace Mixer',
    category: 'Signature Feature',
    badge: 'Signature',
    description:
      'Blend peaceful natural soundscapes (ocean waves, gentle rain, river, bonfire, and birds) beneath Quran recitation with dedicated volume mixing.',
    src: '/images/screenshots/ambient-soundscapes.jpg',
    alt: 'AyahFlow Ambient Soundscapes control modal showing atmospheric sound selections and volume slider',
    highlights: [
      'Multi-channel background atmosphere',
      'Independent volume slider for soundscapes',
      'Instant audio crossfading and toggle',
    ],
  },
  {
    id: 'player-tafsir',
    title: 'Spatial Player & Live Tafsir',
    category: 'Audio Experience',
    badge: 'Full Player',
    description:
      'High-fidelity Quran recitation with synchronized live Tafsir subtitles, sleep timer, playback speed control, and seamless seekbar navigation.',
    src: '/images/screenshots/audio-player-tafsir.jpg',
    alt: 'AyahFlow audio player displaying Yasser Al-Dosari recitation of Surah Al-Fatihah with live Tafsir Ibn Kathir explanation',
    highlights: [
      'Synchronized Ayah-by-Ayah Tafsir',
      'Sleep timer & 1x-2x speed control',
      'Dedicated Ambient Sound shortcut',
    ],
  },
  {
    id: 'home-streak',
    title: 'Habit Streak & Home Hub',
    category: 'Daily Reflection',
    badge: 'Home Screen',
    description:
      'Build a sustainable daily Quran listening habit with streak tracking, instant atmosphere quick-switches, and verified reciter profiles.',
    src: '/images/screenshots/home-streak.jpg',
    alt: 'AyahFlow mobile home screen featuring Quran habit streak, atmosphere quick bar, and top reciter selection',
    highlights: [
      'Daily habit streak tracking in minutes',
      'One-tap ambient atmosphere bar',
      'Persistent non-blocking mini-player',
    ],
  },
];

export default function ScreenshotGallery() {
  const [activeTab, setActiveTab] = useState<string>(SCREENSHOTS[0].id);

  const activeScreen = SCREENSHOTS.find((s) => s.id === activeTab) || SCREENSHOTS[0];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App Showcase</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-theme-primary">
            Genuine App Interface
          </h2>
        </div>
        <p className="text-xs md:text-sm text-theme-secondary max-w-md leading-relaxed">
          Crafted for calm, distraction-free listening with our signature Ambient Soundspace layer.
        </p>
      </div>

      {/* Tabs Selector for Desktop & Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SCREENSHOTS.map((screen) => {
          const isActive = screen.id === activeTab;
          return (
            <button
              key={screen.id}
              type="button"
              onClick={() => setActiveTab(screen.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-[1.02]'
                  : 'bg-theme-surface hover:bg-theme-elevated text-theme-secondary hover:text-theme-primary border border-theme-subtle'
              }`}
            >
              <span>{screen.title}</span>
              <span
                className={`text-[10px] uppercase px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-theme-elevated text-theme-muted'
                }`}
              >
                {screen.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Showcase Card */}
      <div className="rounded-3xl border border-theme-subtle bg-theme-surface/80 backdrop-blur-xl p-6 md:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Explanations & Feature List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeScreen.category}</span>
          </div>

          <h3 className="text-xl md:text-3xl font-bold tracking-tight text-theme-primary">
            {activeScreen.title}
          </h3>

          <p className="text-xs md:text-sm text-theme-secondary leading-relaxed">
            {activeScreen.description}
          </p>

          {/* Highlights */}
          <div className="flex flex-col gap-2.5 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-muted">
              Key Capabilities:
            </span>
            {activeScreen.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-theme-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium">{h}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-theme-muted flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>Actual real-device capture from the AyahFlow Android build.</span>
          </div>
        </div>

        {/* Right Column: Phone Mockup Frame */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative rounded-[32px] p-2 bg-gradient-to-b from-stone-800 to-stone-950 border border-emerald-500/30 shadow-2xl max-w-[270px] w-full">
            {/* Top speaker notch */}
            <div className="w-20 h-3.5 bg-black/60 rounded-full mx-auto mb-2" />

            <div className="overflow-hidden rounded-[24px] bg-black border border-theme-subtle">
              <img
                src={activeScreen.src}
                alt={activeScreen.alt}
                className="w-full h-auto object-cover display-block select-none"
                loading="lazy"
                width={483}
                height={1024}
              />
            </div>

            {/* Bottom bar indicator */}
            <div className="w-24 h-1 bg-white/20 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </div>

      {/* Grid of All 3 Screenshots for Desktop View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {SCREENSHOTS.map((screen) => (
          <div
            key={screen.id}
            onClick={() => setActiveTab(screen.id)}
            className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col gap-3 ${
              screen.id === activeTab
                ? 'bg-emerald-500/10 border-emerald-500 shadow-md scale-[1.01]'
                : 'bg-theme-surface/60 border-theme-subtle hover:bg-theme-elevated hover:border-theme-medium'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-primary">{screen.title}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {screen.badge}
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary line-clamp-2">
              {screen.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
