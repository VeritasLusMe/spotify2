// ════════════════════════════════════════════════════════════
//  songs.js — 이 파일만 수정하면 플레이어에 곡이 추가됩니다.
//  This is the only file you need to edit to add your music.
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
// 오디오 파일은 public/audio/ 폴더에, 앨범아트는 public/art/ 폴더에 넣으세요.
// 그러면 audio: '/audio/파일명.mp3', art: '/art/파일명.jpg' 처럼 참조됩니다.
//
// lyrics 배열은 { t: 초, text: '가사' } 객체의 리스트입니다.
// t 값은 곡 시작 후 해당 줄이 떠야 할 시각(초 단위, 소수 가능: 0.5, 12.3 등).
// 줄 사이 간격은 자유 — 시작에 { t:0, text:'♪' } 한 줄을 두면 인트로가 깔끔합니다.

export const SONGS = [
  {
    id: 0,
    title: 'Sample Track One',
    short: 'Sample 1',           // 우측 상단 곡 전환 알약 버튼에 표시 (짧게)
    artist: 'Your Artist',
    album: 'Your Album Name',
    duration: 180,                // 예비값(초). 오디오 메타데이터로 자동 갱신됨
    tag: 'MY FAVORITE',           // 에디토리얼 라벨 (대문자 권장)
    year: '2024',
    genre: 'Pop / Indie',
    art: '/art/sample1.jpg',      // public/art/sample1.jpg 에 파일을 두세요
    audio: '/audio/sample1.mp3',  // public/audio/sample1.mp3 에 파일을 두세요
    colors: PALETTES.amber,
    tracks: [
      { n: 1, title: 'Sample Track One', dur: '3:00' },
      { n: 2, title: 'Track Two',        dur: '3:24' },
      { n: 3, title: 'Track Three',      dur: '4:12' },
    ],
    lyrics: [
      { t: 0,  text: '♪' },
      { t: 8,  text: '여기에 가사 첫 줄을 적어주세요' },
      { t: 14, text: '두 번째 줄, 시간 t는 초 단위입니다' },
      { t: 22, text: '직접 들으면서 t값을 미세조정하면 됩니다' },
      { t: 30, text: '소수점도 가능합니다 (예: 30.5)' },
    ],
  },
  {
    id: 1,
    title: 'Sample Track Two',
    short: 'Sample 2',
    artist: 'Another Artist',
    album: 'Another Album',
    duration: 200,
    tag: 'RECENT FIND',
    year: '2024',
    genre: 'Electronic',
    art: '/art/sample2.jpg',
    audio: '/audio/sample2.mp3',
    colors: PALETTES.teal,
    tracks: [
      { n: 1, title: 'Sample Track Two', dur: '3:20' },
    ],
    lyrics: [
      { t: 0,  text: '♪' },
      { t: 10, text: 'Sample lyrics line 1' },
      { t: 18, text: 'Sample lyrics line 2' },
    ],
  },
  {
    id: 2,
    title: 'Sample Track Three',
    short: 'Sample 3',
    artist: 'Third Artist',
    album: 'Third Album',
    duration: 220,
    tag: 'EVERGREEN',
    year: '2023',
    genre: 'Jazz / Lo-fi',
    art: '/art/sample3.jpg',
    audio: '/audio/sample3.mp3',
    colors: PALETTES.rose,
    tracks: [
      { n: 1, title: 'Sample Track Three', dur: '3:40' },
    ],
    lyrics: [
      { t: 0, text: '♪' },
      { t: 6, text: 'Add your own lyrics here' },
    ],
  },
];
