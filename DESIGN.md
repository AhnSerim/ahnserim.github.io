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
2. **둥근 모서리 금지** — `border-radius`는 항상 0. 모서리를 다듬고 싶으면 `pixel-corners` 믹스인(계단형 노치)을 사용.
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

`.space-bg`에만 은은한 radial-gradient(보라 `rgba(91,68,176,.22)`, 핑크 `rgba(255,122,217,.08)`)를 허용합니다. 그 외 UI에는 그라디언트를 쓰지 않습니다(점선 `hr`의 repeating-linear-gradient 예외).

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

- 픽셀 폰트는 단일 굵기 → 제목 `font-weight: 400`. 굵게 보이고 싶으면 크기·색·`text-shadow`로 강조.
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
| `@mixin pixel-box` / `.pixel-box` | 표면색 + 4px 실선 테두리 + 큰 하드 그림자 박스 |
| `.pixel-btn` | 노랑 배경 + 검정 글자 버튼. hover: `translate(-2px,-2px)` + 그림자 확대, active: `translate(4px,4px)` + 그림자 제거(눌림) |
| `.pixel-btn--ghost` | 투명 배경 + 테두리만. hover 시 노랑 |
| `.pixel-chip` / `--study` / `--reading` | 2px 테두리 라벨(태그·섹션). hover 시 색 반전 |
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
| 네비게이션 | `_includes/nav.html`, `_data/navigation.yml` | 픽셀 폰트. 현재 페이지는 액센트 배경 + 검정 글자 + 그림자. Study/Reading은 섹션색 |
| 우주 배경 | `_includes/space-bg.html`, `_space.scss` | 고정 배경. 별 타일 2레이어(원경 흐릿, 근경 twinkle), 픽셀 행성(우상단), 우주선(좌→우 38초 비행). 모두 `aria-hidden` |
| 홈 히어로 | `_layouts/home.html` | `> BOOTING serim.space ...` 시안 부팅 문구 + 깜빡이는 커서, 큰 노랑 h1 |
| 섹터 카드 | `.sector` | `SECTOR 01 / 02` kicker, 섹션색 테두리, 글 수 배지(`N편 ▶`) |
| 페이지 히어로 | `.page-hero` | kicker(픽셀 캐럿 + 대문자) → 큰 제목 → 설명 → 액센트 배경 카운트 배지, 하단 점선 |
| 포스트 카드 | `_includes/post-card.html` | 좌측 날짜 열(`MM.DD` / `YYYY`, 점선 구분) + 본문. 카드 전체 클릭(제목 링크 `::after`). Reading은 BOOK 라벨 + 별점 |
| 포스트 상세 | `_layouts/post.html`, `_post.scss` | breadcrumb `/` 구분, 날짜·N분 읽기·섹션 칩, Reading은 `BOOK DATA` 박스, 하단 태그 · `◀ PREV / NEXT ▶` 페이저 · 목록으로 버튼 |
| 본문 (prose) | `_prose.scss` | h2 앞 `▸ ` + 하단 실선, h3 시안, ul 마커 `■` 노랑, 인용문 좌측 8px 핑크 바, 이미지 테두리+그림자, 코드블록 상단에 언어 라벨 바(`C`, `C++`, `ASM`…) |
| 빈 상태 | `.empty-state` | `NO SIGNAL…` 깜빡임 |
| 방명록 | `guestbook.html`, `_includes/giscus.html`, `.guestbook` | kicker `SIGNAL STATION · 방명록`, `HOW TO TRANSMIT` 안내 박스 + giscus(GitHub Discussions, Announcements 카테고리의 `guestbook` 글타래) 위젯. 설정은 `_config.yml`의 `giscus:`. 미설정 시 `SIGNAL OFFLINE` 빈 상태 |
| giscus 테마 | `assets/css/giscus.css` | iframe 내부라 사이트 토큰을 못 씀 → 토큰 값을 **직접 복사**. 토큰 변경 시 이 파일도 함께 수정. 각진 모서리, 4px 테두리 + 하드 그림자, 픽셀 폰트 버튼 |
| 읽기 진행 게이지 | `.scroll-progress` (헤더, 포스트에서만) | 헤더 하단 테두리 위에 12px 채움 + 4px 간격의 세그먼트 바. 16px 단위로만 차오름. 섹션색 |
| 404 | `404.html` | 큰 핑크 `404` + `GAME OVER` + `▶ CONTINUE` 버튼 |
| 푸터 | `_includes/footer.html` | 픽셀 캐럿 + ©, GitHub · `맨 위로 ▲` |

---

## 7. 카피 · 보이스

- **UI 라벨은 게임/우주 용어 + 영문 대문자**: `SECTOR 01`, `BOOK DATA`, `NO SIGNAL…`, `GAME OVER`, `CONTINUE`, `BOOTING`.
- **방향/진행은 기호**: `◀` `▶` `▲` `▸` `■`.
- **설명 문장은 한국어, 친근한 존댓말**: "아직 이 구역에 도착한 글이 없어요. 곧 착륙할 예정입니다."
- 우주 은유(구역·착륙·우주 저편·신호)는 가볍게, 과하지 않게.

---

## 8. 모션

| 애니메이션 | 대상 | 설정 |
|---|---|---|
| `twinkle` | 근경 별 | 4s `steps(4)` alternate |
| `fly` | 우주선 | 38s linear 무한 |
| `flicker` | 우주선 불꽃 | .4s `steps(2)` |
| `blink` | 커서, NO SIGNAL | 1–1.2s `steps(2, start)` |

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
```

새 스타일은 역할에 맞는 파일에 추가하고, 재사용될 패턴이면 `_pixel.scss`/`_components.scss`로 올립니다.

---

## 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-11-12 | 최초 작성 — space + pixel-art 테마(UI 리팩터 #1) 기준으로 정리 |
| 2026-11-12 | 방명록(giscus + 픽셀 테마) 추가, 스크롤 효과(pixel-rise reveal, 읽기 진행 게이지, 별 패럴랙스) 추가, 모션 토큰 `--dur-reveal`·`--ease-reveal` 추가 |
