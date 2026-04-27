// ════════════════════════════════════════════════════════════
//  audio.js — HTML5 audio playback hook.
//
//  Replaces the original mockup's setInterval-based time tick with a
//  real <audio> element, so play/pause/seek/volume/next-on-end all
//  reflect actual playback. Falls back gracefully if a song has no
//  audio file set (UI still works, time stays at 0).
// ════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';

export function useAudioPlayer({ song, onEnded }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(song?.duration || 0);
  const [volume, setVolumeState] = useState(70);
  const [muted, setMuted] = useState(false);

  // Single Audio element for the lifetime of the component
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTime = () => setTime(audio.currentTime);
    const onLoaded = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnd = () => { setPlaying(false); onEnded?.(); };
    const onPlayEvt = () => setPlaying(true);
    const onPauseEvt = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('durationchange', onLoaded);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('play', onPlayEvt);
    audio.addEventListener('pause', onPauseEvt);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('durationchange', onLoaded);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('play', onPlayEvt);
      audio.removeEventListener('pause', onPauseEvt);
      audio.src = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load new track when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setTime(0);
    setDuration(song?.duration || 0);
    if (song?.audio) {
      audio.src = song.audio;
      audio.load();
    } else {
      audio.removeAttribute('src');
      audio.load();
    }
  }, [song?.id, song?.audio]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume / 100;
  }, [volume, muted]);

  const play = () => {
    const a = audioRef.current;
    if (!a || !song?.audio) return;
    a.play().catch(() => {/* ignored — user gesture required */});
  };
  const pause = () => audioRef.current?.pause();
  const toggle = () => (playing ? pause() : play());

  const seek = (t) => {
    const a = audioRef.current;
    if (!a) return;
    const clamped = Math.max(0, Math.min(t, duration || song?.duration || 0));
    if (song?.audio) {
      a.currentTime = clamped;
    }
    setTime(clamped);
  };

  const setVolume = (v) => setVolumeState(Math.max(0, Math.min(100, v)));
  const toggleMute = () => setMuted((m) => !m);

  return {
    playing, time, duration, volume, muted,
    play, pause, toggle, seek, setVolume, toggleMute,
  };
}
