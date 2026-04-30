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
  // Always-current song so callbacks aren't tied to a stale render.
  const songRef = useRef(song);
  songRef.current = song;

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

  // Reset visible time when the *track itself* changes. We deliberately do
  // NOT depend on song?.duration here — the runtime metadata fetch can swap
  // a placeholder duration for the real one mid-playback, and resetting
  // lastPositionRef in that case would freeze the progress bar (it would
  // tick from ~0 again until the SDK next emits a state change, e.g. on
  // pause). Duration is mirrored in a separate effect below.
  useEffect(() => {
    setTime(0);
    lastPositionRef.current = 0;
    lastStateAtRef.current = performance.now();
  }, [song?.spotifyId]);

  // Mirror the song's duration into local state until the SDK reports its
  // own. Only updates the placeholder value — once the SDK has supplied a
  // real duration we leave it alone so we don't clobber it.
  useEffect(() => {
    if (!song?.duration) return;
    setDuration((prev) => (prev > 0 ? prev : song.duration));
  }, [song?.duration]);

  const wantPlayRef = useRef(false);
  // Becomes true after the first successful play call. We use this so that
  // pressing Next/Prev later — even from a paused state — switches Spotify to
  // the new track instead of leaving the SDK on the old URI (which would
  // create a confusing mismatch between the UI's "current song" and what
  // resumes when the user hits play).
  const hasPlayedRef = useRef(false);

  // Read the song from the ref so this callback is stable across re-renders.
  // Otherwise a setTimeout/closure that captured an older `play` would send
  // the *previous* track id to the API even after the user picked a new song.
  const play = useCallback(async () => {
    const current = songRef.current;
    if (!current?.spotifyId) return;
    wantPlayRef.current = true;
    const deviceId = deviceIdRef.current;
    if (!deviceId) return; // will retry from the ready effect below
    try {
      const res = await api(`/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [`spotify:track:${current.spotifyId}`] }),
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
        hasPlayedRef.current = true;
      }
    } catch (e) {
      if (String(e.message).includes('not_logged_in')) setNeedsLogin(true);
    }
  }, []);

  // If user hit play before the SDK was ready, finish the request once we are.
  useEffect(() => {
    if (ready && wantPlayRef.current) play();
  }, [ready, play]);

  // When the curated track id changes after we've started playing at least
  // once, tell Spotify to switch tracks. Without this, picking a different
  // song from the sidebar/home (or hitting Next/Prev) would only update the
  // UI — Spotify would keep playing the previous URI.
  useEffect(() => {
    if (!song?.spotifyId) return;
    if (!deviceIdRef.current) return; // the ready effect above will retry
    if (!hasPlayedRef.current && !wantPlayRef.current) return;
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.spotifyId, ready]);

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
