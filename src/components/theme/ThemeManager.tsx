'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeManager() {
  const { themePreference, resolvedTheme, setResolvedTheme, setThemePreference } = useThemeStore();

  // Apply theme to document and sync Capacitor status bar
  useEffect(() => {
    const updateThemeDomAndNative = async (active: 'light' | 'dark') => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(active);
        root.setAttribute('data-theme', active);
      }

      // Sync Native Mobile Status Bar & Navigation Bar
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          if (active === 'dark') {
            await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
            await StatusBar.setBackgroundColor({ color: '#121316' }).catch(() => {});
          } else {
            await StatusBar.setStyle({ style: Style.Light }).catch(() => {});
            await StatusBar.setBackgroundColor({ color: '#FBF9F5' }).catch(() => {});
          }
        }
      } catch (err) {
        // Ignored on web
      }
    };

    let activeTheme = resolvedTheme;
    if (themePreference === 'light') {
      activeTheme = 'light';
    } else if (themePreference === 'dark') {
      activeTheme = 'dark';
    } else if (typeof window !== 'undefined') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setResolvedTheme(activeTheme);
    updateThemeDomAndNative(activeTheme);
  }, [themePreference, resolvedTheme, setResolvedTheme]);

  // System appearance media query listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentPref = useThemeStore.getState().themePreference;
      if (currentPref === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        useThemeStore.getState().setResolvedTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, []);

  return null;
}
