// ════════════════════════════════════════════════════════════
//  theme.js — design tokens (light/dark theme, fonts, icons, animations)
//  Fixed configuration matching the user's chosen tweaks:
//    theme: light · font: editorial · lyrics: classic · transition: slideUp
//    fontSize: 58px · artGlow: ON · showLyrics: ON
// ════════════════════════════════════════════════════════════

// ─── User's chosen settings (single source of truth) ───────────
export const SETTINGS = {
  theme: 'light',
  fontPair: 'editorial',
  lyricsStyle: 'classic',     // 'classic' (3-A) or 'vogue' (3-B) — 'classic' is fixed per user choice
  lyricsTransition: 'slideUp', // 'slideUp' | 'fade' | 'scaleFade' | 'blur' | 'wipe'
  lyricsFontSize: 58,
  artGlow: true,
  showLyrics: true,
};

// ─── Theme tokens (semantic colors that swap by mode) ──────────
export function getTheme(mode) {
  if (mode === 'dark') {
    return {
      isDark: true,
      bg: '#0a0907',
      surface: '#0e0c0a',
      bar: '#141210',
      border: 'rgba(255,255,255,0.06)',
      borderStrong: 'rgba(255,255,255,0.10)',
      text1: '#ffffff',
      text2: 'rgba(255,255,255,0.55)',
      text3: 'rgba(255,255,255,0.30)',
      text4: 'rgba(255,255,255,0.18)',
      cardBg: 'rgba(255,255,255,0.04)',
      cardBorder: 'rgba(255,255,255,0.06)',
      hoverBg: 'rgba(255,255,255,0.05)',
      navActive: 'rgba(255,255,255,0.14)',
      noiseOp: 0.25,
      macBg: '#141310',
    };
  }
  // Light: warm cream/paper feel that pairs with the editorial typography
  return {
    isDark: false,
    bg: '#f5f0e8',
    surface: '#ede8dd',
    bar: '#e8e2d5',
    border: 'rgba(30,20,10,0.09)',
    borderStrong: 'rgba(30,20,10,0.16)',
    text1: '#1a1410',
    text2: 'rgba(25,18,10,0.58)',
    text3: 'rgba(25,18,10,0.38)',
    text4: 'rgba(25,18,10,0.20)',
    cardBg: 'rgba(255,255,255,0.72)',
    cardBorder: 'rgba(30,20,10,0.07)',
    hoverBg: 'rgba(30,20,10,0.04)',
    navActive: 'rgba(30,20,10,0.10)',
    noiseOp: 0.18,
    macBg: '#e0dace',
  };
}

// ─── Font pairings ─────────────────────────────────────────────
export const FONT_PAIRS = {
  editorial: {
    heading: "'Playfair Display', Georgia, serif",
    body:    "'Inter', -apple-system, sans-serif",
  },
};

// ─── Lyric transition animation registry (matches keyframes in styles.css) ─
export const ANIMS = {
  slideUp:   'lyrFadeUp 0.42s cubic-bezier(0.4,0,0.2,1)',
  fade:      'lyrFade 0.5s ease',
  scaleFade: 'lyrScale 0.45s cubic-bezier(0.4,0,0.2,1)',
  blur:      'lyrBlur 0.5s ease',
  wipe:      'lyrWipe 0.4s cubic-bezier(0.4,0,0.2,1)',
};

// ─── Inline SVG icon paths ─────────────────────────────────────
export const ICONS = {
  home:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  library: 'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  plus:    'M12 5v14M5 12h14',
  heart:   'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  prev:    'M19 20L9 12l10-8v16zM5 4v16',
  next:    'M5 4l10 8-10 8V4zM19 4v16',
  play:    'M5 3l14 9-14 9V3z',
  pause:   'M6 4h4v16H6zM14 4h4v16h-4z',
  shuffle: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  repeat:  'M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3',
  vol:     'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07',
  mic:     'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8',
  queue:   'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  device:  'M2 3h20v14H2zM8 21h8M12 17v4',
  back:    'M15 18l-6-6 6-6',
  fwd:     'M9 18l6-6-6-6',
  arrowright: 'M5 12h14M12 5l7 7-7 7',
};

// ─── Helpers ───────────────────────────────────────────────────
export function fmt(s) {
  if (!isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

export function getLIdx(lyrics, t) {
  let i = 0;
  for (let j = 0; j < lyrics.length; j++) {
    if (t >= lyrics[j].t) i = j;
    else break;
  }
  return i;
}

// SVG noise data URI (paper texture overlay)
export const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`;
