'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Mic2, Search, Flame, Download, Settings } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Collections', href: '/collections', icon: Library },
    { label: 'Reciters', href: '/reciters', icon: Mic2 },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Insights', href: '/insights', icon: Flame },
    { label: 'Offline', href: '/downloads', icon: Download },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center md:hidden pointer-events-none pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] px-2">
      <div className="w-full max-w-md glass-panel bg-theme-surface/95 rounded-2xl py-1 px-1 flex items-center justify-around pointer-events-auto shadow-2xl border border-theme-subtle backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl text-[10px] font-medium transition-all flex-1 text-center min-w-0 ${
                isActive
                  ? 'glass-nav-active font-semibold shadow-sm'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 shrink-0" />
              <span className="truncate max-w-full block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
