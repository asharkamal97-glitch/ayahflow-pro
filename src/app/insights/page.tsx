'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/usePlayerStore';
import { SURAHS, RECITERS, getPeriodTitle } from '@/lib/constants';
import {
  Flame,
  Clock,
  Calendar,
  Share2,
  Trophy,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Headphones,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export default function InsightsPage() {
  const { insights, playSurah, setSelectedReciter } = usePlayerStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'weekly' | 'allTime'>('weekly');

  const shareText = `Alhamdulillah! I'm on a ${insights.currentStreak} day streak listening to the Holy Quran on AyahFlow! Listen. Reflect. Find Peace. 📖✨`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate top reciters
  const topRecitersList = Object.entries(insights.reciterListens)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([reciterId, count]) => {
      const reciter = RECITERS.find((r) => r.id === reciterId);
      return { reciter, count };
    })
    .filter((item) => item.reciter !== undefined);

  // Calculate top surahs
  const topSurahsList = Object.entries(insights.surahListens)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([numStr, count]) => {
      const surah = SURAHS.find((s) => s.number === parseInt(numStr));
      return { surah, count };
    })
    .filter((item) => item.surah !== undefined);

  // Peak period
  const peakPeriodEntry = Object.entries(insights.timeOfDayStats)
    .sort(([, a], [, b]) => b - a)[0];
  const peakPeriodTitle = peakPeriodEntry ? getPeriodTitle(peakPeriodEntry[0]) : 'After Fajr';

  // Last 7 days chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const minutes = insights.dailyMinutes[dateStr] || 0;
    return { dayName, dateStr, minutes };
  });

  const maxDailyMinutes = Math.max(...last7Days.map((d) => d.minutes), 60);

  return (
    <div className="min-h-screen pb-32 text-theme-primary">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-emerald-950/20 to-transparent dark:from-emerald-950 dark:via-zinc-900 dark:to-black p-6 md:p-10 border border-emerald-500/20 mb-8 shadow-xl bg-theme-surface">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>Habit & Listening Insights</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-theme-primary">
            Your Quran Journey
          </h1>
          <p className="text-sm md:text-base text-theme-secondary mt-2 leading-relaxed">
            Every minute spent with the Book of Allah brings light, barakah, and peace. Track your daily habits and maintain your streak.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 font-bold text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Streak copied to clipboard!' : 'Share My Streak Card'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Streak Card */}
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              Current Streak
            </span>
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400">
              <Flame className="w-4 h-4 fill-current" />
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-theme-primary">
            {insights.currentStreak} <span className="text-base font-normal text-theme-secondary">days</span>
          </div>
          <p className="text-[11px] text-theme-secondary mt-1">
            Personal best: {insights.bestStreak} days
          </p>
        </div>

        {/* Total Time Card */}
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              Total Time
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-theme-primary">
            {insights.totalMinutesListened} <span className="text-base font-normal text-theme-secondary">min</span>
          </div>
          <p className="text-[11px] text-theme-secondary mt-1">
            ~{Math.round(insights.totalMinutesListened / 60)} hours total
          </p>
        </div>

        {/* Peak Listening Period */}
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              Best Time
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-theme-primary truncate">
            {peakPeriodTitle}
          </div>
          <p className="text-[11px] text-theme-secondary mt-1 truncate">
            Highest spiritual focus
          </p>
        </div>

        {/* Habit Status */}
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              Consistency
            </span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            On Track
          </div>
          <p className="text-[11px] text-theme-secondary mt-1">
            Keep listening to beat record
          </p>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Best Listening Period Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-theme-surface border border-theme-subtle shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-theme-primary">Weekly Listening Activity</h2>
              <p className="text-xs text-theme-secondary mt-0.5">Minutes listened per day over the past week</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Goal: 30 min/day
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 pt-6">
            {last7Days.map((item) => {
              const heightPercent = Math.max(10, Math.min(100, (item.minutes / maxDailyMinutes) * 100));
              const isToday = item.dateStr === new Date().toISOString().split('T')[0];
              return (
                <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-theme-secondary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.minutes}m
                  </span>
                  <div className="w-full max-w-[42px] bg-theme-elevated rounded-2xl overflow-hidden p-1 flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/30'
                          : 'bg-emerald-600/60 dark:bg-emerald-800/60 group-hover:bg-emerald-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-theme-secondary'}`}>
                    {item.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time of Day Distribution */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme-subtle shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-theme-primary mb-1">Time of Day Habit</h2>
            <p className="text-xs text-theme-secondary mb-5">When you recite and reflect most</p>

            <div className="space-y-3">
              {[
                { key: 'afterFajr', label: 'After Fajr (Dawn)', color: 'bg-amber-400' },
                { key: 'morning', label: 'Morning (Duha)', color: 'bg-sky-400' },
                { key: 'dhuhr', label: 'Dhuhr (Midday)', color: 'bg-yellow-400' },
                { key: 'afternoon', label: 'Afternoon (Asr)', color: 'bg-orange-400' },
                { key: 'afterMaghrib', label: 'After Maghrib', color: 'bg-rose-400' },
                { key: 'evening', label: 'Evening (Isha)', color: 'bg-indigo-400' },
                { key: 'lateNight', label: 'Late Night (Tahajjud)', color: 'bg-purple-400' },
              ].map((period) => {
                const minutes = (insights.timeOfDayStats as any)[period.key] || 0;
                return (
                  <div key={period.key} className="flex items-center justify-between text-xs">
                    <span className="text-theme-secondary flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${period.color}`} />
                      {period.label}
                    </span>
                    <span className="font-mono text-theme-primary font-medium">{minutes} min</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-theme-elevated border border-theme-subtle text-[11px] text-theme-secondary">
            💡 <strong className="text-theme-primary">Tip:</strong> Listening right after Fajr increases memorization retention by up to 40%.
          </div>
        </div>
      </div>

      {/* Favorites & Top Reciters / Surahs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Listened Reciters */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme-subtle shadow-sm">
          <h2 className="text-lg font-bold text-theme-primary mb-1">Most Listened Reciters</h2>
          <p className="text-xs text-theme-secondary mb-4">Voices that resonate most with your heart</p>

          <div className="space-y-3">
            {topRecitersList.map((item, idx) => (
              <div
                key={item.reciter!.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-theme-elevated border border-theme-subtle hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold w-4">
                    #{idx + 1}
                  </span>
                  <img
                    src={item.reciter!.avatar}
                    alt={item.reciter!.name}
                    className="w-10 h-10 rounded-full object-cover border border-theme-subtle"
                  />
                  <div>
                    <div className="text-sm font-bold text-theme-primary">{item.reciter!.name}</div>
                    <div className="text-xs text-theme-secondary">{item.reciter!.country} • {item.reciter!.style}</div>
                  </div>
                </div>

                <Link
                  href={`/reciters/${item.reciter!.id}`}
                  className="p-2 rounded-xl text-theme-secondary hover:text-theme-primary hover:bg-theme-surface transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Most Listened Surahs */}
        <div className="p-6 rounded-3xl bg-theme-surface border border-theme-subtle shadow-sm">
          <h2 className="text-lg font-bold text-theme-primary mb-1">Top Surahs</h2>
          <p className="text-xs text-theme-secondary mb-4">Your most repeated chapters</p>

          <div className="space-y-2.5">
            {topSurahsList.map((item, idx) => (
              <div
                key={item.surah!.number}
                onClick={() => playSurah(item.surah!)}
                className="flex items-center justify-between p-3 rounded-2xl bg-theme-elevated border border-theme-subtle hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-theme-surface border border-theme-subtle text-theme-primary font-mono text-xs flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors font-bold">
                    {item.surah!.number}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-theme-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Surah {item.surah!.englishName}
                    </div>
                    <div className="text-xs text-theme-secondary">
                      {item.surah!.numberOfAyahs} Ayahs • {item.count} sessions
                    </div>
                  </div>
                </div>

                <span className="font-serif text-lg text-emerald-700 dark:text-emerald-300">
                  {item.surah!.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
