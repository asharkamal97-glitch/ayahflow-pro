import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (pref: ThemePreference) => void;
  setResolvedTheme: (theme: ResolvedTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themePreference: 'system',
      resolvedTheme: 'dark',

      setThemePreference: (pref: ThemePreference) => {
        let resolved: ResolvedTheme = 'dark';
        if (pref === 'light') {
          resolved = 'light';
        } else if (pref === 'dark') {
          resolved = 'dark';
        } else if (typeof window !== 'undefined') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        set({ themePreference: pref, resolvedTheme: resolved });

        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(resolved);
          root.setAttribute('data-theme', resolved);
        }
      },

      setResolvedTheme: (theme: ResolvedTheme) => {
        set({ resolvedTheme: theme });
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
          root.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'quranify-theme-preference',
      partialize: (state) => ({
        themePreference: state.themePreference,
      }),
    }
  )
);
