import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import AudioPlayer from "@/components/player/AudioPlayer";
import MobileAppBridge from "@/components/layout/MobileAppBridge";
import ThemeManager from "@/components/theme/ThemeManager";
import { Analytics } from "@vercel/analytics/react";

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF9F5" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" }
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

const SITE_URL = "https://ayahflow-quranify.vercel.app/";
const OG_BANNER_URL = `${SITE_URL}og-banner.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AyahFlow Pro — Quran Audio & Ambient Soundspace",
  description:
    "Quran recitation with your own ambient soundscape — calming rain, ocean waves, and synchronized Live Tafsir. Listen. Reflect. Find Peace.",
  keywords: [
    "AyahFlow",
    "AyahFlow Pro",
    "Quran Audio",
    "Ambient Soundspace",
    "Quran with nature sounds",
    "Quran recitation",
    "Yasser Al-Dosari",
    "Mishary Rashid Alafasy",
    "Abdul Basit",
    "Atmospheric Quran audio",
    "Tafsir synchronized",
    "Islamic relaxation audio"
  ],
  authors: [{ name: "AyahFlow Pro" }],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "AyahFlow Pro — Quran Audio & Ambient Soundspace",
    description:
      "Quran recitation with your own ambient soundscape — calming rain, ocean waves, and synchronized Live Tafsir. Listen. Reflect. Find Peace.",
    url: SITE_URL,
    siteName: "AyahFlow Pro",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: OG_BANNER_URL,
        secureUrl: OG_BANNER_URL,
        width: 1200,
        height: 630,
        alt: "AyahFlow Pro — Quran Recitation with Ambient Soundspace",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AyahFlow Pro — Quran Audio & Ambient Soundspace",
    description:
      "Quran recitation with your own ambient soundscape — calming rain, ocean waves, and synchronized Live Tafsir.",
    images: [OG_BANNER_URL],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full bg-theme-app text-theme-primary">
      <head>
        {/* Anti-flicker theme hydration script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('quranify-theme-preference');
                  var pref = 'system';
                  if (raw) {
                    try {
                      var parsed = JSON.parse(raw);
                      pref = (parsed && parsed.state && parsed.state.themePreference) || parsed || 'system';
                    } catch(e) {
                      pref = raw.replace(/"/g, '');
                    }
                  }
                  var resolved = 'dark';
                  if (pref === 'light') {
                    resolved = 'light';
                  } else if (pref === 'dark') {
                    resolved = 'dark';
                  } else {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolved);
                  document.documentElement.setAttribute('data-theme', resolved);
                } catch(err) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org WebApplication structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AyahFlow Pro",
              url: "https://ayahflow-quranify.vercel.app/",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "All",
              featureList: [
                "Crystal-clear Quran audio recitations by renowned Qaris",
                "Ambient Soundspace: customizable nature atmospheres beneath recitation",
                "Live synchronized Tafsir reflections",
                "Daily Quran habit streak and sleep timer"
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex overflow-hidden font-sans bg-theme-app text-theme-primary">
        {/* Vercel Web Analytics */}
        <Analytics />

        {/* Theme Manager & Native System Sync */}
        <ThemeManager />

        {/* Mobile App Bridge (Capacitor Native Hardware, Status Bar & Events) */}
        <Suspense fallback={null}>
          <MobileAppBridge />
        </Suspense>

        {/* Desktop Sidebar */}
        <Suspense fallback={<div className="hidden md:flex w-[280px] shrink-0" />}>
          <Sidebar />
        </Suspense>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden pb-44 md:pb-28 bg-theme-app text-theme-primary celestial-bg">
          <Suspense fallback={<div className="p-8 text-center text-theme-muted">Loading...</div>}>
            {children}
          </Suspense>
        </main>

        {/* Mobile Navigation Pill */}
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>

        {/* Global Persistent Audio Player */}
        <Suspense fallback={null}>
          <AudioPlayer />
        </Suspense>
      </body>
    </html>
  );
}
