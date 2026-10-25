'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Search, Sparkles, Settings, Download, Mic2 } from 'lucide-react';
import { usePlatform } from '@/lib/usePlatform';
import { usePlayerStore } from '@/store/usePlayerStore';

type NavLinkItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: false;
};

type NavActionItem = {
  label: string;
  isAction: true;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  href?: never;
};

type NavItem = NavLinkItem | NavActionItem;

export default function MobileNav() {
  const pathname = usePathname();
  const { isNative } = usePlatform();
  const { setAmbientModalOpen, isAmbientModalOpen, selectedAmbientSound, isAmbientPlaying } = usePlayerStore();

  // Native Android Navigation Items (5 items, perfectly sized for mobile touch)
  const nativeNavItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Surahs', href: '/search', icon: Search },
    { label: 'Playlists', href: '/collections', icon: Library },
    {
      label: 'Ambient',
      isAction: true,
      onClick: () => setAmbientModalOpen(true),
      icon: Sparkles,
      badge: selectedAmbientSound && isAmbientPlaying ? 'ON' : undefined,
    },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // Web Mobile Navigation Items
  const webNavItems: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Surahs', href: '/search', icon: Search },
    { label: 'Playlists', href: '/collections', icon: Library },
    { label: 'Reciters', href: '/reciters', icon: Mic2 },
    { label: 'App', href: '/downloads', icon: Download },
  ];

  const items = isNative ? nativeNavItems : webNavItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center md:hidden pointer-events-none pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] px-3">
      <div className="w-full max-w-md glass-panel bg-theme-surface/95 rounded-2xl py-1 px-1.5 flex items-center justify-around pointer-events-auto shadow-2xl border border-theme-subtle backdrop-blur-2xl">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            const isAmbientActive = isAmbientModalOpen || (selectedAmbientSound && isAmbientPlaying);
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all flex-1 text-center min-w-0 cursor-pointer min-h-[46px] ${
                  isAmbientActive
                    ? 'glass-nav-active font-bold shadow-sm text-emerald-600 dark:text-emerald-400'
                    : 'text-theme-muted hover:text-theme-primary'
                }`}
                aria-label="Ambient Soundspace"
              >
                <div className="relative">
                  <Icon className="w-4 h-4 mb-0.5 shrink-0" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-1 ring-emerald-300" />
                  )}
                </div>
                <span className="truncate max-w-full block leading-tight">{item.label}</span>
              </button>
            );
          }

          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all flex-1 text-center min-w-0 min-h-[46px] ${
                isActive
                  ? 'glass-nav-active font-semibold shadow-sm text-emerald-600 dark:text-emerald-400'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 shrink-0" />
              <span className="truncate max-w-full block leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
