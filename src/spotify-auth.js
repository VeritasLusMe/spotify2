// ════════════════════════════════════════════════════════════
//  spotify-auth.js — Spotify OAuth (PKCE) flow.
//
//  Static-site safe: uses Authorization Code with PKCE so the
//  client_secret never touches the browser. Tokens are cached in
//  localStorage and auto-refreshed.
// ════════════════════════════════════════════════════════════

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI ||
  (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

const LS = {
  access: 'spotify_access_token',
  refresh: 'spotify_refresh_token',
  expires: 'spotify_expires_at',
  verifier: 'spotify_code_verifier',
};

function base64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function randomString(len = 64) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return base64url(bytes).slice(0, len);
}

async function sha256(input) {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return base64url(new Uint8Array(hash));
}

export function isConfigured() {
  return !!CLIENT_ID;
}

export async function beginLogin() {
  if (!CLIENT_ID) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID is not set');
  }
  const verifier = randomString(96);
  const challenge = await sha256(verifier);
  localStorage.setItem(LS.verifier, verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeToken(body) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Spotify token error ${res.status}: ${text}`);
  }
  return res.json();
}

function persist(tok) {
  localStorage.setItem(LS.access, tok.access_token);
  if (tok.refresh_token) localStorage.setItem(LS.refresh, tok.refresh_token);
  const expiresAt = Date.now() + (tok.expires_in - 30) * 1000;
  localStorage.setItem(LS.expires, String(expiresAt));
}

// Call once on app boot. If URL has ?code=, complete the exchange and clean URL.
export async function handleCallback() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) return false;

  const verifier = localStorage.getItem(LS.verifier);
  if (!verifier) {
    cleanUrl();
    return false;
  }

  try {
    const tok = await exchangeToken({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    });
    persist(tok);
    localStorage.removeItem(LS.verifier);
    cleanUrl();
    return true;
  } catch (e) {
    console.error('[spotify-auth] callback failed', e);
    cleanUrl();
    return false;
  }
}

function cleanUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
}

async function refresh() {
  const refreshToken = localStorage.getItem(LS.refresh);
  if (!refreshToken || !CLIENT_ID) return null;
  try {
    const tok = await exchangeToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    });
    persist(tok);
    return tok.access_token;
  } catch (e) {
    console.error('[spotify-auth] refresh failed', e);
    logout();
    return null;
  }
}

export async function getAccessToken() {
  const token = localStorage.getItem(LS.access);
  const expiresAt = parseInt(localStorage.getItem(LS.expires) || '0', 10);
  if (token && Date.now() < expiresAt) return token;
  return refresh();
}

export function isLoggedIn() {
  return !!localStorage.getItem(LS.access) || !!localStorage.getItem(LS.refresh);
}

export function logout() {
  localStorage.removeItem(LS.access);
  localStorage.removeItem(LS.refresh);
  localStorage.removeItem(LS.expires);
  localStorage.removeItem(LS.verifier);
}
