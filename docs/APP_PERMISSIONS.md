# Jennie Web App - App Permissions & Hardware Integration Guide

## Overview
Jennie Music implements a user-friendly, transparent permission onboarding model designed to optimize hardware audio routing, hands-free voice search, high-speed offline caching, and lockscreen media notifications.

## Permission Checklist & Specifications

### 1. Headphone & Bluetooth Hardware Access (`headphones`)
- **Purpose**: Integrates hardware media keys (Play, Pause, Skip, Prev) found on wired headsets, AirPods, and Bluetooth audio devices. Enables low-latency audio routing and background streaming.
- **Underlying Web & Native API**: `navigator.mediaSession`, `HTMLAudioElement.setSinkId()`, Capacitor Audio Bridge.
- **Privacy Impact**: None (read-only action handlers for media keys).

### 2. Microphone & Voice Command (`microphone`)
- **Purpose**: Hands-free search for artists/albums/tracks, hum-to-find song recognition, and interactive lyric sync / karaoke visualization.
- **Underlying Web & Native API**: `navigator.mediaDevices.getUserMedia({ audio: true })`.
- **Privacy Impact**: Audio streams are processed strictly in-browser or streamed to private search endpoints; streams are terminated immediately when voice input completes.

### 3. Local Storage & Offline Music Cache (`storage`)
- **Purpose**: Caches audio files, cover art, and playlist metadata so users can continue listening during network interruptions or offline mode.
- **Underlying Web & Native API**: `navigator.storage.persist()`, `IndexedDB`, `localStorage`.
- **Privacy Impact**: Local device storage only; no personal data exported.

### 4. Playback Notifications & Alerts (`notifications`)
- **Purpose**: Displays system lockscreen notification controls, background playback status, and alerts when favorite artists drop new singles.
- **Underlying Web & Native API**: Standard Web Notification API (`Notification.requestPermission()`).
- **Privacy Impact**: Standard notifications; no background tracking.

## First-Time Onboarding Experience
1. On initial app launch, `hasCompletedPermissionSetup()` checks `localStorage.getItem('jennie_permissions_setup_completed')`.
2. If `false`, `PermissionSetupModal` opens with a luxury checklist UI.
3. Users can:
   - Click **Allow All & Continue** to grant recommended permissions.
   - Customize checkboxes for individual permissions and click **Save Selected**.
   - Click **Setup Later** to proceed directly to the music catalog.

## Settings Management
Users can view and adjust these permissions anytime in **Settings ➔ App Permissions & Hardware Access** or re-launch the setup wizard via **Launch Setup Wizard**.
