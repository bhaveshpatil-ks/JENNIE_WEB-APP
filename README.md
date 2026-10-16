# Jennie Music

High-fidelity music streaming platform featuring artist discographies, synchronized lyrics, responsive web streaming, and native Android and Windows desktop applications.

---

## Live Application & Downloads

| Platform | Type | Link |
| :--- | :--- | :--- |
| **Web App** | Live Production | [https://jennie-ee.netlify.app/](https://jennie-ee.netlify.app/) |
| **Android APK (Direct)** | Direct Download | [Download Jennie-Music.apk](https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/releases/latest/download/Jennie-Music.apk) |
| **Android Releases** | Release History | [GitHub Releases](https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/releases) |
| **CI Builds** | Automated Artifacts | [GitHub Actions Runs](https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP/actions) |
| **Source Code** | Git Repository | [https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP](https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP) |

---

## Overview

Jennie Music provides uninterrupted, studio-grade audio streaming powered by a custom hybrid playback engine:
- **Audio Architecture**: YouTube IFrame API playback with automatic embed-restriction recovery (Code 150/101 auto-failover to verified audio/lyric streams).
- **Modern User Interface**: Neutral dark monochrome interface designed according to anti-slop guidelines with zero artificial gradients or cluttered badge schemes.
- **Hardware Integrations**: Support for Bluetooth headphone media controls (play, pause, skip), background playback, and system media session metadata.
- **Synchronized Lyrics**: Real-time syllable and line-synced lyrics display.
- **Offline Storage**: Persistent client-side caching for fast local playlist access.

---

## Platform Support

### 1. Web
- Framework: React 19 with Vite 6 and Tailwind CSS.
- Deployed on Netlify with automated continuous deployment.
- Responsive layout supporting ultra-wide desktop monitors, laptops, tablets, and mobile browsers.

### 2. Android
- Runtime: Capacitor 8 native bridge with Android Gradle Plugin 8.7.3 and Gradle 8.10.2.
- Target SDK: Android API 35 (Android 15+).
- Background audio with lock screen media notifications and hardware volume control routing.
- Automated CI pipeline compiling debug APKs and publishing releases on GitHub.

### 3. Windows Desktop
- Runtime: Electron 44 with electron-builder.
- Global OS media key listeners (`MediaPlayPause`, `MediaNextTrack`, `MediaPreviousTrack`).
- Background throttling disabled (`backgroundThrottling: false`) to ensure smooth continuous playback when minimized.

---

## Directory Structure

```
jennie codes/
├── .github/
│   └── workflows/
│       ├── build-apk.yml          # Automated Android APK compilation & release
│       └── deploy.yml             # Web continuous integration verification
├── android/                       # Native Android project (Gradle, AndroidManifest)
│   ├── app/                       # Android application module
│   └── gradle/wrapper/            # Gradle 8.10.2 wrapper
├── electron/                      # Desktop runtime entry points
│   ├── main.cjs                   # Electron main process & media key listeners
│   └── preload.cjs                # Context bridge API
├── src/                           # React 19 frontend codebase
│   ├── components/                # Modular UI components (Player, Layout, Settings)
│   ├── pages/                     # Application routes (Home, Search, ArtistDetail)
│   ├── services/                  # API layer, recommendation engine, permissions
│   ├── store/                     # Zustand state management stores
│   └── index.css                  # Global styling and design tokens
├── capacitor.config.json          # Capacitor configuration
├── package.json                   # Dependencies, scripts, and build targets
└── vite.config.js                 # Vite bundler configuration & code splitting
```

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bhaveshpatil-ks/JENNIE_WEB-APP.git
   cd "JENNIE_WEB-APP"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally (Web)

```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Production Web Build

```bash
npm run build
```
Generates production-optimized static assets in `dist/`.

---

## Native Builds

### Android APK

#### Via GitHub Actions (Cloud Build)
Push to the `main` branch or trigger the `Build Android APK & Release` workflow manually under the **Actions** tab. The compiled `.apk` will be available in **Releases** and **Artifacts**.

#### Locally (via Android Studio)
1. Build web bundle and sync native Android project:
   ```bash
   npm run build
   npx cap sync android
   ```
2. Open in Android Studio:
   ```bash
   npx cap open android
   ```
3. In Android Studio, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

### Windows Desktop Application

#### Development Mode:
```bash
npm run electron:dev
```

#### Package Windows Executable:
```bash
npm run electron:build
```
Generates the Windows installer (`.exe`) inside the `release/` directory.

---

## License

This project is licensed under the MIT License.
