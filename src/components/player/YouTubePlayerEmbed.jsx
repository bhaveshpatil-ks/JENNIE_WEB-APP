import React, { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';

/**
 * Robust YouTube video ID extractor
 * Handles raw 11-char IDs, 'yt-' prefixes, and full YouTube URLs
 */
export const extractCleanYoutubeId = (track) => {
  if (!track) return null;
  const raw = track.youtubeId || (typeof track.id === 'string' && track.id.startsWith('yt-') ? track.id : null) || track.id || '';
  if (typeof raw !== 'string') return null;
  const str = raw.trim();
  const withoutPrefix = str.startsWith('yt-') ? str.replace('yt-', '') : str;
  const match = withoutPrefix.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))?([\w-]{11})/);
  if (match && match[1]) return match[1];
  if (/^[\w-]{11}$/.test(withoutPrefix)) return withoutPrefix;
  return null;
};

/**
 * Returns a guaranteed valid HTTPS origin for YouTube IFrame handshake.
 * Falls back to the verified production Netlify domain when running inside
 * mobile WebViews (Capacitor/Cordova) or local file:// protocols where origin is missing.
 */
export const getEffectivePlayerOrigin = () => {
  if (typeof window === 'undefined') return 'https://jennie-ee.netlify.app';
  try {
    const locOrigin = window.location.origin;
    if (
      locOrigin &&
      !locOrigin.startsWith('file:') &&
      !locOrigin.startsWith('capacitor:') &&
      !locOrigin.includes('localhost') &&
      !locOrigin.includes('127.0.0.1')
    ) {
      return locOrigin;
    }
  } catch (_) {}
  return 'https://jennie-ee.netlify.app';
};

/**
 * Official Google YouTube IFrame Player API Engine
 * Directly uses window.YT.Player for native, cross-platform playback with full sound.
 * Eliminates iframe destruction, origin mismatches, and postMessage serialization dropouts.
 */
export const YouTubePlayerEmbed = () => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const isReadyRef = useRef(false);
  const currentVideoIdRef = useRef(null);
  const errorSkipTimerRef = useRef(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const registerYouTubeController = usePlayerStore((state) => state.registerYouTubeController);

  const cleanYoutubeId = extractCleanYoutubeId(currentTrack);
  const isYouTubeTrack = currentTrack?.source === 'youtube' || Boolean(cleanYoutubeId);

  // Convert volume from 0..1 to YouTube 0..100
  const getScaledVolume = useCallback(() => {
    const vol = usePlayerStore.getState().volume;
    const rawVal = typeof vol === 'number' ? vol : 1.0;
    const scaled = rawVal <= 1 ? Math.round(rawVal * 100) : Math.round(rawVal);
    return Math.max(0, Math.min(100, scaled));
  }, []);

  // Initialize official Google window.YT.Player
  useEffect(() => {
    let checkInterval = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return false;
      if (playerRef.current) return true;

      const targetEl = document.getElementById('yt-player-target');
      if (!targetEl) return false;

      const effectiveOrigin = getEffectivePlayerOrigin();

      const initialVideoId = cleanYoutubeId || 'LK7-_dgAVQE';
      currentVideoIdRef.current = initialVideoId;

      try {
        playerRef.current = new window.YT.Player('yt-player-target', {
          height: '200',
          width: '300',
          videoId: initialVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: effectiveOrigin,
            widget_referrer: effectiveOrigin,
          },
          events: {
            onReady: (event) => {
              isReadyRef.current = true;
              try {
                event.target.unMute();
                event.target.setVolume(getScaledVolume());
                if (usePlayerStore.getState().isPlaying) {
                  event.target.playVideo();
                }
              } catch (_) {}
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              const store = usePlayerStore.getState();
              if (event.data === 1) {
                // Video is actively playing, cancel any pending error skip timer
                if (errorSkipTimerRef.current) {
                  clearTimeout(errorSkipTimerRef.current);
                  errorSkipTimerRef.current = null;
                }
                if (!store.isPlaying) {
                  usePlayerStore.setState({ isPlaying: true });
                }
              } else if (event.data === 0) {
                if (store.repeatMode === 'one') {
                  event.target.seekTo(0, true);
                  event.target.playVideo();
                } else {
                  store.nextTrack();
                }
              }
            },
            onError: (event) => {
              const code = event.data;
              const store = usePlayerStore.getState();
              const track = store.currentTrack;
              const videoId = currentVideoIdRef.current || track?.id;

              const errorMap = {
                2: 'Invalid video ID parameter or syntax',
                5: 'HTML5 player error or autoplay policy restricted',
                100: 'Video removed, deleted, or marked private',
                101: 'Video owner does not permit embedded playback (label copyright rule)',
                150: 'Video owner prohibits embedded playback on external domains (e.g. Sony, T-Series)',
                153: 'Missing or rejected origin/referrer header in app WebView handshake',
              };
              const errorReason = errorMap[code] || `YouTube playback error (${code})`;

              console.warn(`[YouTube Player Error] Code: ${code} (${errorReason}) on video: ${videoId}`);

              const isFatal = code === 100 || code === 101 || code === 150 || code === 153 || code === 5 || code === 2;
              if (isFatal) {
                // 1. Blacklist unplayable track in runtime & local storage
                if (videoId && typeof store.markTrackUnplayable === 'function') {
                  store.markTrackUnplayable(videoId, code, errorReason);
                }

                // 2. Friendly UI toast notification
                if (typeof store.showToast === 'function') {
                  const friendlyMsg = (code === 101 || code === 150)
                    ? `Embedding blocked by copyright owner (Code ${code}). Playing next...`
                    : code === 153
                    ? `WebView referrer handshake error (Code 153). Playing next...`
                    : `Track unavailable (Code ${code}). Playing next...`;
                  store.showToast(friendlyMsg);
                }

                // 3. Auto-recover by advancing to the next track after 1.2s without penalizing user recommendations
                if (errorSkipTimerRef.current) clearTimeout(errorSkipTimerRef.current);
                errorSkipTimerRef.current = setTimeout(() => {
                  const latestStore = usePlayerStore.getState();
                  if (latestStore.isPlaying) {
                    latestStore.nextTrack(false, { isErrorSkip: true });
                  }
                }, 1200);
              }
            }
          }
        });
        return true;
      } catch (err) {
        console.warn('Failed to construct YT.Player:', err);
        return false;
      }
    };

    // Load iframe_api script if not present
    if (typeof window !== 'undefined') {
      if (!window.YT) {
        const existingScript = document.getElementById('yt-iframe-api');
        if (!existingScript) {
          const tag = document.createElement('script');
          tag.id = 'yt-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
        }
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === 'function') prevReady();
        initPlayer();
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        checkInterval = setInterval(() => {
          if (initPlayer()) {
            clearInterval(checkInterval);
          }
        }, 200);
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (errorSkipTimerRef.current) clearTimeout(errorSkipTimerRef.current);
    };
  }, [cleanYoutubeId, getScaledVolume]);

  // Register YouTube controller methods into player store
  useEffect(() => {
    registerYouTubeController({
      play: () => {
        try {
          const p = playerRef.current;
          if (p && typeof p.playVideo === 'function') {
            p.unMute();
            p.setVolume(getScaledVolume());
            p.playVideo();
          }
        } catch (_) {}
      },
      pause: () => {
        try {
          const p = playerRef.current;
          if (p && typeof p.pauseVideo === 'function') {
            p.pauseVideo();
          }
        } catch (_) {}
      },
      loadVideo: (videoId) => {
        if (!videoId) return;
        const cleanId = typeof videoId === 'string' && videoId.startsWith('yt-')
          ? videoId.replace('yt-', '')
          : videoId;
        
        const p = playerRef.current;
        if (!p) return;

        // If this exact video is already loaded, avoid double loadVideoById call
        if (currentVideoIdRef.current === cleanId) {
          try {
            if (typeof p.playVideo === 'function') {
              p.unMute();
              p.setVolume(getScaledVolume());
              p.playVideo();
            }
          } catch (_) {}
          return;
        }

        currentVideoIdRef.current = cleanId;
        try {
          if (typeof p.loadVideoById === 'function') {
            p.loadVideoById(cleanId, 0);
            p.unMute();
            p.setVolume(getScaledVolume());
            p.playVideo();
          }
        } catch (_) {}
      },
      seekTo: (seconds) => {
        try {
          const p = playerRef.current;
          if (p && typeof p.seekTo === 'function') {
            p.seekTo(seconds, true);
          }
        } catch (_) {}
      },
      setVolume: (vol) => {
        try {
          const rawVal = typeof vol === 'number' ? vol : 1.0;
          const scaled = rawVal <= 1 ? Math.round(rawVal * 100) : Math.round(rawVal);
          const clamped = Math.max(0, Math.min(100, scaled));
          const p = playerRef.current;
          if (p && typeof p.setVolume === 'function') {
            p.setVolume(clamped);
          }
        } catch (_) {}
      },
      mute: () => {
        try {
          const p = playerRef.current;
          if (p && typeof p.mute === 'function') p.mute();
        } catch (_) {}
      },
      unMute: () => {
        try {
          const p = playerRef.current;
          if (p && typeof p.unMute === 'function') {
            p.unMute();
            p.setVolume(getScaledVolume());
          }
        } catch (_) {}
      },
      stop: () => {
        try {
          const p = playerRef.current;
          if (p && typeof p.stopVideo === 'function') p.stopVideo();
        } catch (_) {}
      },
      getCurrentTime: () => {
        try {
          const p = playerRef.current;
          if (p && typeof p.getCurrentTime === 'function') return p.getCurrentTime();
        } catch (_) {}
        return 0;
      },
      getDuration: () => {
        try {
          const p = playerRef.current;
          if (p && typeof p.getDuration === 'function') return p.getDuration();
        } catch (_) {}
        return 0;
      }
    });
  }, [registerYouTubeController, getScaledVolume]);

  // Synchronize track changes (only when cleanYoutubeId actually changes)
  useEffect(() => {
    if (!cleanYoutubeId) return;
    if (currentVideoIdRef.current === cleanYoutubeId) return;

    currentVideoIdRef.current = cleanYoutubeId;
    const p = playerRef.current;
    if (p && isReadyRef.current && typeof p.loadVideoById === 'function') {
      try {
        p.loadVideoById(cleanYoutubeId, 0);
        p.unMute();
        p.setVolume(isMuted ? 0 : getScaledVolume());
        p.playVideo();
      } catch (_) {}
    }
  }, [cleanYoutubeId, isMuted, getScaledVolume]);

  // Sync play / pause
  useEffect(() => {
    if (!isYouTubeTrack) return;
    const p = playerRef.current;
    if (p && isReadyRef.current) {
      try {
        if (isPlaying && typeof p.playVideo === 'function') {
          p.unMute();
          p.setVolume(isMuted ? 0 : getScaledVolume());
          p.playVideo();
        } else if (!isPlaying && typeof p.pauseVideo === 'function') {
          p.pauseVideo();
        }
      } catch (_) {}
    }
  }, [isPlaying, isMuted, isYouTubeTrack, getScaledVolume]);

  // Sync volume
  useEffect(() => {
    if (!isYouTubeTrack) return;
    const p = playerRef.current;
    if (p && isReadyRef.current) {
      try {
        if (isMuted && typeof p.mute === 'function') {
          p.mute();
        } else if (!isMuted && typeof p.unMute === 'function') {
          p.unMute();
          p.setVolume(getScaledVolume());
        }
      } catch (_) {}
    }
  }, [volume, isMuted, isYouTubeTrack, getScaledVolume]);

  // Progress ticker sync from YT player
  useEffect(() => {
    const timer = setInterval(() => {
      const p = playerRef.current;
      if (p && isReadyRef.current && typeof p.getCurrentTime === 'function') {
        try {
          const time = p.getCurrentTime();
          const dur = p.getDuration();
          const store = usePlayerStore.getState();
          if (typeof time === 'number' && !store.isScrubbing && time > 0) {
            const updates = { currentTime: Math.floor(time) };
            if (typeof dur === 'number' && dur > 0) {
              updates.duration = Math.floor(dur);
            }
            usePlayerStore.setState(updates);
          }
        } catch (_) {}
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed -bottom-[320px] -right-[320px] w-[280px] h-[200px] pointer-events-none -z-50 overflow-hidden"
      aria-hidden="true"
    >
      <div id="yt-player-target" />
    </div>
  );
};

export default YouTubePlayerEmbed;
