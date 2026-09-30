import React, { useState } from 'react';
import {
  Headphones,
  Mic,
  HardDrive,
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { usePermissionStore } from '../../store/usePermissionStore';
import { PERMISSION_TYPES, PERMISSION_STATUS } from '../../services/permissionService';

export const PermissionSettingsSection = () => {
  const permissions = usePermissionStore((state) => state.permissions);
  const isRequesting = usePermissionStore((state) => state.isRequesting);
  const requestMic = usePermissionStore((state) => state.requestMic);
  const requestNotifications = usePermissionStore((state) => state.requestNotifications);
  const requestStorage = usePermissionStore((state) => state.requestStorage);
  const requestHeadphones = usePermissionStore((state) => state.requestHeadphones);
  const updatePermission = usePermissionStore((state) => state.updatePermission);
  const openSetupModal = usePermissionStore((state) => state.openSetupModal);

  const [feedbackMsg, setFeedbackMsg] = useState('');

  const triggerNotify = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const getStatusBadge = (status) => {
    if (status === PERMISSION_STATUS.GRANTED) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={13} />
          <span>Allowed</span>
        </span>
      );
    }
    if (status === PERMISSION_STATUS.DENIED) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle size={13} />
          <span>Blocked</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertCircle size={13} />
        <span>Not Granted</span>
      </span>
    );
  };

  const handleToggleMic = async () => {
    if (permissions[PERMISSION_TYPES.MICROPHONE] === PERMISSION_STATUS.GRANTED) {
      updatePermission(PERMISSION_TYPES.MICROPHONE, PERMISSION_STATUS.PROMPT);
      triggerNotify('Microphone access paused for voice search.');
    } else {
      const res = await requestMic();
      triggerNotify(res === PERMISSION_STATUS.GRANTED ? 'Microphone permission granted!' : 'Microphone permission not granted.');
    }
  };

  const handleToggleNotifications = async () => {
    if (permissions[PERMISSION_TYPES.NOTIFICATIONS] === PERMISSION_STATUS.GRANTED) {
      updatePermission(PERMISSION_TYPES.NOTIFICATIONS, PERMISSION_STATUS.PROMPT);
      triggerNotify('Notifications turned off.');
    } else {
      const res = await requestNotifications();
      triggerNotify(res === PERMISSION_STATUS.GRANTED ? 'Notifications allowed!' : 'Notifications permission not granted.');
    }
  };

  const handleToggleStorage = async () => {
    const res = await requestStorage();
    triggerNotify('Storage offline quota refreshed.');
  };

  const handleToggleHeadphones = async () => {
    const res = await requestHeadphones();
    triggerNotify('Headphone hardware routing verified.');
  };

  return (
    <section className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>App Permissions & Hardware Access</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage device hardware integrations, voice features, and local offline storage permissions.
          </p>
        </div>

        <button
          onClick={openSetupModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition active:scale-95 flex-shrink-0"
        >
          <RotateCcw size={14} />
          <span>Launch Setup Wizard</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-neutral-800/80 border border-neutral-700 text-white text-xs rounded-xl animate-fadeIn">
          {feedbackMsg}
        </div>
      )}

      {/* Permission Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Headphones & Audio */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                <Headphones size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Headphones & Bluetooth</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Media keys, remote volume, background playback</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.HEADPHONES])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">Hardware Session</span>
            <button
              onClick={handleToggleHeadphones}
              disabled={isRequesting}
              className="text-xs font-medium text-purple-400 hover:text-purple-300 transition"
            >
              Verify Connection
            </button>
          </div>
        </div>

        {/* 2. Microphone */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                <Mic size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Microphone & Voice</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Voice song search, hum-to-find, karaoke sync</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.MICROPHONE])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">Audio Input Stream</span>
            <button
              onClick={handleToggleMic}
              disabled={isRequesting}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 transition"
            >
              {permissions[PERMISSION_TYPES.MICROPHONE] === PERMISSION_STATUS.GRANTED ? 'Revoke Access' : 'Allow Access'}
            </button>
          </div>
        </div>

        {/* 3. Storage */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                <HardDrive size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Storage & Offline Cache</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Offline album cache, cached tracks, audio buffer</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.STORAGE])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">Persistent Quota</span>
            <button
              onClick={handleToggleStorage}
              disabled={isRequesting}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition"
            >
              Check Quota
            </button>
          </div>
        </div>

        {/* 4. Notifications */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Notifications & Alerts</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Lockscreen player, song releases, status updates</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.NOTIFICATIONS])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">System Notification API</span>
            <button
              onClick={handleToggleNotifications}
              disabled={isRequesting}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
            >
              {permissions[PERMISSION_TYPES.NOTIFICATIONS] === PERMISSION_STATUS.GRANTED ? 'Turn Off' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PermissionSettingsSection;
