# Editorial Player

매거진 풍의 스타일로 재해석된 개인용 음악 플레이어. **본인이 직접 등록한 곡과 가사**만 재생되도록 만들어졌으며, Spotify API 같은 외부 의존성이 없습니다.

적용된 디자인 설정:

- **Theme**: Light (따뜻한 크림/페이퍼 톤)
- **Font Pair**: Editorial (Playfair Display + Inter)
- **Lyrics Style**: Classic (좌측 아트 + 우측 가사)
- **Lyrics Transition**: Slide Up
- **Lyrics Font Size**: 58px
- **Art Glow**: ON
- **Lyrics Panel**: ON

---

## 1. 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build
npm run preview
```

`npm run dev` 후 브라우저에서 자동으로 열립니다.

---

## 2. 내 곡 추가하기

세 단계입니다.

### A. 오디오와 앨범아트 파일을 넣기

```
public/
  audio/    ← .mp3, .m4a, .ogg, .wav 등 오디오 파일
  art/      ← 앨범아트 이미지 (jpg, png, webp)
```

예: `public/audio/my-song.mp3`, `public/art/my-album.jpg`

### B. `src/songs.js` 편집

파일 상단의 `PALETTES` 중 마음에 드는 컬러 프리셋을 고르고, `SONGS` 배열에 객체 하나 추가:

```js
{
  id: 3,                          // 다른 곡과 겹치지 않게
  title: '내 곡 제목',
  short: '내곡',                   // 우측 상단 알약 버튼에 짧게 표시
  artist: '아티스트명',
  album: '앨범명',
  duration: 195,                  // 예비값 (초). 오디오가 로드되면 자동 갱신됨
  tag: 'MY PICK',                 // 에디토리얼 라벨 (대문자 권장)
  year: '2024',
  genre: 'Lo-fi / Bedroom Pop',
  art:   '/art/my-album.jpg',
  audio: '/audio/my-song.mp3',
  colors: PALETTES.indigo,        // 또는 PALETTES.amber, .rose, .teal 등
  tracks: [
    { n: 1, title: '내 곡 제목', dur: '3:15' },
  ],
  lyrics: [
    { t: 0,  text: '♪' },
    { t: 8,  text: '첫 줄 가사' },
    { t: 14, text: '두 번째 줄' },
    // ...
  ],
}
```

### C. 가사 타임스탬프 맞추기

`lyrics` 배열의 `t` 값은 **곡 시작 후 해당 줄이 화면에 떠야 할 시점(초 단위)** 입니다. 소수도 됩니다 (`14.5`).

가장 쉬운 방법:

1. 곡을 한 번 플레이하면서 진행바 옆 시간 표시(`0:14`)를 보세요
2. 그 시점의 초 값을 `t`에 넣으면 됩니다
3. dev 서버는 핫 리로드되므로 저장하면 즉시 반영됩니다

미세 조정 팁: 가사가 살짝 늦게 떠야 자연스럽다면 `t`를 0.3~0.5초 정도 빼세요. 노래방처럼 발화 직전에 미리 뜨게 됩니다.

---

## 3. 키보드 단축키

| 키 | 동작 |
|---|---|
| `Space` | 재생 / 일시정지 |
| `←` / `→` | 5초 뒤로 / 앞으로 |
| `Shift + ←` / `Shift + →` | 이전 곡 / 다음 곡 |
| `↑` / `↓` | 볼륨 ±5 |

---

## 4. 디자인 조정

설정은 `src/theme.js`의 `SETTINGS` 객체에 모여있습니다:

```js
export const SETTINGS = {
  theme: 'light',           // 'light' | 'dark'
  fontPair: 'editorial',    // 현재는 editorial 1종
  lyricsStyle: 'classic',   // 'classic' (3-A) | 'vogue' (3-B)
  lyricsTransition: 'slideUp', // 'slideUp' | 'fade' | 'scaleFade' | 'blur' | 'wipe'
  lyricsFontSize: 58,
  artGlow: true,
  showLyrics: true,
};
```

`vogue` 스타일도 그대로 살아있어서 한 줄만 바꾸면 잡지 표지 같은 가사 화면으로 전환됩니다.

색상 팔레트는 `src/songs.js`의 `PALETTES` 상수에서 추가/수정. 곡마다 5단계 컬러 (`bg1` 가장 어두움 → `light` 가장 밝음)로 배경 그라디언트와 액센트가 자동 생성됩니다.

---

## 5. 알아둘 점

- **자동 재생**: 브라우저 정책상 첫 진입 시 자동 재생이 차단될 수 있습니다. 한 번이라도 사용자가 클릭하면 그 다음부터는 자유롭게 재생됩니다.
- **오디오 메타데이터**: 곡의 정확한 길이는 오디오 파일이 로드되면 자동으로 가져옵니다. `duration` 필드는 로드 전 표시용 예비값일 뿐입니다.
- **localStorage**: 마지막으로 듣던 곡의 인덱스를 저장해서 다음 방문 시 복원합니다. 시간 위치는 저장되지 않습니다 — 원하면 쉽게 추가할 수 있습니다.
- **첫 클릭 후 재생**: 알약 버튼이나 카드를 클릭하면 자동으로 해당 곡이 재생화면으로 전환되며 재생됩니다.

---

## 6. 프로젝트 구조

```
spotify-editorial-player/
├── package.json
├── vite.config.js
├── index.html               # Google Fonts 로드 + #root
├── public/
│   ├── audio/               # ← 오디오 파일 위치
│   └── art/                 # ← 앨범아트 위치
└── src/
    ├── main.jsx             # ReactDOM 엔트리
    ├── App.jsx              # 모든 뷰 (Home, Player, Album) + 컨트롤
    ├── audio.js             # useAudioPlayer 훅 (HTML5 audio)
    ├── theme.js             # 테마/폰트/아이콘/애니메이션 토큰
    ├── songs.js             # ★ 본인 음악 등록 (이 파일만 자주 만질 곳)
    └── styles.css           # 전역 + 가사 키프레임
```

---

## 7. 다음에 추가할 만한 기능

Claude Code에 "이거 추가해줘" 식으로 의뢰하기 좋은 기능들:

- 검색 (`Search` 사이드바): 곡 제목/아티스트/가사 텍스트 검색
- 큐 (Queue) 패널: 다음 재생 목록 미리보기
- 셔플/리피트의 실제 동작 (지금은 시각 토글만)
- 시간 위치까지 localStorage에 저장해서 끊긴 지점부터 이어 재생
- 가사가 없는 구간은 화면을 크로스페이드시켜 정적 카드로 전환
- 드래그 앤 드롭으로 mp3 업로드 → IndexedDB 저장
