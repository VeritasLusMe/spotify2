// ════════════════════════════════════════════════════════════
//  spotify-player.js — useSpotifyPlayer hook (Web Playback SDK).
//
//  Drop-in replacement for useAudioPlayer. Same interface:
//    { playing, time, duration, volume, muted,
//      play, pause, toggle, seek, setVolume, toggleMute }
//  Plus:
//    { ready, needsLogin, error }
//
//  Requires Spotify Premium on the listening account.
// ════════════════════════════════════════════════════════════
import { useEffect, useRef, useState, useCallback } from 'react';
import { getAccessToken, isLoggedIn } from './spotify-auth.js';

const SDK_SRC = 'https://sdk.scdn.co/spotify-player.js';

let sdkPromise = null;
function loadSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (window.Spotify) return resolve(window.Spotify);
    window.onSpotifyWebPlaybackSDKReady = () => resolve(window.Spotify);
    const s = document.createElement('script');
    s.src = SDK_SRC;
    s.async = true;
    s.onerror = () => reject(new Error('Failed to load Spotify SDK'));
    document.body.appendChild(s);
  });
  return sdkPromise;
}

async function api(path, init = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('not_logged_in');
  return fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export function useSpotifyPlayer({ song, onEnded }) {
  const playerRef = useRef(null);
  const deviceIdRef = useRef(null);
  const rafRef = useRef(null);
  const lastStateAtRef = useRef(0);
  const lastPositionRef = useRef(0);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const [ready, setReady] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(!isLoggedIn());
  const [error, setError] = useState(null);

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState((song?.duration) || 0);
  const [volumeState, setVolumeState] = useState(70);
  const [muted, setMuted] = useState(false);

  // Initialise the SDK once we have a token.
  useEffect(() => {
    let cancelled = false;
    let player;

    async function init() {
      if (!isLoggedIn()) {
        setNeedsLogin(true);
        return;
      }
      setNeedsLogin(false);

      let Spotify;
      try {
        Spotify = await loadSdk();
      } catch (e) {
        setError('sdk_load_failed');
        return;
      }
      if (cancelled) return;

      player = new Spotify.Player({
        name: 'Editorial Player',
        getOAuthToken: async (cb) => {
          const t = await getAccessToken();
          if (t) cb(t);
        },
        volume: 0.7,
      });

      player.addListener('ready', ({ device_id }) => {
        if (cancelled) return;
        deviceIdRef.current = device_id;
        setReady(true);
      });

      player.addListener('not_ready', () => {
        if (cancelled) return;
        setReady(false);
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error('[spotify-player] init error', message);
        setError('init_failed');
      });
      player.addListener('authentication_error', ({ message }) => {
        console.error('[spotify-player] auth error', message);
        setNeedsLogin(true);
      });
      player.addListener('account_error', ({ message }) => {
        console.error('[spotify-player] account error', message);
        setError('premium_required');
      });
      player.addListener('playback_error', ({ message }) => {
        console.error('[spotify-player] playback error', message);
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) return;
        lastStateAtRef.current = performance.now();
        lastPositionRef.current = state.position;
        setPlaying(!state.paused);
        setTime(state.position / 1000);
        if (state.duration) setDuration(state.duration / 1000);

        // Detect end-of-track. SDK reports paused with position==0 at end.
        if (
          state.paused &&
          state.position === 0 &&
          state.track_window?.previous_tracks?.find(
            (t) => t.id === state.track_window?.current_track?.id
          )
        ) {
          onEndedRef.current?.();
        }
      });

      const ok = await player.connect();
      if (!ok) {
        setError('connect_failed');
        return;
      }
      playerRef.current = player;
    }

    init();
    return () => {
      cancelled = true;
      try {
        player?.disconnect();
      } catch {}
      playerRef.current = null;
      deviceIdRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth interpolation of `time` between SDK state updates (~1s apart).
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      const elapsed = performance.now() - lastStateAtRef.current;
      const ms = lastPositionRef.current + elapsed;
      setTime(ms / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  // Apply volume / mute to the SDK player.
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    const v = muted ? 0 : volumeState / 100;
    p.setVolume(v).catch(() => {});
  }, [volumeState, muted]);

  // Reset visible time / duration when song id changes (before SDK responds).
  useEffect(() => {
    setTime(0);
    setDuration(song?.duration || 0);
    lastPositionRef.current = 0;
    lastStateAtRef.current = performance.now();
  }, [song?.spotifyId, song?.duration]);

  const wantPlayRef = useRef(false);

  const play = useCallback(async () => {
    if (!song?.spotifyId) return;
    wantPlayRef.current = true;
    const deviceId = deviceIdRef.current;
    if (!deviceId) return; // will retry from the ready effect below
    try {
      const res = await api(`/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [`spotify:track:${song.spotifyId}`] }),
      });
      if (res.status === 401) {
        setNeedsLogin(true);
      } else if (res.status === 403) {
        setError('premium_required');
      } else if (!res.ok && res.status !== 204) {
        const txt = await res.text().catch(() => '');
        console.error('[spotify-player] play failed', res.status, txt);
      } else {
        wantPlayRef.current = false;
      }
    } catch (e) {
      if (String(e.message).includes('not_logged_in')) setNeedsLogin(true);
    }
  }, [song?.spotifyId]);

  // If user hit play before the SDK was ready, finish the request once we are.
  useEffect(() => {
    if (ready && wantPlayRef.current) play();
  }, [ready, play]);

  const pause = useCallback(() => {
    playerRef.current?.pause().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    playerRef.current?.togglePlay().catch(() => {});
  }, []);

  const seek = useCallback(
    (t) => {
      const p = playerRef.current;
      if (!p) return;
      const ms = Math.max(0, Math.min(t, duration || song?.duration || 0)) * 1000;
      p.seek(ms).catch(() => {});
      lastPositionRef.current = ms;
      lastStateAtRef.current = performance.now();
      setTime(ms / 1000);
    },
    [duration, song?.duration]
  );

  const setVolume = useCallback(
    (v) => setVolumeState(Math.max(0, Math.min(100, v))),
    []
  );
  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return {
    playing, time, duration, volume: volumeState, muted,
    play, pause, toggle, seek, setVolume, toggleMute,
    ready, needsLogin, error,
  };
}
