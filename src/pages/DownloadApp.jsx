import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  Volume2,
  Sliders,
  Layers
} from 'lucide-react';
import { useLibraryStore } from '../store/useLibraryStore';

export const DownloadApp = () => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const [copiedLink, setCopiedLink] = useState(false);

  const ANDROID_APK_URL = 'https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/releases/latest/download/Jennie-Music.apk';
  const RELEASES_PAGE_URL = 'https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/releases';
  const WINDOWS_APP_URL = 'https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/releases';

  const handleCopyAndroidLink = () => {
    try {
      navigator.clipboard.writeText(ANDROID_APK_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {}
  };

  return (
    <div className="min-h-full pb-32 text-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer group"
          aria-label="Back to music player"
        >
          <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span>Back to Player</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Verified Clean &amp; Open Source</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Latest Release v1.0.23 Available</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Download Jennie Music
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Get the full native experience on your devices with background audio, lock-screen controls, synchronized lyrics, and offline playback.
          </p>
        </div>

        {/* 2 Main Platform Cards: Windows & Android */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {/* Option 1: Android */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10 hover:border-white/20 transition-all shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header Badge & Icon */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Smartphone size={28} className="stroke-[2.2]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                  Mobile &amp; Tablet
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Jennie for Android</h2>
              <p className="text-xs text-neutral-400 mb-6">
                Package: <code className="text-neutral-300 bg-white/5 px-1.5 py-0.5 rounded">Jennie-Music.apk</code> • Size: ~4.5 MB • Android 8.0+
              </p>

              {/* Feature Highlights */}
              <div className="space-y-3 mb-8 text-xs text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Background audio playback with lockscreen notification player</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Headphone and Bluetooth hardware media buttons (play/pause/skip)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Automatic embed playback recovery engine (Code 150/101 auto-failover)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Synchronized karaoke-style lyrics and offline playlist storage</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              {/* Primary Download Button */}
              <a
                href={ANDROID_APK_URL}
                download="Jennie-Music.apk"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-200 active:scale-[0.98] text-black font-bold text-sm transition-all shadow-lg shadow-white/10"
              >
                <Download size={17} className="stroke-[2.5]" />
                <span>Download APK (Direct)</span>
              </a>

              {/* Secondary Options: Copy link & Releases */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAndroidLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/5 transition-colors"
                  title="Copy direct download link to clipboard"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy APK Link</span>
                    </>
                  )}
                </button>

                <a
                  href={RELEASES_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/5 transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>View All Releases</span>
                </a>
              </div>
            </div>
          </div>

          {/* Option 2: Windows */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-[#121214] border border-white/10 hover:border-white/20 transition-all shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header Badge & Icon */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Monitor size={28} className="stroke-[2.2]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                  Desktop PC
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Jennie for Windows</h2>
              <p className="text-xs text-neutral-400 mb-6">
                Package: <code className="text-neutral-300 bg-white/5 px-1.5 py-0.5 rounded">Jennie-Music-Setup.exe</code> • Windows 10/11 (64-bit)
              </p>

              {/* Feature Highlights */}
              <div className="space-y-3 mb-8 text-xs text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
                  <span>Global system media hotkeys (Play/Pause, Next Track, Prev Track)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
                  <span>Runs natively in background without CPU or audio sleep throttling</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
                  <span>High-resolution desktop UI optimized for widescreen monitors</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
                  <span>Synchronized lyrics, artist discographies, and queue management</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              {/* Primary Download Button */}
              <a
                href={WINDOWS_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-200 active:scale-[0.98] text-black font-bold text-sm transition-all shadow-lg shadow-white/10"
              >
                <Download size={17} className="stroke-[2.5]" />
                <span>Get for Windows</span>
              </a>

              {/* Web Player fallback button */}
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold border border-white/5 transition-colors cursor-pointer"
              >
                <span>Or use Jennie Web Player in browser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Simple Step-by-Step Installation Guide */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0e0e10] border border-white/[0.08] mb-12">
          <h3 className="text-lg font-bold text-white mb-6">How to Install on Android</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                1
              </div>
              <h4 className="text-sm font-semibold text-white">Download the APK</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tap the "Download APK" button above to download <code className="text-neutral-300">Jennie-Music.apk</code> directly onto your Android device.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                2
              </div>
              <h4 className="text-sm font-semibold text-white">Enable Unknown Apps</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                When prompted by Android, tap "Settings" and switch on "Allow from this source" for your browser (Chrome or Files).
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                3
              </div>
              <h4 className="text-sm font-semibold text-white">Install &amp; Enjoy</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tap "Install". Once finished, open Jennie Music and start streaming your favorite tracks with synced lyrics!
              </p>
            </div>
          </div>
        </div>

        {/* Security & Verification Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <span>
              All APK releases are built automatically via GitHub Actions CI from transparent source code.
            </span>
          </div>
          <a
            href="https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white underline shrink-0 font-medium"
          >
            <span>View Source on GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
