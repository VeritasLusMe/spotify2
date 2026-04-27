# Editorial Player (Spotify)

매거진 풍의 스타일로 재해석된 개인용 음악 플레이어. **Spotify Web Playback SDK**로 풀트랙을 재생하며,
본인이 큐레이션한 곡과 직접 작성한 가사만 사이트에 표시됩니다. 빌드/배포는 GitHub Actions + GitHub Pages.

적용된 디자인 설정:

- **Theme**: Light (따뜻한 크림/페이퍼 톤)
- **Font Pair**: Editorial (Playfair Display + Inter)
- **Lyrics Style**: Classic (좌측 아트 + 우측 가사)
- **Lyrics Transition**: Slide Up
- **Lyrics Font Size**: 58px
- **Art Glow**: ON
- **Lyrics Panel**: ON

> **요구사항**: 재생을 들으려는 사용자는 **Spotify Premium** 계정이 필요합니다 (Web Playback SDK 제약).

---

## 1. Spotify 앱 만들기

1. <https://developer.spotify.com/dashboard> 에서 새 앱(Application) 생성
2. **Client ID** 를 복사 (Client Secret도 같이 보관 — 빌드 시에만 사용)
3. App Settings → **Redirect URIs** 에 두 개 등록:
   - `http://localhost:5173/` — 로컬 개발용
   - `https://<YOUR-GITHUB-USERNAME>.github.io/spotify2/` — 배포용
4. APIs/SDKs 섹션에서 **Web Playback SDK** 가 활성화되어 있는지 확인

---

## 2. 로컬 개발

```bash
npm install
```

저장소 루트에 `.env.local` 파일 생성:

```
VITE_SPOTIFY_CLIENT_ID=여기에_Client_ID
VITE_REDIRECT_URI=http://localhost:5173/
SPOTIFY_CLIENT_ID=여기에_Client_ID
SPOTIFY_CLIENT_SECRET=여기에_Client_Secret
```

`VITE_*` 변수는 브라우저(런타임)용, 아래 두 개는 빌드 스크립트(메타데이터 fetch)용입니다.

```bash
npm run dev
```

http://localhost:5173 에서 자동으로 열립니다. 상단 녹색 배너의 "Spotify 로그인"을 누르면 OAuth가 시작됩니다.

---

## 3. 곡 추가하기

`src/songs.js` 의 `SONGS` 배열에 항목을 추가하세요. **Spotify 트랙 ID와 가사·컬러만** 적으면 됩니다:

```js
{
  spotifyId: '4uLU6hMCjMI75M1A2tKUQC',  // Spotify에서 곡 우클릭 → 공유 → 링크 복사
  short: '곡 짧은 이름',                 // 우측 상단 알약 버튼 표시
  tag: 'MY PICK',                       // 에디토리얼 라벨
  genre: 'Lo-fi / Bedroom Pop',         // (선택) Spotify는 트랙 장르를 안 줘서 직접 입력
  colors: PALETTES.indigo,              // 또는 PALETTES.amber, .rose, .teal 등
  lyrics: [
    { t: 0,  text: '♪' },
    { t: 8,  text: '첫 줄 가사' },
    { t: 14, text: '두 번째 줄' },
    // ...
  ],
}
```

제목·아티스트·앨범·앨범아트·길이·연도는 **빌드 스크립트가 Spotify에서 자동으로 가져옵니다** — 직접 적을 필요 없습니다.

곡을 새로 등록한 뒤 `npm run dev`를 다시 실행하면 자동으로 메타데이터를 fetch합니다. 즉시 갱신만 하고 싶으면:

```bash
npm run fetch:meta
```

### Spotify 트랙 ID 찾는 법

Spotify 앱에서 곡 우클릭 → **공유** → **곡 링크 복사**.
링크 `https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=...` 의 `track/` 뒤 22자가 ID입니다.

### 가사 타임스탬프 맞추기

`lyrics` 배열의 `t` 값은 **곡 시작 후 해당 줄이 화면에 떠야 할 시점(초)** 입니다. 소수도 가능 (`14.5`).

곡을 한 번 플레이하면서 진행바 옆 시간 표시(`0:14`)를 보고 그 시점의 초 값을 `t`에 넣으면 됩니다.
가사가 살짝 늦게 떠야 자연스럽다면 `t`를 0.3~0.5초 정도 빼세요.

---

## 4. GitHub Pages 배포

### A. 저장소 Secrets 설정

저장소 **Settings → Secrets and variables → Actions** 에서 추가:

| Secret 이름                | 값 |
|---------------------------|----|
| `SPOTIFY_CLIENT_ID`       | Spotify 앱의 Client ID |
| `SPOTIFY_CLIENT_SECRET`   | Spotify 앱의 Client Secret |
| `VITE_REDIRECT_URI`       | `https://<YOUR-USERNAME>.github.io/spotify2/` |

### B. GitHub Pages 활성화

저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 설정.

### C. 배포

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml` 워크플로우가 실행됩니다:

1. 의존성 설치
2. `node scripts/fetch-metadata.mjs` — Spotify 메타데이터 fetch
3. `npm run build` — Vite 빌드
4. `dist/` 를 GitHub Pages 에 업로드 & 배포

Actions 탭에서 진행 상황을 확인하고, 끝나면 `https://<YOUR-USERNAME>.github.io/spotify2/` 에 접속.

> **저장소 이름이 다른 경우**: `vite.config.js` 의 `base` 기본값(`/spotify2/`)을 본인 저장소 이름으로 바꾸거나
> 워크플로우에서 `VITE_BASE='/your-repo/'` 환경변수를 추가하세요.

---

## 5. 키보드 단축키

| 키 | 동작 |
|---|---|
| `Space` | 재생 / 일시정지 |
| `←` / `→` | 5초 뒤로 / 앞으로 |
| `Shift + ←` / `Shift + →` | 이전 곡 / 다음 곡 |
| `↑` / `↓` | 볼륨 ±5 |

---

## 6. 디자인 조정

설정은 `src/theme.js` 의 `SETTINGS` 객체에 모여있습니다:

```js
export const SETTINGS = {
  theme: 'light',
  fontPair: 'editorial',
  lyricsStyle: 'classic',          // 'classic' | 'vogue'
  lyricsTransition: 'slideUp',     // 'slideUp' | 'fade' | 'scaleFade' | 'blur' | 'wipe'
  lyricsFontSize: 58,
  artGlow: true,
  showLyrics: true,
};
```

색상 팔레트는 `src/songs.js` 의 `PALETTES` 상수에서 추가/수정. 곡마다 5단계 컬러로 배경 그라디언트와
액센트가 자동 생성됩니다.

---

## 7. 알아둘 점

- **Spotify Premium 필요**: 무료 계정은 Web Playback SDK가 device를 만들지 못해 재생할 수 없습니다.
  로그인까지는 무료 계정도 가능하지만 재생 시 "Premium 필요" 배너가 뜹니다.
- **OAuth 토큰**: localStorage에 access/refresh 토큰을 저장합니다. 1시간 후 자동 갱신.
  로그아웃은 상단 배너의 "로그아웃" 버튼.
- **자동재생**: 브라우저 정책상 첫 진입 시 자동 재생이 차단될 수 있습니다. 한 번 클릭한 뒤부터는 자유롭게 재생.
- **가사**: Spotify가 가사를 제공하지 않으므로 `songs.js` 에 직접 입력합니다. 시간 동기화는 그대로 동작.

---

## 8. 프로젝트 구조

```
spotify2/
├── package.json
├── vite.config.js                  # base: '/spotify2/' for GitHub Pages
├── index.html
├── .github/workflows/deploy.yml    # CI: fetch metadata → build → Pages
├── scripts/
│   └── fetch-metadata.mjs          # Client Credentials → src/songs.generated.json
└── src/
    ├── main.jsx
    ├── App.jsx                     # 모든 뷰 + 컨트롤 + 로그인 배너
    ├── spotify-auth.js             # PKCE 인증 (브라우저)
    ├── spotify-player.js           # useSpotifyPlayer 훅 (Web Playback SDK)
    ├── songs.js                    # ★ 본인 곡 큐레이션 (이 파일만 자주 만질 곳)
    ├── songs.runtime.js            # songs.js + songs.generated.json 머지
    ├── songs.generated.json        # 빌드 산출물 (gitignored)
    ├── theme.js                    # 테마/폰트/아이콘/애니메이션 토큰
    └── styles.css                  # 전역 + 가사 키프레임
```

---

## 9. 다음에 추가할 만한 기능

- 검색 사이드바: 곡 제목/아티스트/가사 텍스트 검색
- 셔플/리피트의 실제 동작 (지금은 시각 토글)
- "현재 재생 중" 위젯에 다음 트랙 미리보기
- Spotify 가사 기능(LRC) 자동 import — Spotify는 공식 API로 안 주지만 LRCLib 같은 외부 소스 활용 가능
