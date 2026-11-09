'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('AyahFlow Unhandled Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/5">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-theme-primary tracking-tight">
        Something unexpected happened
      </h1>

      <p className="text-xs md:text-sm text-theme-secondary mt-2 max-w-md leading-relaxed">
        {error?.message || 'We ran into an issue loading this page. Please try refreshing or return home.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Page</span>
        </button>

        <Link
          href="/"
          className="py-2.5 px-5 rounded-xl bg-theme-elevated hover:bg-theme-hover border border-theme-subtle text-theme-primary font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
