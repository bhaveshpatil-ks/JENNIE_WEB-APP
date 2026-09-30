# 📱 Jennie Music — Multi-Platform Native Application

> Complete cross-platform application codebase powering **Jennie Music** across **Android**, **iOS**, **Windows**, and **macOS**.
> Isolated in `jennie app codes/` for complete architectural safety and clear separation of concerns.

---

## 🏗️ Architecture Overview

This multi-platform architecture builds upon Jennie's React 19 high-fidelity streaming frontend, wrapped in native runtimes:

1. **Android & iOS (Mobile)**:
   - Powered by **Capacitor 8** native runtime.
   - Native Plugins:
     - `@capacitor/status-bar`: Immersive `#080808` dark status bar matching the luxury obsidian UI.
     - `@capacitor/haptics`: Tactile feedback on track playback, likes, and seeking.
     - `@capacitor/app`: Hardware back-button listener on Android (closes active modals/drawers before navigating).
   - Safe Area CSS insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`) supporting iPhone dynamic island, notches, and Android gesture navigation bars.
   - Background audio lockscreen controls via `MediaSession` API with album art, artist, and track title.

2. **Windows & macOS (Desktop)**:
   - Powered by **Electron 44** & **electron-builder**.
   - Global media keys: `MediaPlayPause`, `MediaNextTrack`, and `MediaPreviousTrack` registered at the OS level so your physical keyboard media keys control Jennie even when the window is minimized.
   - Background audio throttling disabled (`backgroundThrottling: false`) to guarantee uninterrupted playback.
   - Frameless luxury obsidian window styling.

---

## 📁 Directory Structure

```
jennie app codes/
├── 📁 android/                     # Native Android Studio project (Gradle, AndroidManifest)
├── 📁 ios/                         # Native Xcode iOS project (Swift, Info.plist)
├── 📁 electron/                    # Desktop runtime processes
│   ├── main.cjs                   # Electron main process (Media keys, window manager)
│   └── preload.cjs                # Secure context bridge (electronAPI)
├── 📁 src/                         # Unified React 19 application
│   ├── 📁 components/             # PlayerBar, FullscreenPlayer, LyricsView, etc.
│   ├── 📁 pages/                  # Home, Search, ArtistDetail, AlbumDetail, etc.
│   ├── 📁 services/               # API clients, recommendations, & nativeBridge.js
│   ├── 📁 store/                  # Zustand stores (usePlayerStore, useLibraryStore)
│   └── index.css                  # Tailwind styles with safe-area insets
├── capacitor.config.json          # Capacitor configuration (App ID, Splash, StatusBar)
├── package.json                   # Cross-platform dependencies and build scripts
└── vite.config.js                 # Optimized bundler configuration
```

---

## 🚀 Running & Building the Apps

### 📱 Android (APK & Google Play)

1. **Build web bundle and sync native Android project**:
   ```bash
   npm run build:mobile
   ```

2. **Open in Android Studio**:
   ```bash
   npm run cap:open:android
   ```
   *In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate your installable `.apk` file.*

3. **Or build debug APK directly via command line**:
   ```bash
   cd android
   ./gradlew assembleDebug
   # APK generated at: android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

### 🍏 iOS (iPhone & iPad)

*(Requires macOS with Xcode installed)*

1. **Build web assets and sync iOS project**:
   ```bash
   npm run build:mobile
   ```

2. **Open in Xcode**:
   ```bash
   npm run cap:open:ios
   ```
   *Select your simulator or connected iPhone and press **Cmd + R** to run.*

---

### 💻 Windows & macOS (Desktop)

#### Development Mode (with Live Hot-Reloading):
```bash
npm run electron:dev
```

#### Production Desktop Package:
```bash
npm run electron:build
```
- **Windows**: Produces `.exe` installer (NSIS) and portable `.exe` inside `release/`.
- **macOS**: Produces `.dmg` disk image and `.zip` inside `release/`.

---

## 🔒 Safety & Isolation
This folder (`jennie app codes/`) is completely decoupled from `frontend/` and `backend/`. Any platform customizations, native plugins, or store release builds can be made here without disrupting the live deployed web service.
