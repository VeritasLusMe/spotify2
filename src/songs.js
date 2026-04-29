// ════════════════════════════════════════════════════════════
//  songs.js — 본인의 Spotify 곡 목록.
//  This is the only file you need to edit to curate your tracks.
//
//  사용법: 각 항목에 spotifyId(트랙 ID)와 가사·컬러만 적으면 됩니다.
//  나머지(제목·아티스트·앨범·앨범아트·길이·연도)는 빌드 시
//  `node scripts/fetch-metadata.mjs`가 Spotify에서 자동으로 채웁니다.
//
//  spotifyId 찾는 법:
//    Spotify 앱 → 곡 우클릭 → 공유 → "Copy Song Link"
//    링크 https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=...
//    여기서 트랙 ID는 4uLU6hMCjMI75M1A2tKUQC 입니다.
// ════════════════════════════════════════════════════════════

// ─── 컬러 프리셋 (Palettes) ──────────────────────────────────
// 곡마다 5단계 색상이 필요합니다. 직접 헥사코드를 고를 필요 없이
// 아래 프리셋 중 하나를 사용하거나 자유롭게 새로 만드세요.
//   bg1  : 가장 어두운 베이스 (배경 그라디언트 끝)
//   bg2  : 중간 어두운 톤 (배경 그라디언트 중심)
//   bg3  : 미디엄 (큰 그라디언트 오브)
//   accent: 메인 액센트 (재생버튼/프로그레스바/라벨)
//   light: 밝은 액센트 (가사/하이라이트 텍스트)
export const PALETTES = {
  red:    { bg1:'#0d0000', bg2:'#2a0000', bg3:'#5a0000', accent:'#cc2200', light:'#ff5533' },
  blue:   { bg1:'#000814', bg2:'#001233', bg3:'#023e8a', accent:'#0077b6', light:'#48cae4' },
  amber:  { bg1:'#0f0a00', bg2:'#2a1e00', bg3:'#5a3e00', accent:'#b87800', light:'#ffcc44' },
  green:  { bg1:'#060f00', bg2:'#112200', bg3:'#2a5000', accent:'#5a9e00', light:'#8ace00' },
  purple: { bg1:'#0a0014', bg2:'#1a0033', bg3:'#3d0066', accent:'#7c3aed', light:'#a78bfa' },
  rose:   { bg1:'#1a0010', bg2:'#330020', bg3:'#660040', accent:'#e11d8a', light:'#f9a8d4' },
  teal:   { bg1:'#001a14', bg2:'#003328', bg3:'#005c50', accent:'#10b981', light:'#5eead4' },
  slate:  { bg1:'#08090a', bg2:'#1a1d20', bg3:'#3a3f44', accent:'#6b7280', light:'#cbd5e1' },
  indigo: { bg1:'#0a0a1a', bg2:'#171833', bg3:'#2e3066', accent:'#4f46e5', light:'#a5b4fc' },
  warm:   { bg1:'#150a05', bg2:'#2e160c', bg3:'#5c2e1c', accent:'#e85d04', light:'#fb923c' },
};

// ─── 노래 등록 (Your Songs) ───────────────────────────────────
// 각 곡 객체 필드:
//   spotifyId  (필수) Spotify 트랙 ID
//   short      (필수) 우측 상단 알약 버튼에 표시할 짧은 이름
//   tag        (선택) 에디토리얼 라벨 (대문자 권장, 예: 'MY FAVORITE')
//   genre      (선택) 장르 표기 — Spotify는 트랙 장르를 제공하지 않아 직접 입력
//   colors     (필수) PALETTES 중 하나 또는 직접 정의한 5단계 컬러
//   lyrics     (필수) [{ t: 초, text: '가사' }, ...]
//
//   title/artist/album/art/duration/year 는 빌드 스크립트가 자동으로 채웁니다.
//   직접 값을 넣으면 그 값이 우선 사용됩니다.

export const SONGS = [
  {
    spotifyId: '4uLU6hMCjMI75M1A2tKUQC',  // Rick Astley — Never Gonna Give You Up (예시)
    short: 'Never Gonna',
    tag: 'CLASSIC',
    genre: 'Pop',
    colors: PALETTES.amber,
    lyrics: [
      { t: 0,  text: '♪' },
      { t: 19, text: 'We\'re no strangers to love' },
      { t: 23, text: 'You know the rules and so do I' },
      { t: 28, text: 'A full commitment\'s what I\'m thinking of' },
      { t: 33, text: 'You wouldn\'t get this from any other guy' },
      { t: 42, text: 'Never gonna give you up' },
      { t: 45, text: 'Never gonna let you down' },
    ],
  },
  {
    spotifyId: '7tFiyTwD0nx5a1eklYtX2J',  // Queen — Bohemian Rhapsody (예시)
    short: 'Bohemian',
    tag: 'EVERGREEN',
    genre: 'Rock',
    colors: PALETTES.purple,
    lyrics: [
      { t: 0,  text: '♪' },
      { t: 14, text: 'Is this the real life?' },
      { t: 18, text: 'Is this just fantasy?' },
      { t: 23, text: 'Caught in a landslide' },
      { t: 27, text: 'No escape from reality' },
    ],
  },
  {
    spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',  // The Weeknd — Blinding Lights (예시)
    short: 'Blinding',
    tag: 'RECENT',
    genre: 'Synthwave',
    colors: PALETTES.rose,
    lyrics: [
      { t: 0,  text: '♪' },
      { t: 13, text: 'I said, ooh, I\'m blinded by the lights' },
      { t: 18, text: 'No, I can\'t sleep until I feel your touch' },
    ],
  },
  {
    spotifyId: '0FKR7mQJnYqdEmHAMhgQjw',  // NMIXX — Blue Valentine (2025)
    short: 'Blue Valentine',
    tag: 'MELANCHOLIA',
    genre: 'K-Pop',
    colors: PALETTES.blueValentine,
    // 타임스탬프는 3:06 트랙 구조 기준 추정치 — 실제 들으면서 ±2~5초 조정 권장
    lyrics: [
      { t: 0,   text: '♪' },
      { t: 5,   text: 'You\'ll always be my blue valentine' },
      { t: 9,   text: 'You\'ll always be my blue valentine' },
      { t: 14,  text: '식어버린 너의 색은 blue' },
      { t: 18,  text: '파랗게 멍이 든 my heart' },
      { t: 22,  text: '몇 번이고 덧이 나 열이 나 lovesick' },
      { t: 27,  text: '이건 such a bad love' },
      { t: 31,  text: 'We fight, we sigh, and stop' },
      { t: 35,  text: '붉게 타오르다 한순간에 식어가' },
      { t: 39,  text: 'Rewind, rewind, rewind' },
      { t: 43,  text: '언제 그랬냐는 듯이 또 서롤 찾아' },
      { t: 48,  text: '깊게 새긴 상처 비친 red blood' },
      { t: 52,  text: '부서진 forever I can see it now' },
      { t: 56,  text: 'Can you see it now?' },
      { t: 60,  text: '우린 마치 broken glass on the ground' },
      { t: 64,  text: '돌이킬 수 없다 해도 We can figure it out' },
      { t: 68,  text: 'If this love is over' },
      { t: 72,  text: '다시 뛰어들어 난' },
      { t: 76,  text: '이 사랑은 colder' },
      { t: 80,  text: 'I\'ll keep the fire lit in mine' },
      { t: 84,  text: 'You\'ll always be my blue valentine' },
      { t: 88,  text: 'You\'ll always be my blue valentine' },
      { t: 92,  text: '식어도 타오르는 얼음 속 불꽃' },
      { t: 96,  text: '아무 겁도 없이 뻗어버린 손' },
      { t: 100, text: 'Hot and icy, but I like it' },
      { t: 104, text: 'It\'s so you' },
      { t: 108, text: '바뀌어 맘의 weather 몰려온 cloud' },
      { t: 112, text: '외로운 together I can feel it now' },
      { t: 116, text: 'Can you feel it now?' },
      { t: 120, text: 'Rollercoaster처럼 우린 정신없이 흔들려도' },
      { t: 124, text: '돌아갈 걸 알아 So it doesn\'t matter' },
      { t: 128, text: 'You might be my end game' },
      { t: 132, text: '대가로 얻은 worst pain' },
      { t: 136, text: 'If this love is over' },
      { t: 140, text: '다시 뛰어들어 난' },
      { t: 144, text: '이 사랑은 colder' },
      { t: 148, text: 'I\'ll keep the fire lit in mine' },
      { t: 152, text: 'You\'ll always be my blue valentine' },
      { t: 156, text: 'You\'ll always be my blue valentine' },
      { t: 160, text: '붉고 푸른 사랑이란 bruise' },
      { t: 164, text: '낫지는 않길 Cause it\'s you' },
      { t: 168, text: 'If this love is over' },
      { t: 171, text: '다시 뛰어들어 난' },
      { t: 174, text: '이 사랑은 colder' },
      { t: 177, text: 'I\'ll keep the fire lit in mine' },
      { t: 180, text: 'You\'ll always be my blue valentine' },
      { t: 184, text: 'Blue valentine' },
    ],
  },
];
