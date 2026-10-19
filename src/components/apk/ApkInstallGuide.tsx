'use client';

import React, { useState } from 'react';
import {
  Download,
  ShieldAlert,
  HelpCircle,
  ChevronDown,
  AlertTriangle,
  Smartphone,
} from 'lucide-react';
import { trackApkDownloadClick } from '@/lib/analytics';

interface ApkInstallGuideProps {
  apkUrl?: string;
  className?: string;
}

export default function ApkInstallGuide({
  apkUrl = '/ayahflow-pro.apk',
  className = '',
}: ApkInstallGuideProps) {
  const [troubleshootOpen, setTroubleshootOpen] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Download the official AyahFlow APK',
      desc: 'Tap the Download button to save the official package directly to your device.',
    },
    {
      num: 2,
      title: 'Open the downloaded file',
      desc: 'Locate the file in your notification drawer or your device\'s Downloads folder.',
    },
    {
      num: 3,
      title: 'Allow installation from this source if prompted',
      desc: 'If Android prompts that installations from this source are restricted, tap Settings and toggle "Allow from this source".',
    },
    {
      num: 4,
      title: 'Return to the installer and tap Install',
      desc: 'Switch back to the installation prompt and tap Install to begin setup.',
    },
    {
      num: 5,
      title: 'Open AyahFlow when installation finishes',
      desc: 'Once complete, tap Open to start your peaceful Quran audio and ambient listening journey.',
    },
  ];

  return (
    <div
      className={`rounded-3xl border border-theme-subtle bg-theme-surface/90 backdrop-blur-xl p-6 md:p-8 shadow-xl flex flex-col gap-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-subtle">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Sideload Guide</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-theme-primary">
            How to install AyahFlow
          </h3>
        </div>

        {/* Action Button inside Guide */}
        <a
          href={apkUrl}
          download="ayahflow-pro.apk"
          onClick={() => trackApkDownloadClick('guide_button')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download APK (29.2 MB)</span>
        </a>
      </div>

      {/* 5 Steps Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step) => (
          <div
            key={step.num}
            className="flex flex-col gap-2 p-3.5 rounded-2xl bg-theme-elevated/70 border border-theme-subtle"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                {step.num}
              </span>
              <span className="font-bold text-xs text-theme-primary leading-tight">
                {step.title}
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary leading-relaxed pl-8 md:pl-0">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Security & Play Protect Guidance Notice */}
      <div className="rounded-2xl p-4 bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3 text-xs text-theme-secondary">
        <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 leading-relaxed">
          <span className="font-bold text-theme-primary">
            Security & Google Play Protect Notice
          </span>
          <p>
            Android displays a standard security warning when installing applications outside Google Play.
            Proceed only after confirming that your download originated from this verified official site or our verified public GitHub repository.
            <strong> Note:</strong> You do <em>not</em> need to disable Google Play Protect globally—it continues protecting your device while allowing trusted standalone installs.
          </p>
        </div>
      </div>

      {/* Troubleshooting Accordion */}
      <div className="border border-theme-subtle rounded-2xl overflow-hidden bg-theme-elevated/50">
        <button
          type="button"
          onClick={() => setTroubleshootOpen(!troubleshootOpen)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-theme-primary hover:bg-theme-elevated transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span>Troubleshooting Installation Issues (Blocked, Incompatible, or Signature Conflicts)</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${
              troubleshootOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {troubleshootOpen && (
          <div className="p-4 pt-0 border-t border-theme-subtle/50 flex flex-col gap-3 text-xs text-theme-secondary mt-3">
            {/* Issue 1: Blocked by system */}
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-theme-primary">Installation Blocked (&quot;Install unknown apps&quot;):</span>
                <p className="mt-0.5 text-theme-muted">
                  Open your phone&apos;s <strong>Settings &gt; Apps &gt; Special app access &gt; Install unknown apps</strong>.
                  Select the browser or file manager you used to download the file and toggle <strong>Allow from this source</strong>.
                </p>
              </div>
            </div>

            {/* Issue 2: Signature conflict */}
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-theme-primary">&quot;App not installed&quot; / Signature Conflict:</span>
                <p className="mt-0.5 text-theme-muted">
                  If an earlier test or preview build was installed on your device with a different signing key, Android will refuse to overwrite it.
                  Uninstall the previous build first, then run this installer.
                </p>
              </div>
            </div>

            {/* Issue 3: Incompatible Android version */}
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-theme-primary">Incompatible Android Version:</span>
                <p className="mt-0.5 text-theme-muted">
                  AyahFlow Pro requires <strong>Android 7.0 (API Level 24)</strong> or higher to support modern audio streams and hardware media notification controls.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
