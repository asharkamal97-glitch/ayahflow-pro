import { track } from '@vercel/analytics';

let lastApkClickTime = 0;
const DEBOUNCE_MS = 4000;

/**
 * Tracks an APK download button click via Vercel Web Analytics.
 * 
 * Note: This records user intent (button click), clearly distinguished
 * from completed binary transfer or native installation on the device.
 * No personal or identifiable data is collected.
 */
export function trackApkDownloadClick(source: 'hero_cta' | 'downloads_page' | 'guide_button' | string = 'hero_cta') {
  const now = Date.now();
  // Prevent duplicate events on fast double clicks
  if (now - lastApkClickTime < DEBOUNCE_MS) {
    return;
  }
  lastApkClickTime = now;

  try {
    track('apk_download_click', {
      source,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Fail silently in development or if analytics blocked
    console.debug('[Analytics] APK download event skipped:', err);
  }
}
