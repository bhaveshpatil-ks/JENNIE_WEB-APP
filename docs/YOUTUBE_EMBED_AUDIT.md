# YouTube IFrame Embed Diagnostic & Resilience Runbook

## Overview
This runbook explains the root causes of intermittent (~50%) playback failures in WebView/Capacitor apps vs. browser websites and outlines the 4-step resilience architecture implemented in Jennie Music.

---

## 1. Root Causes: Why 50% of Tracks Fail in Mobile App WebViews

### Cause 1: Missing or Invalid Origin/Referrer Header (Error 153 & Error 150)
- **In Browser (Web)**: Requests originate from `https://jennie-ee.netlify.app`. YouTube's embed CDN validates this origin and allows playback.
- **In Mobile App WebView (Android/Capacitor/Cordova)**: WebViews often run from `capacitor://localhost`, `http://localhost`, or `file://`.
- **YouTube 2025/2026 Enforcement**: Major music record labels (T-Series, Sony Music, Universal, Speed Records, Saregama) require strict HTTPS domain referrer validation. Videos with relaxed settings played, while restricted label videos failed immediately with **Error 153** or **Error 150**.

### Cause 2: Non-Embeddable / Deleted Videos (Error 101, 150, 100)
- Certain tracks are blocked from third-party embedding entirely by the copyright owner (`status.embeddable = false`), or are geoblocked or age-restricted.

---

## 2. YouTube Error Code Diagnostic Matrix

| Error Code | Official Meaning | Root Cause | Implemented Jennie Mitigation |
| :---: | :--- | :--- | :--- |
| **153** | No referrer or origin sent | App WebView loads from non-HTTPS host | Force `origin` and `widget_referrer` to `https://jennie-ee.netlify.app`; auto-skip |
| **150 / 101** | Owner prohibited embedded playback | Label restriction (Sony/T-Series/Universal) | Mark `unplayable: true` in registry, toast user, auto-skip after 1.2s |
| **100** | Video not found / deleted / private | Track removed from YouTube | Mark unplayable, auto-skip to next queue track |
| **5** | HTML5 player error | Autoplay policy or hidden zero-sized iframe | Use standard 280x200 dimension container; auto-recover |
| **2** | Invalid video ID syntax | Malformed query parameter | Clean 11-char ID extraction, auto-skip |

---

## 3. Four-Step Architecture Implemented

### Step 1: Real-Time Diagnostic Logging
`YouTubePlayerEmbed.jsx` captures all `onError` events, logging the video ID, error code, and translated diagnosis to the console for instant debugging.

### Step 2: Valid HTTPS Origin & Referrer Guarantee
- `getEffectivePlayerOrigin()` falls back to `https://jennie-ee.netlify.app` whenever `window.location.origin` is `file://`, `capacitor://`, or `localhost`.
- `playerVars` explicitly includes:
  ```javascript
  {
    origin: effectiveOrigin,
    widget_referrer: effectiveOrigin,
    enablejsapi: 1,
    playsinline: 1
  }
  ```
- `index.html` has `<meta name="referrer" content="strict-origin-when-cross-origin" />`.

### Step 3: Runtime Auto-Recovery & Exclusion
- On fatal errors (100, 101, 150, 153):
  1. `store.markTrackUnplayable(videoId, code, reason)` registers the failure in `unplayableTracksRegistry`.
  2. Friendly UI toast notifies the user: `"Embedding blocked by copyright owner (Code X). Playing next..."`.
  3. `store.nextTrack(false, { isErrorSkip: true })` skips to the next track after 1.2s.
  4. The skip is flagged as `isErrorSkip: true`, ensuring the recommendation algorithm does **not** penalize the artist or increment user skip counts.

### Step 4: Catalog Filtering
- `recommendationEngine.js` automatically filters out any track in `unplayableTracksRegistry` from upcoming recommendation pools and autoplay queues.
