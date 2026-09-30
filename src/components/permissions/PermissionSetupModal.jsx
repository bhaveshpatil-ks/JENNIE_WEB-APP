import React, { useState } from 'react';
import {
  Headphones,
  Mic,
  HardDrive,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';
import { usePermissionStore } from '../../store/usePermissionStore';
import { PERMISSION_TYPES } from '../../services/permissionService';

export const PermissionSetupModal = ({ isOpen, onClose }) => {
  const isRequesting = usePermissionStore((state) => state.isRequesting);
  const completeOnboarding = usePermissionStore((state) => state.completeOnboarding);
  const dismissModal = usePermissionStore((state) => state.dismissModal);

  // Local state for checkboxes
  const [selected, setSelected] = useState({
    [PERMISSION_TYPES.HEADPHONES]: true,
    [PERMISSION_TYPES.MICROPHONE]: true,
    [PERMISSION_TYPES.STORAGE]: true,
    [PERMISSION_TYPES.NOTIFICATIONS]: true,
  });

  if (!isOpen) return null;

  const toggleItem = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAllowAll = async () => {
    const all = {
      [PERMISSION_TYPES.HEADPHONES]: true,
      [PERMISSION_TYPES.MICROPHONE]: true,
      [PERMISSION_TYPES.STORAGE]: true,
      [PERMISSION_TYPES.NOTIFICATIONS]: true,
    };
    await completeOnboarding(all);
    if (onClose) onClose();
  };

  const handleContinueSelected = async () => {
    await completeOnboarding(selected);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    dismissModal();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#111113] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Dismiss Button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800/60 transition"
          aria-label="Skip permission setup"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
            <ShieldCheck size={14} />
            <span>Device & Playback Setup</span>
          </div>
          <h2 id="permission-modal-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Enable Permissions
          </h2>
          <p className="text-neutral-400 text-sm mt-1.5 leading-relaxed">
            Allow Jennie Music to access audio hardware, voice features, and offline storage for the optimal experience.
          </p>
        </div>

        {/* Permission Checklist */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 mb-6">
          {/* 1. Headphone & Audio Hardware */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.HEADPHONES)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              selected[PERMISSION_TYPES.HEADPHONES]
                ? 'bg-neutral-900/90 border-neutral-700/80 shadow-sm'
                : 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/20">
              <Headphones size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">Headphones & Hardware Controls</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Connects Bluetooth & wired headphone buttons (play, pause, skip) and background audio routing.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.HEADPHONES]}
              onChange={() => {}}
              className="mt-1 w-5 h-5 rounded accent-rose-500 cursor-pointer pointer-events-none"
            />
          </div>

          {/* 2. Microphone (Voice Search & Lyrics) */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.MICROPHONE)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              selected[PERMISSION_TYPES.MICROPHONE]
                ? 'bg-neutral-900/90 border-neutral-700/80 shadow-sm'
                : 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-500/20">
              <Mic size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">Microphone & Voice Search</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Enables hands-free voice song search, song recognition, and karaoke lyric synchronization.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.MICROPHONE]}
              onChange={() => {}}
              className="mt-1 w-5 h-5 rounded accent-rose-500 cursor-pointer pointer-events-none"
            />
          </div>

          {/* 3. Storage & Offline Caching */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.STORAGE)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              selected[PERMISSION_TYPES.STORAGE]
                ? 'bg-neutral-900/90 border-neutral-700/80 shadow-sm'
                : 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/20">
              <HardDrive size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">Storage & Offline Cache</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  Essential
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Allows persistent high-speed caching of audio tracks and playlists for instant offline listening.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.STORAGE]}
              onChange={() => {}}
              className="mt-1 w-5 h-5 rounded accent-rose-500 cursor-pointer pointer-events-none"
            />
          </div>

          {/* 4. Playback Notifications */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.NOTIFICATIONS)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
              selected[PERMISSION_TYPES.NOTIFICATIONS]
                ? 'bg-neutral-900/90 border-neutral-700/80 shadow-sm'
                : 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/20">
              <Bell size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">Notifications & Lockscreen</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  Optional
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Receive lockscreen player controls, new music release drops, and offline download status.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.NOTIFICATIONS]}
              onChange={() => {}}
              className="mt-1 w-5 h-5 rounded accent-rose-500 cursor-pointer pointer-events-none"
            />
          </div>
        </div>

        {/* Buttons & Footer */}
        <div className="space-y-3 pt-2 border-t border-neutral-800/80">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleAllowAll}
              disabled={isRequesting}
              className="flex-1 bg-white hover:bg-neutral-100 text-black font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              <Sparkles size={18} />
              <span>Allow All & Continue</span>
            </button>
            <button
              onClick={handleContinueSelected}
              disabled={isRequesting}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-5 rounded-2xl flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
            >
              <span>Save Selected</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 px-1 pt-1">
            <span>You can change these anytime in Settings</span>
            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-white underline underline-offset-4 transition"
            >
              Setup Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionSetupModal;
