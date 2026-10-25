'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Library, Mic2, Search, Flame, Download, Heart, User, LogIn, Settings } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { usePlatform } from '@/lib/usePlatform';

export default function Sidebar() {
  const pathname = usePathname();
  const { isNative } = usePlatform();
  const { insights, downloadedSurahs } = usePlayerStore();

  if (isNative) return null;

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Collections', href: '/collections', icon: Library },
    { label: 'Reciters', href: '/reciters', icon: Mic2 },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Insights & Streaks', href: '/insights', icon: Flame, badge: `${insights.currentStreak}d` },
    { label: 'Downloads', href: '/downloads', icon: Download, badge: downloadedSurahs.length > 0 ? `${downloadedSurahs.length}` : undefined },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[280px] shrink-0 h-screen sticky top-0 p-4 z-40 bg-theme-app">
      <div className="flex flex-col h-full rounded-[32px] glass-panel p-5 justify-between shadow-2xl">
        {/* Top: Logo & Navigation */}
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <Image
              src="/app_icon.png"
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="w-10 h-10 rounded-2xl shadow-lg shadow-emerald-950/20 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-theme-primary">AyahFlow</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">Pro</span>
              </div>
              <span className="text-[11px] text-theme-muted">Listen. Reflect. Find Peace.</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'glass-nav-active font-semibold shadow-md scale-[1.02]'
                      : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-current' : 'text-theme-muted'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-black/10 dark:bg-white/20 text-current'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Favorites quick link & Sign-In card */}
        <div className="flex flex-col gap-3">
          <Link
            href="/collections"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-500/70" />
            <span>Saved Surahs & Favorites</span>
          </Link>

          {/* Account Status Card */}
          <div className="rounded-[24px] bg-theme-elevated border border-theme-subtle p-4 flex flex-col items-center text-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-semibold text-theme-primary">Offline-First Profile</p>
              <p className="text-[11px] text-theme-muted">Streaks & library saved locally</p>
            </div>
            <Link
              href="/settings"
              className="w-full py-2 px-3 rounded-full bg-theme-surface border border-theme-subtle text-theme-primary text-xs font-semibold hover:bg-theme-hover active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-500" />
              <span>Appearance & Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
