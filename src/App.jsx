// ════════════════════════════════════════════════════════════
//  App.jsx — Editorial Spotify-style player (single-page).
//  Applies the user's chosen tweaks as fixed defaults:
//    light theme · editorial fonts · classic lyrics · slideUp · 58px
//    art glow ON · lyrics panel ON
//  Audio playback uses a real HTML5 <audio> element via useAudioPlayer.
// ════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { SONGS } from './songs.js';
import { useAudioPlayer } from './audio.js';
import {
  SETTINGS, getTheme, FONT_PAIRS, ANIMS, ICONS,
  fmt, getLIdx, NOISE_BG,
} from './theme.js';

// ─── Icon helper ───────────────────────────────────────────────
function Icon({ name, size = 16, color = 'currentColor', onClick, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         onClick={onClick}
         style={{ cursor: onClick ? 'pointer' : 'default', flexShrink: 0, ...style }}>
      <path d={ICONS[name] || ''} />
    </svg>
  );
}

// ─── Lyrics view: Classic (3-A) ────────────────────────────────
function LyricsClassic({ song, lyricIdx, C, F, fontSize, transition }) {
  const cur = song.lyrics[lyricIdx];
  const [animKey, setAnimKey] = useState(0);
  const prev = useRef(cur?.text);
  useEffect(() => {
    if (cur && cur.text !== prev.current) { prev.current = cur.text; setAnimKey(k => k + 1); }
  }, [cur?.text]);

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
      <div style={{ width: '38%', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.72) saturate(1.1)' }}
             onError={e => { e.target.parentElement.style.background = C.bg3; e.target.style.display = 'none'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 45%, rgba(14,13,11,0.97) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,13,11,0.6) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', top: 20, left: 18, fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: F.body }}>♪ NOW PLAYING</div>
        <div style={{ position: 'absolute', bottom: 20, left: 18 }}>
          <div style={{ fontSize: 10, color: C.light, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontFamily: F.body }}>{song.artist}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: F.body }}>{song.album}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px 36px 28px 28px', overflow: 'hidden' }}>
        <div style={{ fontSize: 9, color: C.light, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 18, fontFamily: F.body }}>
          {song.artist} — {song.album}
        </div>
        <div key={animKey} style={{ animation: ANIMS[transition] || ANIMS.slideUp, marginBottom: 20 }}>
          <div style={{ fontSize: Math.max(20, fontSize), fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.8px', fontFamily: F.heading, fontStyle: 'italic', textShadow: `0 0 40px ${C.light}33` }}>
            {cur?.text || ''}
          </div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(to right, ${C.accent}, transparent)`, width: '55%', marginBottom: 22, borderRadius: 1 }} />
        {[1, 2, 3].map(o => song.lyrics[lyricIdx + o] && (
          <div key={o} style={{
            fontSize: [15, 12, 10][o-1],
            color: `rgba(255,255,255,${[0.42, 0.24, 0.13][o-1]})`,
            fontWeight: [500, 400, 300][o-1],
            fontStyle: o === 3 ? 'italic' : 'normal',
            marginBottom: [12, 7, 5][o-1],
            lineHeight: 1.45,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: F.body,
          }}>
            {song.lyrics[lyricIdx + o].text}
          </div>
        ))}
        {song.lyrics[lyricIdx - 1] && (
          <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 10, color: 'rgba(255,255,255,0.16)', fontStyle: 'italic', fontFamily: F.body }}>
            {song.lyrics[lyricIdx - 1].text}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lyrics view: Vogue (3-B) — kept available even though Classic is the default ─
function LyricsVogue({ song, lyricIdx, C, F, fontSize, transition }) {
  const cur = song.lyrics[lyricIdx];
  const [animKey, setAnimKey] = useState(0);
  const prev = useRef(cur?.text);
  useEffect(() => {
    if (cur && cur.text !== prev.current) { prev.current = cur.text; setAnimKey(k => k + 1); }
  }, [cur?.text]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'row-reverse', overflow: 'hidden', minWidth: 0 }}>
      <div style={{ width: '48%', position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.68) saturate(1.25)' }}
             onError={e => { e.target.parentElement.style.background = C.bg3; e.target.style.display = 'none'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, transparent 35%, rgba(14,13,11,0.94) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,13,11,0.45) 0%, transparent 40%)' }} />
        <div style={{ position: 'absolute', bottom: 20, right: 16, textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F.body }}>{song.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, fontFamily: F.body }}>{song.album}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 9, color: C.light, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap', userSelect: 'none', fontFamily: F.body }}>
            {song.artist} · 가사
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 24px 24px 20px', overflow: 'hidden' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 22, fontWeight: 500, fontFamily: F.body }}>
            LYRICS / {String(lyricIdx + 1).padStart(2, '0')}
          </div>
          <div key={animKey} style={{ animation: ANIMS[transition] || ANIMS.slideUp, marginBottom: 18 }}>
            <div style={{ fontSize: Math.max(16, Math.round(fontSize * 0.9)), fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: '-1.2px', textTransform: 'uppercase', textShadow: `0 0 30px ${C.light}22`, fontFamily: F.body }}>
              {cur?.text || ''}
            </div>
          </div>
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 18, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '40%', background: C.accent, borderRadius: 1 }} />
          </div>
          {[1, 2].map(o => song.lyrics[lyricIdx + o] && (
            <div key={o} style={{
              fontSize: Math.max(13, Math.round([0.52, 0.38][o-1] * fontSize)),
              color: `rgba(255,255,255,${[0.42, 0.22][o-1]})`,
              letterSpacing: '0.02em', marginBottom: [12, 7][o-1],
              fontWeight: [500, 400][o-1],
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: F.body,
            }}>
              {song.lyrics[lyricIdx + o].text}
            </div>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.light, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: F.body }}>{song.artist}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: 'rgba(255,255,255,0.025)', letterSpacing: '-3px', lineHeight: 1, userSelect: 'none', fontFamily: F.heading, fontStyle: 'italic' }}>
              {String(lyricIdx + 1).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section header for Home ───────────────────────────────────
function SectionHeader({ label, sub, link, T, F }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text1, fontFamily: F.heading, fontStyle: 'italic', letterSpacing: '-0.3px' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: T.text3, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2, fontFamily: F.body }}>{sub}</div>}
      </div>
      {link && <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: F.body }}>{link} <Icon name="arrowright" size={10} color={T.text3} /></div>}
    </div>
  );
}

// ─── Card components for Home ──────────────────────────────────
function FeaturedCard({ song, onClick, T, F }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
         style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', aspectRatio: '16/9', transition: 'transform 0.25s', transform: hov ? 'scale(1.015)' : 'scale(1)' }}>
      <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${hov ? 0.65 : 0.55}) saturate(1.2)`, transition: 'filter 0.25s' }}
           onError={e => { e.target.parentElement.style.background = song.colors.bg3; e.target.style.display = 'none'; }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)' }} />
      <div style={{ position: 'absolute', top: 14, left: 14, fontSize: 9, color: song.colors.light, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'rgba(0,0,0,0.5)', padding: '3px 8px', borderRadius: 3, backdropFilter: 'blur(8px)', fontFamily: F.body }}>{song.tag}</div>
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: F.body }}>{song.artist}</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: F.heading, fontStyle: 'italic', letterSpacing: '-0.3px', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{song.title}</div>
      </div>
      {hov && (
        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${song.colors.light},${song.colors.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${song.colors.accent}88` }}>
          <Icon name="play" size={14} color="#fff" />
        </div>
      )}
    </div>
  );
}

function PickCard({ song, onClick, T, F }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
         style={{ background: T.cardBg, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s', transform: hov ? 'translateY(-2px)' : 'none', border: `1px solid ${T.cardBorder}` }}>
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
        <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${hov ? 0.85 : 0.78})`, transition: 'filter 0.2s' }}
             onError={e => { e.target.parentElement.style.background = song.colors.bg3; e.target.style.display = 'none'; }} />
        <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 8, color: song.colors.light, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 2, fontFamily: F.body }}>{song.tag}</div>
        {hov && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${song.colors.light},${song.colors.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" size={12} color="#fff" />
          </div>
        )}
      </div>
      <div style={{ padding: '12px 12px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text1, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: hov ? 'italic' : 'normal', fontFamily: hov ? F.heading : F.body, transition: 'font-style 0.15s' }}>{song.title}</div>
        <div style={{ fontSize: 10, color: T.text3, fontFamily: F.body }}>{song.artist}</div>
      </div>
    </div>
  );
}

function ListRow({ song, index, onClick, T, F }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
         style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: hov ? T.hoverBg : 'transparent', transition: 'background 0.15s', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 12, color: T.text4, fontWeight: 500, minWidth: 18, textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontFamily: F.body }}>
        {hov ? <Icon name="play" size={12} color={T.text2} /> : index}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
        <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             onError={e => { e.target.parentElement.style.background = song.colors.bg3; e.target.style.display = 'none'; }} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: hov ? 'italic' : 'normal', transition: 'font-style 0.15s', fontFamily: hov ? F.heading : F.body }}>{song.title}</div>
        <div style={{ fontSize: 11, color: T.text3, fontFamily: F.body }}>{song.artist}</div>
      </div>
      <div style={{ fontSize: 10, color: T.text4, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: F.body }}>{song.tag}</div>
      <div style={{ fontSize: 11, color: T.text3, fontVariantNumeric: 'tabular-nums', fontFamily: F.body }}>{fmt(song.duration)}</div>
    </div>
  );
}

// ─── Home view ─────────────────────────────────────────────────
function HomeView({ onPlay, T, F }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Pick songs for each section. With your own catalog, the first two are
  // featured, all are quick picks, the last 4 are recently played.
  const featured = SONGS.slice(0, 2);
  const picks = SONGS;
  const recent = [...SONGS].slice(-4);

  return (
    <div className="ns" style={{ flex: 1, overflowY: 'auto', padding: '32px 36px 24px', position: 'relative', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: T.noiseOp, backgroundImage: NOISE_BG, zIndex: 0 }} />

      <div style={{ marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8, fontFamily: F.body }}>
          Vol. 1 · {today}
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, color: T.text1, fontFamily: F.heading, fontStyle: 'italic', letterSpacing: '-1px', lineHeight: 1, marginBottom: 4 }}>
          {greeting}
        </div>
        <div style={{ height: 1, background: `linear-gradient(to right, ${T.borderStrong}, transparent)`, marginTop: 16 }} />
      </div>

      {featured.length > 0 && (
        <>
          <div style={{ marginBottom: 36, position: 'relative', zIndex: 1 }}>
            <SectionHeader label="Featured" sub="이번 주 추천" T={T} F={F} />
            <div style={{ display: 'grid', gridTemplateColumns: featured.length > 1 ? '1fr 1fr' : '1fr', gap: 16 }}>
              {featured.map(s => <FeaturedCard key={s.id} song={s} onClick={() => onPlay(s.id)} T={T} F={F} />)}
            </div>
          </div>
          <div style={{ height: 1, background: T.border, marginBottom: 32, position: 'relative', zIndex: 1 }} />
        </>
      )}

      <div style={{ marginBottom: 36, position: 'relative', zIndex: 1 }}>
        <SectionHeader label="Quick Picks" sub="바로 재생" link="SEE ALL" T={T} F={F} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {picks.map(s => <PickCard key={s.id} song={s} onClick={() => onPlay(s.id)} T={T} F={F} />)}
        </div>
      </div>

      <div style={{ height: 1, background: T.border, marginBottom: 32, position: 'relative', zIndex: 1 }} />

      <div style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
        <SectionHeader label="Recently Played" sub="최근 재생" T={T} F={F} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {recent.map((s, i) => <ListRow key={i} song={s} index={i + 1} onClick={() => onPlay(s.id)} T={T} F={F} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Album view ────────────────────────────────────────────────
function AlbumView({ song, onPlay, onBack, T, F }) {
  const C = song.colors;
  const [hovTrack, setHovTrack] = useState(null);
  const totalDur = song.tracks.reduce((a, t) => { const [m, s] = t.dur.split(':').map(Number); return a + m * 60 + s; }, 0);

  return (
    <div className="ns" style={{ flex: 1, overflowY: 'auto', position: 'relative', animation: 'fadeIn 0.45s ease' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <img src={song.art} alt="" style={{ width: '100%', height: '50%', objectFit: 'cover', filter: 'blur(60px) brightness(0.4) saturate(1.4)', transform: 'scale(1.1)' }}
             onError={e => e.target.style.display = 'none'} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55%', background: `linear-gradient(to bottom, ${C.bg1}99 0%, transparent 60%)` }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(to bottom, transparent 35%, ${T.bg} 65%)` }} />
      </div>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: T.noiseOp, zIndex: 1, backgroundImage: NOISE_BG }} />

      <div style={{ position: 'relative', zIndex: 2, padding: '28px 40px 40px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.isDark ? 'rgba(255,255,255,0.7)' : '#fff', fontSize: 12, fontWeight: 500, fontFamily: F.body, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: 0, transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <Icon name="back" size={14} color="currentColor" /> 뒤로
        </button>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', marginBottom: 36 }}>
          <div style={{ width: 220, height: 220, borderRadius: 12, overflow: 'hidden', flexShrink: 0, boxShadow: `0 24px 64px ${C.accent}55, 0 8px 24px rgba(0,0,0,0.7)` }}>
            <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 onError={e => { e.target.parentElement.style.background = C.bg3; e.target.style.display = 'none'; }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 10, color: '#fff', opacity: 0.7, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, fontFamily: F.body }}>Album · {song.year}</div>
            <div style={{ fontSize: Math.max(28, Math.min(52, Math.floor(600 / (song.album.length * 0.55 + 1)))), fontWeight: 900, color: '#fff', fontFamily: F.heading, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-1px', marginBottom: 14, textShadow: `0 0 60px ${C.light}33` }}>
              {song.album}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: F.body }}>{song.artist}</div>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: F.body }}>{song.genre}</div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontFamily: F.body }}>
              {song.tracks.length}곡 · {Math.floor(totalDur / 60)}분 {totalDur % 60}초
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => onPlay(song.id)} style={{ padding: '10px 28px', borderRadius: 24, border: 'none', cursor: 'pointer', fontFamily: F.body, fontWeight: 700, fontSize: 14, background: `linear-gradient(135deg,${C.light},${C.accent})`, color: '#fff', boxShadow: `0 4px 20px ${C.accent}55`, transition: 'transform 0.15s, box-shadow 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = `0 6px 28px ${C.accent}77`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 4px 20px ${C.accent}55`; }}>
                ▶ 전체 재생
              </button>
              <div style={{ fontSize: 9, color: C.light, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', border: `1px solid ${C.accent}99`, padding: '5px 12px', borderRadius: 3, fontFamily: F.body, background: 'rgba(0,0,0,0.25)' }}>{song.tag}</div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: T.border, marginBottom: 8, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 80, background: C.accent }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px', gap: 0, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{ fontSize: 10, color: T.text4, fontWeight: 700, letterSpacing: '0.12em', textAlign: 'center', fontFamily: F.body }}>#</div>
          <div style={{ fontSize: 10, color: T.text4, fontWeight: 700, letterSpacing: '0.12em', fontFamily: F.body }}>TITLE</div>
          <div style={{ fontSize: 10, color: T.text4, fontWeight: 700, letterSpacing: '0.12em', textAlign: 'right', fontFamily: F.body }}>TIME</div>
        </div>

        <div>
          {song.tracks.map((track, i) => {
            const hov = hovTrack === i;
            return (
              <div key={i} onClick={() => onPlay(song.id)}
                   onMouseEnter={() => setHovTrack(i)} onMouseLeave={() => setHovTrack(null)}
                   style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px', gap: 0, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: hov ? T.hoverBg : 'transparent', transition: 'background 0.15s', borderBottom: `1px solid ${T.border}`, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  {hov
                    ? <Icon name="play" size={13} color={C.accent} />
                    : <span style={{ fontSize: 13, color: T.text3, fontWeight: 500, fontVariantNumeric: 'tabular-nums', fontFamily: F.body }}>{track.n}</span>}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: hov ? 'italic' : 'normal', fontFamily: hov ? F.heading : F.body, transition: 'font-family 0.15s, font-style 0.15s' }}>{track.title}</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2, fontFamily: F.body }}>{song.artist}</div>
                </div>
                <div style={{ fontSize: 12, color: T.text3, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: F.body }}>{track.dur}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tiny shared button helpers ────────────────────────────────
function NB({ onClick, children, T }) {
  return (
    <button onClick={onClick} style={{ width: 26, height: 26, borderRadius: '50%', background: T.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = T.isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.10)'}
            onMouseLeave={e => e.currentTarget.style.background = T.isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}>
      {children}
    </button>
  );
}
function SBI({ icon, label, active, accent, onClick, T, F }) {
  const col = active ? T.text1 : accent ? T.isDark ? '#9d9dff' : '#7c3aed' : T.text2;
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', background: active ? T.navActive : 'transparent', transition: 'background 0.15s' }}
         onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
         onMouseLeave={e => e.currentTarget.style.background = active ? T.navActive : 'transparent'}>
      <Icon name={icon} size={17} color={col} />
      <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: col, whiteSpace: 'nowrap', fontFamily: F.body }}>{label}</span>
    </div>
  );
}
function PB({ active, onClick, children, T, F }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 13px', borderRadius: 18, border: active ? `1px solid ${T.borderStrong}` : '1px solid transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: F.body, transition: 'all 0.18s', background: active ? T.navActive : 'transparent', color: active ? T.text1 : T.text3, backdropFilter: active ? 'blur(16px)' : 'none' }}>
      {children}
    </button>
  );
}
function CB({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 6, transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {children}
    </button>
  );
}

// ─── Main App ──────────────────────────────────────────────────
export default function App() {
  // Restore last session (song index) from localStorage if present
  const [songIdx, setSongIdx] = useState(() => {
    const saved = parseInt(localStorage.getItem('lastSongIdx') || '0', 10);
    return saved >= 0 && saved < SONGS.length ? saved : 0;
  });
  const [view, setView] = useState('home');             // 'home' | 'player' | 'album'
  const [albumIdx, setAlbumIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // SETTINGS comes pre-filled from theme.js with the user's chosen tweaks
  const T = getTheme(SETTINGS.theme);
  const F = FONT_PAIRS[SETTINGS.fontPair] || FONT_PAIRS.editorial;

  const song = SONGS[songIdx];
  const C = song.colors;

  // Real audio playback hook
  const audio = useAudioPlayer({
    song,
    onEnded: () => {
      if (repeat) audio.seek(0);
      else nextSong();
    },
  });

  const time = audio.time;
  const duration = audio.duration || song.duration || 1;
  const lyricIdx = getLIdx(song.lyrics, time);
  const progress = Math.min(1, time / duration);

  // Persist last song
  useEffect(() => { localStorage.setItem('lastSongIdx', String(songIdx)); }, [songIdx]);
  // Reset like state when track changes
  useEffect(() => { setLiked(false); }, [songIdx]);

  // Keyboard shortcuts: Space=toggle, ArrowLeft/Right=prev/next, ArrowUp/Down=volume
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); audio.toggle(); }
      else if (e.code === 'ArrowRight' && e.shiftKey) nextSong();
      else if (e.code === 'ArrowLeft' && e.shiftKey) prevSong();
      else if (e.code === 'ArrowRight') audio.seek(time + 5);
      else if (e.code === 'ArrowLeft') audio.seek(Math.max(0, time - 5));
      else if (e.code === 'ArrowUp') audio.setVolume(audio.volume + 5);
      else if (e.code === 'ArrowDown') audio.setVolume(audio.volume - 5);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.toggle, time, audio.volume]);

  // Pickers / controls
  const scrub = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    audio.seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration);
  };
  const volScrub = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    audio.setVolume(Math.round(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 100));
  };
  const nextSong = () => { setSongIdx(i => (i + 1) % SONGS.length); };
  const prevSong = () => { setSongIdx(i => (i - 1 + SONGS.length) % SONGS.length); };
  const playSong = (id) => {
    setSongIdx(id);
    setView('player');
    // Audio element load happens via useEffect on song change; play after
    setTimeout(() => audio.play(), 100);
  };

  // Player view background: dynamic gradient from album palette (always vivid, regardless of theme)
  const playerBg = `radial-gradient(ellipse 80% 60% at 25% 0%, ${C.bg3}dd 0%, transparent 58%), radial-gradient(ellipse 55% 70% at 85% 100%, ${C.accent}33 0%, transparent 55%), radial-gradient(ellipse 100% 100% at 50% 50%, ${C.bg2} 0%, ${C.bg1} 100%)`;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, overflow: 'hidden', fontFamily: F.body }}>
      {/* macOS title bar */}
      <div style={{ height: 40, background: T.macBg, display: 'flex', alignItems: 'center', paddingLeft: 16, gap: 10, flexShrink: 0, borderBottom: `1px solid ${T.border}`, userSelect: 'none' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          {['#ff5f56', '#ffbd2e', '#27c93f'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, boxShadow: '0 0 0 0.5px rgba(0,0,0,0.3)' }} />)}
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          <NB onClick={prevSong} T={T}><Icon name="back" size={14} color={T.text2} /></NB>
          <NB onClick={nextSong} T={T}><Icon name="fwd" size={14} color={T.text2} /></NB>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: T.text3, fontWeight: 500, letterSpacing: '0.05em' }}>Editorial Player</span>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
          <span style={{ fontSize: 10, color: T.text3, fontWeight: 700 }}>♪</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: T.surface, display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: `1px solid ${T.border}` }}>
          <div style={{ padding: '20px 16px 14px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text1, fontFamily: F.heading, fontStyle: 'italic', letterSpacing: '-0.3px' }}>Editorial</div>
            <div style={{ fontSize: 9, color: T.text3, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>Personal — Library</div>
          </div>
          <div style={{ padding: '12px 10px 6px' }}>
            <SBI icon="home" label="Home" active={view === 'home'} onClick={() => setView('home')} T={T} F={F} />
            <SBI icon="search" label="Search" T={T} F={F} />
            <SBI icon="library" label="Your Library" T={T} F={F} />
          </div>
          <div style={{ height: 1, background: T.border, margin: '6px 14px' }} />
          <div style={{ padding: '6px 10px' }}>
            <SBI icon="plus" label="Create Playlist" accent T={T} F={F} />
            <SBI icon="heart" label="Liked Songs" accent T={T} F={F} />
            <SBI icon="star" label="Made For You" accent T={T} F={F} />
          </div>
          <div style={{ height: 1, background: T.border, margin: '6px 14px' }} />
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 12px' }} className="ns">
            <div style={{ fontSize: 9, color: T.text4, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 12px 8px' }}>Library</div>
            {SONGS.map(s => (
              <div key={s.id} onClick={() => playSong(s.id)} style={{ fontSize: 12, color: T.text3, padding: '7px 12px', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s, background 0.15s' }}
                   onMouseEnter={e => { e.currentTarget.style.color = T.text1; e.currentTarget.style.background = T.hoverBg; e.currentTarget.style.fontStyle = 'italic'; }}
                   onMouseLeave={e => { e.currentTarget.style.color = T.text3; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.fontStyle = 'normal'; }}>
                {s.short || s.title}
              </div>
            ))}
          </div>
          {view === 'home' && (
            <div onClick={() => setView('player')} style={{ padding: '12px 14px', borderTop: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
                 onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
                 onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 36, height: 36, borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
                <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                     onError={e => { e.target.parentElement.style.background = C.bg3; e.target.style.display = 'none'; }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                <div style={{ fontSize: 10, color: T.text3 }}>{song.artist}</div>
              </div>
              <div style={{ fontSize: 9, color: C.accent }}>{audio.playing ? '❚❚' : '▶'}</div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: view === 'player' ? playerBg : T.bg, transition: 'background 1.8s ease' }}>
          {view === 'player' && (
            <>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', background: C.accent + '1a', filter: 'blur(90px)', top: '-15%', left: '-5%', transition: 'background 1.8s' }} />
                <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: C.light + '12', filter: 'blur(70px)', bottom: '-5%', right: '5%', transition: 'background 1.8s' }} />
              </div>
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.28, backgroundImage: NOISE_BG }} />
            </>
          )}

          {/* Top nav */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 8px', flexShrink: 0, borderBottom: view === 'home' || view === 'album' ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PB active={view === 'home'} onClick={() => setView('home')} T={view === 'player' ? getTheme('dark') : T} F={F}>홈</PB>
              <PB active={view === 'player'} onClick={() => setView('player')} T={view === 'player' ? getTheme('dark') : T} F={F}>재생화면</PB>
            </div>
            {view === 'player' && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', maxWidth: '60%', justifyContent: 'flex-end' }}>
                {SONGS.map((s, i) => (
                  <button key={s.id} onClick={() => { setSongIdx(i); setTimeout(() => audio.play(), 100); }}
                          style={{ padding: '4px 10px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: F.body, transition: 'all 0.22s', background: i === songIdx ? s.colors.accent : 'rgba(255,255,255,0.07)', color: i === songIdx ? '#fff' : 'rgba(255,255,255,0.5)', boxShadow: i === songIdx ? `0 0 10px ${s.colors.accent}44` : 'none' }}>
                    {s.short}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Routed content */}
          <div style={{ flex: 1, position: 'relative', zIndex: 5, overflow: 'hidden', display: 'flex' }}>
            {view === 'home'
              ? <HomeView onPlay={playSong} T={T} F={F} />
              : view === 'album'
                ? <AlbumView song={SONGS[albumIdx]} onPlay={playSong} onBack={() => setView('home')} T={T} F={F} />
                : SETTINGS.showLyrics
                  ? (SETTINGS.lyricsStyle === 'classic'
                      ? <LyricsClassic song={song} lyricIdx={lyricIdx} C={C} F={F} fontSize={SETTINGS.lyricsFontSize} transition={SETTINGS.lyricsTransition} key={`classic-${songIdx}`} />
                      : <LyricsVogue   song={song} lyricIdx={lyricIdx} C={C} F={F} fontSize={SETTINGS.lyricsFontSize} transition={SETTINGS.lyricsTransition} key={`vogue-${songIdx}`} />)
                  : (
                    // Lyrics off — show just centered art (with glow if enabled)
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, paddingBottom: 16 }}>
                      <div style={{ width: 280, height: 280, borderRadius: 16, overflow: 'hidden', boxShadow: SETTINGS.artGlow ? `0 30px 80px ${C.accent}55, 0 8px 24px rgba(0,0,0,0.7)` : '0 8px 24px rgba(0,0,0,0.5)' }}>
                        <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: audio.playing ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.8s' }}
                             onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = C.bg3; }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: F.heading, fontStyle: 'italic' }}>{song.title}</div>
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{song.artist}</div>
                      </div>
                    </div>
                  )}
          </div>
        </div>
      </div>

      {/* Bottom playback bar */}
      <div style={{ height: 86, background: T.bar, borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px', flexShrink: 0, zIndex: 20 }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: T.text3, minWidth: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(time)}</span>
          <div onClick={scrub} style={{ flex: 1, height: 3, background: T.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress * 100}%`, background: `linear-gradient(90deg,${C.light}cc,${C.accent}cc)`, borderRadius: 2, transition: 'width 0.15s linear', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '50%', left: `${progress * 100}%`, transform: 'translate(-50%,-50%)', width: 10, height: 10, borderRadius: '50%', background: T.isDark ? '#fff' : T.text1, transition: 'left 0.15s linear', pointerEvents: 'none' }} />
          </div>
          <span style={{ fontSize: 11, color: T.text3, minWidth: 34, fontVariantNumeric: 'tabular-nums' }}>{fmt(duration)}</span>
        </div>
        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
            <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
              <img src={song.art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                   onError={e => { e.target.parentElement.style.background = C.bg3; e.target.style.display = 'none'; }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{song.title}</div>
              <div style={{ fontSize: 11, color: T.text2 }}>{song.artist}</div>
            </div>
            <button onClick={() => setLiked(l => !l)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.2s', transform: liked ? 'scale(1.2)' : 'scale(1)' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill={liked ? C.accent : 'none'} stroke={liked ? C.accent : T.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <CB onClick={() => setShuffle(s => !s)} title="Shuffle"><Icon name="shuffle" size={17} color={shuffle ? C.accent : T.text3} /></CB>
            <CB onClick={prevSong} title="Previous"><Icon name="prev" size={20} color={T.text2} /></CB>
            <button onClick={audio.toggle} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${C.light},${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 14px ${C.accent}44`, transition: 'transform 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Icon name={audio.playing ? 'pause' : 'play'} size={18} color="#fff" />
            </button>
            <CB onClick={nextSong} title="Next"><Icon name="next" size={20} color={T.text2} /></CB>
            <CB onClick={() => setRepeat(r => !r)} title="Repeat"><Icon name="repeat" size={17} color={repeat ? C.accent : T.text3} /></CB>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220, justifyContent: 'flex-end' }}>
            <CB onClick={() => setView('player')} title="Lyrics"><Icon name="mic" size={15} color={view === 'player' ? C.accent : T.text3} /></CB>
            <CB title="Queue"><Icon name="queue" size={15} color={T.text3} /></CB>
            <CB title="Devices"><Icon name="device" size={15} color={T.text3} /></CB>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CB onClick={audio.toggleMute}><Icon name="vol" size={15} color={audio.muted ? C.accent : T.text3} /></CB>
              <div onClick={volScrub} style={{ width: 72, height: 3, background: T.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${audio.muted ? 0 : audio.volume}%`, background: T.text2, borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: '50%', left: `${audio.muted ? 0 : audio.volume}%`, transform: 'translate(-50%,-50%)', width: 9, height: 9, borderRadius: '50%', background: T.text1 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
