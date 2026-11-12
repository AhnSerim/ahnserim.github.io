# serim.space 디자인 컨셉

> 이 문서는 사이트 디자인의 **단일 기준(source of truth)** 입니다.
> 디자인을 수정할 때는 먼저 이 문서를 읽고, 여기 정의된 원칙·토큰·컴포넌트를 따릅니다.
> 컨셉 자체를 바꾸는 수정이라면 **코드와 함께 이 문서도 갱신**합니다.

---

## 1. 컨셉 한 줄

**"우주를 떠다니는 8비트 게임 화면 속의 개발·독서 기록장"**

깊은 남색 우주 배경 위에 픽셀 별이 반짝이고, 픽셀 행성과 작은 우주선이 떠 있습니다.
UI는 레트로 게임(부팅 화면, SECTOR, GAME OVER, ◀ PREV / NEXT ▶)의 언어를 쓰지만,
**본문은 읽기 편한 일반 서체로** 써서 긴 기술 글·독서 기록을 편하게 읽을 수 있게 합니다.

### 핵심 원칙

1. **장식은 픽셀, 본문은 가독성** — 픽셀 폰트는 제목·UI 라벨·숫자에만. 본문 단락·리스트는 Pretendard.
2. **둥근 모서리 금지** — `border-radius`는 항상 0. 모서리를 다듬거나 깎고 싶으면 `pixel-corners`(작은 노치) 또는 `pixel-frame` + `px-stair()`(4px 계단형 실루엣)를 사용.
3. **블러 없는 하드 그림자** — `box-shadow`는 오프셋만 있고 blur 0인 검은 그림자(`--pixel-shadow`, `--pixel-shadow-lg`)만 사용.
4. **4px 픽셀 그리드** — 테두리 두께, 간격, 아이콘 크기는 모두 4px의 배수(일부 2px 허용).
5. **계단식 움직임** — 트랜지션/애니메이션은 `steps()` 이징으로 8비트 느낌. 부드러운 ease는 쓰지 않음.
6. **다크 단일 테마** — 라이트 모드 없음 (`color-scheme: dark`).
7. **접근성 우선** — 모든 텍스트 색은 WCAG AA 이상, 포커스 링은 항상 보이게, `prefers-reduced-motion` 존중.

---

## 2. 컬러

모든 색은 `_sass/_tokens.scss`의 CSS 변수로만 사용합니다. **새 색이 필요하면 하드코딩하지 말고 토큰을 먼저 추가**하세요.

### 표면 (Surfaces)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--c-space-900` | `#070a1c` | 페이지 배경, 강조 배경 위 글자색 |
| `--c-space-800` | `#0e1433` | 카드·박스 표면 |
| `--c-space-700` | `#1a2250` | 호버, 코드블록 헤더, 표 헤더 |
| `--c-space-600` | `#26306a` | 인라인 코드, 꺼진 별점 |

### 텍스트

| 토큰 | 값 | 대비 | 용도 |
|---|---|---|---|
| `--c-text` | `#e8ebff` | 16.6:1 | 본문 |
| `--c-text-dim` | `#a9b0d6` | 9.2:1 | 메타 정보, 설명, 날짜 연도 |

### 액센트

| 토큰 | 값 | 의미 |
|---|---|---|
| `--c-star` (별빛 노랑) | `#ffe066` | 기본 강조 · 링크 · 주요 버튼 · 활성 네비 |
| `--c-plasma` (플라즈마 시안) | `#5ef0ff` | **Study 섹션** · 포커스 링 · h3 |
| `--c-nebula` (성운 핑크) | `#ff7ad9` | **Reading 섹션** · 태그 칩 · 인용문 |
| `--c-border` | `#5a6bd0` | 픽셀 테두리, 구분선 (비텍스트 3:1 이상) |
| `--c-shadow` | `#000000` | 하드 그림자 |
| `--c-bevel-light` | `rgba(255,255,255,.45)` | 키캡 버튼 윗면 하이라이트 (inset, blur 0) |
| `--c-bevel-dark` | `rgba(0,0,0,.3)` | 키캡 버튼 아랫면 · 눌림 (inset, blur 0) |

### 섹션별 액센트 규칙

컴포넌트는 로컬 변수 `--accent`를 정의하고, 섹션 modifier로 덮어씁니다.

```scss
.component {
  --accent: var(--c-star);                 // 기본
  &--study   { --accent: var(--c-plasma); }
  &--reading { --accent: var(--c-nebula); }
}
```

새 섹션을 추가할 땐 새 액센트 토큰을 정하고 이 패턴을 그대로 따릅니다.

### 배경 그라디언트

`.space-bg`에만 은은한 radial-gradient(보라 `rgba(91,68,176,.22)`, 핑크 `rgba(255,122,217,.08)`)를 허용합니다. 그 외 UI에는 그라디언트를 쓰지 않습니다. 예외는 **딱 끊기는 픽셀 줄무늬용 repeating-linear-gradient**뿐(점선 `hr`, 읽기 게이지, 카트리지 그립, 착륙장 점선) — 색 전환 없이 4px 단위로 끊겨야 합니다.

### 코드 하이라이트 (Night sky, `_syntax.scss`)

코드블록 배경 `#111733` 기준 모두 7.5:1 이상.
키워드 핑크 `#ff7ad9` · 타입 시안 `#5ef0ff` · 문자열 연두 `#b8f28c` · 숫자 노랑 `#ffe066` · 함수 하늘 `#8fd3ff` · 클래스 보라 `#c9a7ff` · 전처리기 주황 `#ffb86b` · 주석 `#a9b0d6` 이탤릭.

---

## 3. 타이포그래피

| 토큰 | 폰트 | 용도 |
|---|---|---|
| `--font-pixel` | **Galmuri11** (CDN) → DungGeunMo → monospace | h1–h4, 로고, 네비, 버튼, 칩, 날짜, kicker, 라벨 |
| `--font-body` | **Pretendard Variable** (CDN) → 시스템 산세리프 | 본문, 설명, 발췌문 |
| `--font-code` | D2Coding → Cascadia Code → Consolas | 코드 |

- 제목은 `font-weight: 400`(Regular). 굵게 보이고 싶으면 크기·색·`text-shadow`로 강조. **예외: 네비 라벨·이스터에그 점수 팝업·외계인 `!`는 `font-weight: 700`** — Galmuri11에 실제 픽셀 Bold 파일이 있어 도트가 뭉개지지 않음(브라우저 합성 굵기 아님). 다른 곳에 700을 쓸 땐 Galmuri11인지 확인.
- 큰 제목은 하드 텍스트 그림자: `text-shadow: var(--px) var(--px) 0 var(--c-shadow)` (모바일은 2px).
- 한국어: `word-break: keep-all` (어절 단위 줄바꿈).

### 크기 스케일

| 토큰 | 데스크톱 | 태블릿 | 모바일 |
|---|---|---|---|
| `--fs-xs` | 13px | | |
| `--fs-sm` | 15px | | |
| `--fs-base` | 17px | | |
| `--fs-lg` | 20px | | |
| `--fs-xl` | 26px | | 22px |
| `--fs-2xl` | 36px | 32px | 26px |

행간: 본문 `--lh-body: 1.75`, 제목 `--lh-tight: 1.35`.

---

## 4. 간격 · 레이아웃

### 4px 그리드

| 토큰 | 값 |
|---|---|
| `--px` | 4px (픽셀 1칸 = 테두리 기본 두께) |
| `--sp-1` | 4px |
| `--sp-2` | 8px |
| `--sp-3` | 16px |
| `--sp-4` | 24px |
| `--sp-5` | 40px |
| `--sp-6` | 64px |

임의의 px 값 대신 이 토큰을 사용합니다.

### 레이아웃

| 토큰 | 값 | |
|---|---|---|
| `--layout-w` | 1120px | 전체 컨테이너 최대 폭 |
| `--content-w` | 720px | 본문(prose) 최대 폭 — 가독성 |
| `--gutter` | 40 / 24 / 16px | 데스크톱 / 태블릿 / 모바일 좌우 여백 |
| `--header-h` | 72 / 60px | 데스크톱 / 모바일 |

### 반응형 (데스크톱 퍼스트)

기본 스타일은 ≥1024px 기준으로 작성하고, 아래로 덮어씁니다.

```scss
@include tablet { ... }  // ≤1023px
@include mobile { ... }  // ≤767px
```

- 모바일: 카드 1열, 네비는 햄버거 드롭다운(JS 없으면 그냥 줄바꿈으로 노출), 코드블록은 화면 끝까지(full-bleed), 우주선 숨김, 행성 축소.
- 터치 타겟 최소 44px.

---

## 5. 픽셀 프리미티브 (`_sass/_pixel.scss`)

| 이름 | 설명 |
|---|---|
| `@mixin pixel-corners($u)` | clip-path로 네 모서리를 한 칸씩 깎은 계단형 모서리. **box-shadow와 같이 쓰면 그림자가 잘리므로 함께 쓰지 않음.** |
| `px-stair($tl, $tr, $br, $bl)` | 모서리별로 4px 계단으로 깎는 clip-path polygon 함수. 값은 4px 배수(0 = 각진 모서리) |
| `@mixin pixel-frame($shape, $bg, $line)` | **모양 있는 박스의 기본.** `::before`(테두리색, 전체 모양) + `::after`(표면색, 4px 안쪽) 두 레이어로 그리고, 그림자는 `filter: drop-shadow(… 0 …)`라 실루엣을 따라감. 요소 자체는 잘리지 않아 포커스 링이 보임. 색은 `--frame-line`/`--frame-bg`, 그림자 크기는 `--frame-shadow`로 바꿈. 의사요소를 쓰므로 다른 장식은 자식 요소로 |
| `@mixin pixel-box` | (레거시) 표면색 + 4px 실선 테두리. 새 박스는 `pixel-frame` 사용 |
| `.pixel-box` | **HUD 패널** — 좌상·우하 모서리를 12px 계단으로 깎은 정보 박스(404, 빈 상태, BOOK DATA, 방명록 안내) |
| `.pixel-btn` | **아케이드 키캡** — 노랑 면 + 검정 외곽 + 4px 계단 모서리, 윗면 밝은/아랫면 어두운 4px 베벨. hover: `translate(-2px,-2px)` + 그림자 확대, active: `translate(4px,4px)` + 그림자 제거 + 베벨 반전(눌림) |
| `.pixel-btn--ghost` | 어두운 키캡(남색 면 + 테두리색 외곽). hover 시 외곽·글자 노랑 |
| `.pixel-chip` / `--study` / `--reading` | **픽셀 알약** — 2px 테두리 + 2px 계단 모서리(`pixel-corners(2px)`). hover 시 색 반전, 포커스 시 clip 해제(링 보이게) |
| `.pixel-caret` | 제목·kicker 앞 8×8 픽셀 커서 블록 |
| `.pixel-rating` | 5칸 픽셀 별점 (clip-path 별) |

### 인터랙션 공통 규칙

- **떠오름(hover)**: `transform: translate(-2px, -2px)` + 테두리를 `--accent`로.
- **눌림(active)**: `transform: translate(var(--px), var(--px))` + `box-shadow: none`.
- **포커스**: `outline: var(--px) solid var(--c-plasma); outline-offset: 2px;` — 절대 제거하지 않음(카드처럼 링크가 늘어난 경우 부모에 `:has()`로 대체 포커스 표시).
- 트랜지션: `var(--dur-fast) var(--ease-step)` (120ms, `steps(2, end)`).

---

## 6. 컴포넌트 카탈로그

| 컴포넌트 | 위치 | 요점 |
|---|---|---|
| 사이트 헤더 | `_includes/header.html`, `_layout.scss` | sticky, 반투명 남색 + blur, 하단 4px 테두리. 픽셀 SVG 로고 + `serim.space` (점은 노랑) |
| 네비게이션 | `_includes/nav.html`, `_data/navigation.yml`, `_layout.scss` | **스테이지 선택 키캡** — 아이콘 없이 **Galmuri11 Bold** 라벨만, 가로·세로 가운데 정렬(`text-box: trim-both cap alphabetic`으로 폰트 위아래 여백을 잘라 시각적 중앙). 평소엔 테두리 없이 평평, hover/focus 시 남색 키캡이 `--accent` 테두리로 떠오름(-2px), 현재 페이지는 액센트 면 + 베벨의 켜진 키캡(`aria-current`: 해당 페이지 `page`, 섹션 하위 글 `true`). Study/Reading은 섹션색. 태블릿은 좌우 여백 축소, 모바일은 햄버거 → `SELECT STAGE` 제목 + 2열 키캡 그리드 드롭다운(메뉴 선택·Esc·바깥 클릭·포커스 이탈 시 닫힘). 평소 모양은 `--nav-rest-line/bg/shadow`로만 바꿈(상태 스타일보다 우선순위가 높아지지 않게) |
| 우주 배경 | `_includes/space-bg.html`, `_space.scss` | 고정 배경. 별 타일 2레이어(원경 흐릿, 근경 twinkle), 픽셀 행성(우상단), 우주선(좌→우 38초 비행). 모두 `aria-hidden` |
| 홈 히어로 | `_layouts/home.html`, `assets/js/typing.js` | **터미널 타이핑 인트로** — 시안 `> BOOTING serim.space ...`(28ms/자) → 노란 ` OK` → 큰 노랑 h1 `Hello World!`(90ms/자) → 부제(60ms/자)를 차례로 타이핑, 블록 커서가 줄을 따라 이동(타이핑 중엔 고정, 끝나면 마지막 줄 끝에서 깜빡임). 글자마다 속도 ±30% 흔들림. 안 친 글자는 투명하게 자리만 차지(레이아웃 흔들림 없음), 스크린리더는 숨은 전체 문장을 읽음. 클릭·키 입력 시 즉시 완성. 탭 세션당 첫 방문 1회(sessionStorage `serim.booted`), JS 없음·모션 감소·재방문은 바로 표시. `<head>`의 인라인 스크립트가 `.fx-type`으로 첫 페인트 전에 숨김(실패 시 load에서 해제) |
| 섹터 카드 | `.sector` | **게임 카트리지** — 우상단 24px 계단 컷, `SECTOR 01 / 02` kicker, 섹션색 윗줄이 있는 라벨 스티커(제목·설명), 하단 글 수 배지(`N편 ▶`) + 그립 줄무늬. hover: 위로 뽑히며 테두리 섹션색, active: 꽂히듯 눌림 |
| 페이지 히어로 | `.page-hero` | kicker(픽셀 캐럿 + 대문자) → 큰 제목 → 설명 → 액센트 배경 카운트 배지, 하단 점선 |
| 포스트 카드 | `_includes/post-card.html` | **RPG 대화창** — 네 모서리 8px(2계단) 둥근 픽셀 창. hover/focus 시 테두리 섹션색 + 왼쪽 레인에 깜빡이는 `▶` 선택 커서(`.post-card__cursor`). 좌측 날짜 열(`MM.DD` / `YYYY`, 점선 구분) + 본문. 카드 전체 클릭(제목 링크 `::after`). Reading은 BOOK 라벨 + 별점 |
| 포스트 상세 | `_layouts/post.html`, `_post.scss` | **퀘스트 로그 창(`.post__sheet`)** — 글 전체(헤더·본문·푸터)를 불투명한 `--c-space-900` RPG 창 위에 올려 배경이 글자 뒤로 비치지 않게 함. 바깥은 `pixel-frame` 네 모서리 8px(2계단), 안쪽 8px 들어간 곳에 차분한 `--c-space-600` 2px 선(`.post__sheet-line`, 2px 노치 모서리) = 이중 테두리, 섹션색은 네 모서리의 12px ㄱ자 브래킷에만(전체 길이의 밝은 선은 눈이 피로해서 쓰지 않음), 윗변에 걸친 명패(`.post__plate`): 글의 태그 최대 3개를 `▶ #tag #tag` 링크로(Tags 페이지 해당 앵커, 한 줄 넘치면 말줄임), 태그가 없으면 `▶ QUEST LOG`, 본문 h2 앞 `▸` 대신 섹션색 `▶` 커서. 안쪽 여백 44px / 태블릿 28px, 본문 폭은 그대로 720px. 모바일은 화면 끝까지 붙고(그림자 없음, 선은 4px 안쪽) 코드블록은 화면 끝 대신 창 안쪽 폭까지. 창 위 클릭은 배경 이스터에그로 넘어가지 않음. breadcrumb `/` 구분, 날짜·N분 읽기·섹션 칩, Reading은 `BOOK DATA` 박스, 하단 태그 · `◀ PREV / NEXT ▶` 페이저(**화살표 키** — 진행 방향 쪽 모서리를 16px 계단으로 깎은 블록, hover 시 그 방향으로 4px 이동) · 목록으로 버튼 |
| 본문 (prose) | `_prose.scss` | h2 앞 `▸ ` + 하단 실선, h3 시안, ul 마커 `■` 노랑, 인용문 좌측 8px 핑크 바, 이미지 테두리+그림자, 코드블록 상단에 언어 라벨 바(`C`, `C++`, `ASM`…) |
| 빈 상태 | `.empty-state` | `NO SIGNAL…` 깜빡임 |
| 방명록 | `guestbook.html`, `_includes/giscus.html`, `.guestbook` | kicker `SIGNAL STATION · 방명록`, `HOW TO TRANSMIT` 안내 박스 + giscus(GitHub Discussions, Announcements 카테고리의 `guestbook` 글타래) 위젯. 설정은 `_config.yml`의 `giscus:`. 미설정 시 `SIGNAL OFFLINE` 빈 상태 |
| giscus 테마 | `assets/css/giscus.css` | iframe 내부라 사이트 토큰을 못 씀 → 토큰 값을 **직접 복사**. 토큰 변경 시 이 파일도 함께 수정. 각진 모서리, 4px 테두리 + 하드 그림자, 픽셀 폰트 버튼 |
| 읽기 진행 게이지 | `.scroll-progress` (헤더, 포스트에서만) | 헤더 하단 테두리 위에 12px 채움 + 4px 간격의 세그먼트 바. 16px 단위로만 차오름. 섹션색 |
| 404 | `404.html` | 큰 핑크 `404` + `GAME OVER` + `▶ CONTINUE` 버튼 |
| 숨겨진 구역 (이스터에그 1) | `hidden-sector.html` (`/hidden-sector/`), `.hidden-sector` | 배경 우주선을 클릭(또는 코나미 코드)하면 도착. `SECTOR 00 · CLASSIFIED` → `BONUS STAGE`, 착륙장 위에 떠 있는 큰 우주선, `ACHIEVEMENT UNLOCKED` 패널(방문 횟수, localStorage), 유성우 업적(소원 전엔 `LOCKED` 회색 실루엣), `PILOT'S SECRET LOG`. 이 페이지에서는 **모든 이스터에그(우주선·유성우·키 코드)가 꺼짐**(`space-eggs.js` 첫머리에서 종료). 어디에도 링크하지 않고 `noindex`·`sitemap: false` |
| 유성우 (이스터에그 2) | `assets/js/space-eggs.js`, `_space.scss` | 배경 행성을 클릭·탭(모바일 포함)하거나 `WISH` 입력 → 행성이 4px 흔들리고 픽셀 유성 6개가 우상→좌하로 `steps(12)` 낙하(시작점은 위쪽·오른쪽 변을 잇는 L자를 6칸으로 나눠 칸마다 하나 → 궤적 간격 균등, 순서는 섞음), 행성 위에 오락실 점수처럼 `+1 WISH` / `★ × N` 점수 팝업(`.score-pop--wish`, 노랑·핑크 픽셀 Bold + 하드 그림자)이 튀어 올랐다 사라짐. 스크린리더는 숨은 `role="status"`로 안내. 소원 수는 localStorage `serim.wishes` → 숨겨진 구역 업적 해금. 모션 감소 시 유성 없이 팝업만 제자리에 잠깐 표시 |
| 엿보는 외계인 (이스터에그 3) | `_includes/study-alien.html` (Study 목록 페이지만, `section.html`), `space-eggs.js`, `_space.scss` | 시안(Study 색) 12×10 픽셀 외계인(더듬이·큰 눈·가장자리를 붙잡은 손, 8px/픽셀, 모바일 4px)이 5–8초 뒤 콘텐츠 폭 안 무작위 위치에서 화면 아래 가장자리로 빼꼼 올라와 2.6초간 눈을 깜빡이다 숨음(10–18초마다 반복, 탭이 숨겨지면 대기). 숨기 전 클릭·탭(= 찌르기)하거나 `ALIEN` 입력 → 머리 위 말풍선 + 깜짝 점프, 찌를 때마다 1.4초 더 머묾. 한 번 등장에 첫 찌르기만 `+1 CONTACT` / `ALIEN × N` 점수 팝업(`.score-pop--alien`, 시안·노랑), localStorage `serim.aliens`. **기분(`data-mood`, 이번 방문의 찌른 횟수)**: 1–4 `startled` `!` → 5–7 `annoyed` `?!`(눈 가늘게) → 8–9 `furious` `!!`(V자 눈썹·찡그린 입, 핑크 말풍선) → 10 `angry` `#@!`(몸이 핑크로, 부들부들 떨림) + 페이지 흔들림 + `ANGRY!!` / `DON'T POKE ME` 팝업(`.score-pop--angry`) → 퇴장 후 이 탭에선 다시 안 나옴(sessionStorage `serim.alien.sulk`, `ALIEN` 입력 시 `STILL ANGRY`). 화난 횟수 localStorage `serim.aliens.angry` → "외교 실패" 업적. 얼굴 레이어는 SVG `<g>`(`__lids`/`__squint`/`__rage`), 피부색은 `.alien__skin` + `--alien-skin`. 모션 감소 시 미끄러짐·점프 없이 나타났다 사라짐 |
| 숨겨진 구역 업적 | `hidden-sector.html` | 이스터에그별 업적 칸은 `data-unlock`(localStorage 키) + `data-title`/`data-desc`(`{n}` = 횟수)로 선언 → 카운터 > 0이면 해금. 색은 `--achv-accent`/`--achv-trophy` modifier(`--wish` 핑크, `--alien` 시안, `--angry` 핑크) |
| 푸터 | `_includes/footer.html` | 픽셀 캐럿 + ©, GitHub · `맨 위로 ▲` |

---

## 7. 카피 · 보이스

- **UI 라벨은 게임/우주 용어 + 영문 대문자**: `SECTOR 01`, `BOOK DATA`, `NO SIGNAL…`, `GAME OVER`, `CONTINUE`, `BOOTING`.
- **방향/진행은 기호**: `◀` `▶` `▲` `▸` `■`.
- **설명 문장은 한국어, 합쇼체(~습니다 / ~입니다)**: "아직 이 구역에 도착한 글이 없습니다. 곧 착륙할 예정입니다." 권유는 "~해 보십시오", "~해 주십시오". 인사말 "안녕하세요"는 예외. 포스트 본문은 글쓴이 문체를 따르므로 이 규칙 대상이 아님.
- 우주 은유(구역·착륙·우주 저편·신호)는 가볍게, 과하지 않게.

---

## 8. 모션

| 애니메이션 | 대상 | 설정 |
|---|---|---|
| `twinkle` | 근경 별 | 4s `steps(4)` alternate |
| `fly` | 우주선 | 38s linear 무한 |
| `flicker` | 우주선 불꽃 | .4s `steps(2)` |
| `warp-flash` | 이스터에그 진입 화면 번쩍임 | .6s `steps(6)` (우주선은 WAAPI로 `steps(6)` 발진) |
| `hover-bob` | 숨겨진 구역의 우주선 | 1.6s `steps(2)` alternate, 8px |
| `meteor` | 유성우 유성 | 0.9–1.5s WAAPI `steps(12)`, 240ms 간격 순차 |
| `score-pop` | 이스터에그 점수 팝업 (유성우·외계인) | 1.6s `steps(8)` — 40px 튀어 오름 → 24px로 내려앉음 → 64px까지 떠오르며 사라짐 |
| 외계인 등장/퇴장 | 엿보는 외계인 | `transform` 400ms `steps(4)` 트랜지션 (화면 아래 → 가장자리) |
| `alien-blink` | 외계인 눈 | 2.6s `steps(1)` 무한 |
| `alien-startle` | 찔린 외계인 (찌를 때마다 재시작) | .48s `steps(4)`, 24px 점프 |
| `alien-rage` | 화난 외계인 | .24s `steps(2)` 무한, 좌우 4px |
| 페이지 흔들림 | 외계인이 화났을 때 `.site-main` | WAAPI `translate` 480ms `steps(6)`, 8px |
| `blink` | 커서, NO SIGNAL | 1–1.2s `steps(2, start)` |
| 타이핑 | 홈 히어로 | JS `setTimeout` 글자 단위(28 / 90 / 60ms ±30%), 줄 사이 300–450ms 쉼 |

| `pixel-rise` | 스크롤로 화면에 들어오는 요소 | `--dur-reveal` 400ms, `--ease-reveal` `steps(4, end)` — 아래에서 16px을 4px씩 끊어 올라오며 나타남 |

- 애니메이션은 `opacity`/`transform`만 (페인트 비용 최소화).
- `prefers-reduced-motion: reduce` → 모든 애니메이션·트랜지션 사실상 정지, 우주선은 고정 위치.

### 스크롤 효과 (`assets/js/scroll-fx.js`, `_sass/_scroll-fx.scss`)

1. **Reveal (pixel-rise)** — `data-reveal` 속성이 붙은 요소와 본문의 `h2`·`h3`·인용문·코드블록·표가 화면에 들어올 때 한 번 나타남.
   같이 들어온 요소는 80ms씩 순차(최대 5단계). 새 카드·박스류 컴포넌트에는 `data-reveal`을 붙인다.
   히어로(페이지 상단 제목)에는 붙이지 않는다 — 첫 화면은 바로 보여야 함.
2. **읽기 진행 게이지** — 포스트 페이지 헤더 하단의 세그먼트 바 (모션 감소 설정에서도 동작: 정보 표시용).
3. **패럴랙스** — 원경 별 0.04×, 근경 별 0.12×, 행성 0.08×(최대 240px) 속도로 스크롤 반대로 이동, 2px 단위로 스냅.
   별 레이어는 타일 크기(320/560px)로 순환해 끝없이 흐름.

규칙:
- 점진적 향상: `<head>`의 인라인 스크립트가 `.fx-reveal`을 붙였을 때만 숨김 처리. JS가 없거나 `scroll-fx.js`가 로드되지 않으면 모두 그대로 보임.
- Reveal 대상 선택자는 `scroll-fx.js`의 `REVEAL`과 `_scroll-fx.scss`의 목록을 **항상 같이** 수정.
- 스크롤 핸들러는 `requestAnimationFrame` 한 번으로 묶고, `transform`만 쓴다.

---

## 9. 픽셀 아트 에셋 규칙

- 인라인 SVG, 작은 `viewBox`(8×8, 12×8, 16×16 등)에 `<rect>`로 그리고 크게 확대.
- 반드시 `shape-rendering="crispEdges"` (+ CSS `image-rendering: pixelated`).
- 팔레트는 토큰 색만 사용: `#e8ebff` `#5ef0ff` `#ff7ad9` `#ffe066` `#a9b0d6` + 행성용 보라 `#3a2a7a` `#5b44b0`.
- 장식용 그래픽은 `aria-hidden="true"`.

---

## 10. 하지 말 것 (Don'ts)

- ❌ `border-radius` > 0, 블러가 있는 그림자, 부드러운 ease 곡선
- ❌ 본문 단락에 픽셀 폰트
- ❌ 토큰 없이 새 hex 색 하드코딩 (현재 예외: 헤더/푸터 반투명 배경 `rgba(7,10,28,…)`, 코드블록 배경 `#111733`, `strong` `#fff`, 픽셀 SVG 내부 fill, `assets/css/giscus.css`)
- ❌ 4px 그리드에서 벗어난 임의 간격
- ❌ 포커스 아웃라인 제거
- ❌ 라이트 테마 전용 스타일 추가 (컨셉 변경 시 이 문서부터 갱신)

---

## 11. 파일 구조

```
_sass/
  _tokens.scss      색·폰트·간격·레이아웃·모션 토큰, 브레이크포인트 믹스인
  _base.scss        리셋, 기본 타이포, 링크, 포커스, 컨테이너
  _pixel.scss       픽셀 프리미티브 (corners, box, btn, chip, caret)
  _space.scss       우주 배경
  _layout.scss      헤더, 네비, 푸터
  _components.scss  페이지 히어로, 포스트 카드/리스트, 태그, 별점, 빈 상태
  _prose.scss       마크다운 본문
  _syntax.scss      코드 하이라이트
  _post.scss        포스트 상세
  _pages.scss       홈, 태그, 방명록, 404
  _scroll-fx.scss   스크롤 reveal, 읽기 진행 게이지
assets/css/main.scss  위 파일 import 순서 정의
assets/css/giscus.css giscus iframe용 테마 (Sass 미처리, 토큰 값 수동 복사)
assets/js/nav.js      모바일 햄버거 메뉴
assets/js/scroll-fx.js 스크롤 효과
assets/js/typing.js    홈 히어로 타이핑 인트로
assets/js/space-eggs.js 이스터에그 (우주선 클릭 / 코나미 코드 → /hidden-sector/, 행성 클릭 / WISH → 유성우, Study 외계인 클릭 / ALIEN → 접촉)
_includes/study-alien.html 엿보는 외계인 스프라이트 (Study 목록에서만 include)
```

새 스타일은 역할에 맞는 파일에 추가하고, 재사용될 패턴이면 `_pixel.scss`/`_components.scss`로 올립니다.

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-11-12 | 최초 작성 — space + pixel-art 테마(UI 리팩터 #1) 기준으로 정리 |
| 2026-11-12 | 방명록(giscus + 픽셀 테마) 추가, 스크롤 효과(pixel-rise reveal, 읽기 진행 게이지, 별 패럴랙스) 추가, 모션 토큰 `--dur-reveal`·`--ease-reveal` 추가 |
| 2026-11-12 | 박스 형태 리팩터: `px-stair()`·`pixel-frame` 도입. 섹터=카트리지, 포스트 카드=RPG 대화창(▶ 커서), 버튼=아케이드 키캡(베벨 토큰 `--c-bevel-*` 추가), 페이저=화살표 키, `.pixel-box`=HUD 패널, 칩=픽셀 알약. 배경 우주선 이스터에그 + `/hidden-sector/` 추가 |
| 2026-11-12 | 네비 리팩터: 스테이지 선택 키캡(Galmuri11 Bold 라벨, 켜진 키캡 = 현재 페이지, 모바일 2열 `SELECT STAGE` 메뉴). 이스터에그 2 — 행성 클릭/`WISH` 유성우 + 숨겨진 구역 업적. `stowaway.js` → `space-eggs.js`. 유성우는 유성 6개 + 행성 위 `+1 WISH` 점수 팝업(하단 토스트 제거) |
| 2026-11-12 | 이스터에그 3 — Study 페이지의 엿보는 외계인(`study-alien.html`, `ALIEN`) + 숨겨진 구역 업적. 점수 팝업을 `.score-pop--{wish,alien}`로 일반화, 업적 해금을 `data-unlock` 선언식으로 정리 |
| 2026-11-12 | 외계인 기분 단계 추가: 찌를 때마다 머묾 연장, 5·8·10번째에 표정 변화, 10번이면 화내며 화면 흔들고 탭 세션 동안 삐짐. "외교 실패" 업적, `.score-pop--angry` |
| 2026-11-12 | 포스트 가독성: 글 전체를 불투명 RPG 퀘스트 로그 창 `.post__sheet`(이중 테두리 + `▶ QUEST LOG` 명패) 위에 올림 |
| 2026-11-12 | 포스트 명패에 글 태그(최대 3개, 링크) 표시. 숨겨진 구역에서는 모든 이스터에그 비활성. UI 문구를 합쇼체(~습니다/~입니다)로 통일, 카피 보이스 규칙 갱신 |
| 2026-11-12 | 퀘스트 로그 창 안쪽 선을 섹션색 → `--c-space-600`으로 낮추고, 섹션색은 모서리 12px 브래킷에만 사용(눈부심 완화) |
| 2026-11-12 | 홈 히어로에 터미널 타이핑 인트로 추가(`typing.js`, `.fx-type`, 세션당 1회) |
