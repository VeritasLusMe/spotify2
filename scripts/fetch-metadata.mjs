#!/usr/bin/env node
// ════════════════════════════════════════════════════════════
//  fetch-metadata.mjs — Build-time Spotify metadata fetch.
//
//  Reads spotifyId values from src/songs.js, calls the Spotify
//  Tracks API using the Client Credentials flow, and writes
//  src/songs.generated.json. The runtime merges this back in.
//
//  Required env: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
//  Falls back to a placeholder map if either is missing (so
//  `npm run build` still succeeds locally without secrets).
// ════════════════════════════════════════════════════════════
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'src', 'songs.generated.json');

// Minimal .env loader — pulls SPOTIFY_CLIENT_ID/SECRET from .env.local or .env
// without adding a dotenv dependency. CI sets these via Action secrets directly.
for (const name of ['.env.local', '.env']) {
  const p = path.join(ROOT, name);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function loadIds() {
  const songsUrl = pathToFileURL(path.join(ROOT, 'src', 'songs.js')).href;
  const mod = await import(songsUrl);
  const songs = mod.SONGS || [];
  return songs.map((s) => s.spotifyId).filter(Boolean);
}

async function getToken(id, secret) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

async function fetchTracks(ids, token) {
  // The bulk endpoint `GET /v1/tracks?ids=...` was REMOVED in Spotify's
  // February 2026 Dev Mode changes. We now hit `GET /v1/tracks/{id}`
  // once per track, which is still available.
  const out = {};
  for (const id of ids) {
    let res;
    try {
      res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'editorial-player/0.1' },
      });
    } catch (e) {
      console.warn(`[fetch-metadata] ${id} network error: ${e?.message || e}`);
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      // Client Credentials on a new (post Nov-2024) Spotify app can 403 here.
      // We log and continue — the runtime fallback in App.jsx will fill the
      // gap once a user logs in via PKCE.
      console.warn(`[fetch-metadata] ${id} failed: ${res.status} ${body}`);
      continue;
    }
    const t = await res.json().catch(() => null);
    if (!t || !t.id) continue;
    const art = (t.album?.images || []).slice().sort((a, b) => b.width - a.width)[0];
    out[t.id] = {
      title: t.name,
      artist: (t.artists || []).map((a) => a.name).join(', '),
      album: t.album?.name || '',
      art: art?.url || '',
      duration: Math.round((t.duration_ms || 0) / 1000),
      year: (t.album?.release_date || '').slice(0, 4),
    };
  }
  return out;
}

function placeholder(ids) {
  const out = {};
  for (const id of ids) {
    out[id] = {
      title: `Track ${id.slice(0, 6)}`,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      art: '',
      duration: 0,
      year: '',
      _placeholder: true,
    };
  }
  return out;
}

async function main() {
  const ids = await loadIds();
  if (ids.length === 0) {
    console.warn('[fetch-metadata] No spotifyId entries found in src/songs.js — writing empty file');
    writeFileSync(OUT, JSON.stringify({}, null, 2));
    return;
  }

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    console.warn(
      '[fetch-metadata] SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET not set — writing placeholders.\n' +
        '  Set them locally in .env or as GitHub Action secrets to fetch real metadata.'
    );
    writeFileSync(OUT, JSON.stringify(placeholder(ids), null, 2));
    return;
  }

  console.log(`[fetch-metadata] Fetching metadata for ${ids.length} track(s)...`);
  let map = {};
  try {
    const token = await getToken(id, secret);
    map = await fetchTracks(ids, token);
  } catch (err) {
    console.warn('[fetch-metadata] API call failed — writing placeholders so the build can proceed.');
    console.warn('[fetch-metadata]', err.message || err);
    console.warn(
      '[fetch-metadata] The app will fetch metadata at runtime once a user logs in via Spotify.'
    );
  }
  // Fill any unfetched IDs with placeholders so the runtime always sees an entry.
  const missing = ids.filter((x) => !map[x]);
  if (missing.length) {
    Object.assign(map, placeholder(missing));
    console.warn(`[fetch-metadata] ${missing.length} track(s) missing metadata — using placeholders.`);
  }
  writeFileSync(OUT, JSON.stringify(map, null, 2));
  console.log(`[fetch-metadata] Wrote ${OUT} (${Object.keys(map).length} entries)`);
}

main().catch((err) => {
  console.error('[fetch-metadata] FAILED:', err);
  // Don't fail the build — emit empty placeholders and exit 0.
  try {
    writeFileSync(OUT, JSON.stringify({}, null, 2));
  } catch {}
  process.exit(0);
});
