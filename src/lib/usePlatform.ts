'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function usePlatform() {
  const [isNative, setIsNative] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const native = Capacitor.isNativePlatform();
      const queryOverride =
        typeof window !== 'undefined' &&
        (window.location.search.includes('platform=android') ||
          window.location.search.includes('mode=app'));

      setIsNative(native || queryOverride);
    } catch {
      setIsNative(false);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  return { isNative, isLoaded };
}
