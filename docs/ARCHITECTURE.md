# Jennie Web App - Architecture & Design Specifications

## 1. System Topology
The Jennie Music streaming application is organized as a high-performance Single Page Application (SPA) powered by React 18, Vite, and Tailwind CSS, with native cross-platform targets via Capacitor (Android/iOS) and Electron.

```
  ┌────────────────────────────────────────────────────────┐
  │                   Client Layer                         │
  │  (React 18 + Vite + Tailwind CSS + Lucide Icons)       │
  └───────────────────────────┬────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ Local State  │     │ Streaming &  │     │ Cloud Sync   │
  │ (Zustand &   │     │ Audio Engine │     │ (Firestore & │
  │ LocalStorage)│     │ (HTML5 Audio)│     │ Auth API)    │
  └──────────────┘     └──────────────┘     └──────────────┘
```

## 2. State Management Architecture
State is decoupled across modular Zustand stores:
- **`usePlayerStore`**: Controls active track, queue, playback progress, shuffle, repeat mode, and volume levels.
- **`useAuthStore`**: Manages authenticated user session tokens, user metadata, and profile settings.
- **`usePlaylistStore`**: Handles user-created playlists, favorites, and cached library state.

## 3. Audio Streaming Pipeline
- Utilizes the HTML5 Audio interface encapsulated within custom hooks to ensure low latency and seamless track switching.
- Dynamic buffering and pre-caching are implemented for smooth playback transitions.
- MediaSession API integration provides native hardware media key controls and lockscreen notifications on mobile devices.

## 4. Continuous Integration & Quality Assurance
- Automated linting and syntax verification via ESLint.
- Static type verification via JavaScript modern standards.
- Production bundles compiled and optimized through Vite roll-up treeshaking.
