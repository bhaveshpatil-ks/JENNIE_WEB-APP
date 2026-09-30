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

      const origin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:')
        ? window.location.origin
        : undefined;

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
            ...(origin ? { origin } : {})
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
              console.warn('[YouTube API Error Code]:', event.data);
              // Only fatal errors indicate the track is unavailable:
              // 100: Video removed/not found
              // 101 or 150: Video owner prohibits embedded playback
              // Ignore non-fatal codes (e.g. 2, 5 or transient network cancels)
              const isFatal = event.data === 100 || event.data === 101 || event.data === 150;
              if (isFatal) {
                const store = usePlayerStore.getState();
                if (store.showToast) {
                  store.showToast('Track unavailable. Playing next track...');
                }
                if (errorSkipTimerRef.current) clearTimeout(errorSkipTimerRef.current);
                errorSkipTimerRef.current = setTimeout(() => {
                  if (usePlayerStore.getState().isPlaying) {
                    usePlayerStore.getState().nextTrack();
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
      className="fixed bottom-0 right-0 w-[2px] h-[2px] opacity-[0.001] pointer-events-none -z-50 overflow-hidden"
      aria-hidden="true"
    >
      <div id="yt-player-target" />
    </div>
  );
};

export default YouTubePlayerEmbed;
