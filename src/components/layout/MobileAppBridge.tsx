'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useRouter } from 'next/navigation';

export default function MobileAppBridge() {
  const router = useRouter();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initCapacitor = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        // Native Status Bar styling
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        const syncStatusBar = () => {
          const isLight = useThemeStore.getState().resolvedTheme === 'light';
          StatusBar.setStyle({ style: isLight ? Style.Light : Style.Dark }).catch(() => {});
          StatusBar.setBackgroundColor({ color: isLight ? '#FBF9F5' : '#121316' }).catch(() => {});
        };
        syncStatusBar();
        const unsubscribeTheme = useThemeStore.subscribe(syncStatusBar);

        // Native Splash Screen auto-hide
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide({ fadeOutDuration: 400 }).catch(() => {});

        // Native Hardware Back Button (Android)
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('backButton', ({ canGoBack }) => {
          const state = usePlayerStore.getState();

          // 1. Close open dialog modals first
          if (state.isAmbientModalOpen) {
            state.setAmbientModalOpen(false);
          } else if (state.isTafsirModalOpen) {
            state.setTafsirModalOpen(false);
          } else if (state.isReportModalOpen) {
            state.setReportModalOpen(false);
          }
          // 2. Minimize full screen player if open
          else if (state.isFullScreenPlayerOpen) {
            state.setFullScreenPlayerOpen(false);
          }
          // 3. Navigate back in history if possible
          else if (canGoBack) {
            window.history.back();
          }
          // 4. Minimize app to background
          else {
            App.minimizeApp().catch(() => {});
          }
        });

        cleanup = () => {
          unsubscribeTheme();
          listener.remove();
        };
      } catch (err) {
        console.warn('Capacitor native bridge initialization skipped or failed:', err);
      }
    };

    initCapacitor();

    return () => {
      if (cleanup) cleanup();
    };
  }, [router]);

  return null;
}
