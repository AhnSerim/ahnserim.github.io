# CLAUDE.md

Jekyll 기반 개인 블로그 (serim.space, GitHub Pages). 커스텀 레이아웃/SCSS, 외부 테마 없음.

## 디자인 작업 규칙 (필수)

- 디자인·스타일·레이아웃·UI 문구를 수정하거나 새 페이지/컴포넌트를 만들기 전에 **반드시 [`DESIGN.md`](DESIGN.md)를 먼저 읽고** 그 원칙·토큰·컴포넌트 패턴을 따른다.
- 색·폰트·간격은 `_sass/_tokens.scss`의 CSS 변수만 사용한다. 새 값이 필요하면 토큰을 추가하고 `DESIGN.md`에도 기록한다.
- 요청이 `DESIGN.md`의 원칙과 충돌하면(예: 둥근 모서리, 라이트 테마, 블러 그림자) 바로 구현하지 말고 충돌 사실을 알린 뒤 컨셉을 바꿀지 확인한다.
- 디자인 컨셉·토큰·컴포넌트가 바뀌는 변경을 했다면 같은 커밋에서 `DESIGN.md`를 갱신하고 하단 "변경 이력"에 한 줄 추가한다.

## 기타

- 포스트 front matter: `section: study | reading`, `tags`, `description`, Reading 글은 `book: {title, author}`, `rating: 1–5`.
- 기존 URL(`/:year/:month/:day/:title`)은 바꾸지 않는다.
