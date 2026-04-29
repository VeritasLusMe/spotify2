// ════════════════════════════════════════════════════════════
//  songs.runtime.js — Merges your curated list (songs.js) with
//  build-time Spotify metadata (songs.generated.json).
//
//  The result is a normalized SONGS array that the App consumes:
//    { id, spotifyId, title, artist, album, art, duration, year,
//      tag, genre, colors, lyrics, tracks }
// ════════════════════════════════════════════════════════════
import { SONGS as RAW } from './songs.js';

// Resolved by Vite at build time. Tolerates the file not existing yet
// (e.g. fresh clone before `npm run dev` has triggered the prebuild
// script) — falls back to an empty meta map.
const generatedFiles = import.meta.glob('./songs.generated.json', { eager: true });
const META = Object.values(generatedFiles)[0]?.default || {};

function fmtDur(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = Math.floor((sec || 0) % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const SONGS = RAW.map((s, i) => {
  const m = META[s.spotifyId] || {};
  const title = s.title || m.title || `Track ${i + 1}`;
  const artist = s.artist || m.artist || 'Unknown Artist';
  const album = s.album || m.album || '';
  const art = s.art || m.art || '';
  const duration = s.duration || m.duration || 0;
  const year = s.year || m.year || '';
  return {
    id: i,
    spotifyId: s.spotifyId,
    title,
    artist,
    album,
    art,
    duration,
    year,
    tag: s.tag || '',
    genre: s.genre || '',
    colors: s.colors,
    lyrics: s.lyrics || [{ t: 0, text: '♪' }],
    tracks: s.tracks || [{ n: 1, title, dur: fmtDur(duration) }],
    _missingMeta: !META[s.spotifyId] || META[s.spotifyId]._placeholder,
  };
});
