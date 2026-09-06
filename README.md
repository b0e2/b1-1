# 정빈 포트폴리오

HTML, CSS, JavaScript로 만든 반응형 포트폴리오입니다. 테마, 내비게이션, 프로젝트 목록, 문의 폼을 기능별 모듈로 구성했습니다.

- 배포 URL: https://b0e2.github.io/b1-1/
- 저장소: https://github.com/b0e2/b1-1

> 현재 릴리스 전이라 공개 URL에는 이전 화면이 표시됩니다. 이 문장은 릴리스 후 삭제합니다.

## 사용 기술

| 구분 | 내용 |
| --- | --- |
| 마크업 | HTML5 시맨틱 태그 |
| 스타일 | CSS 변수, Flexbox, Grid, 모바일 퍼스트 반응형 |
| 스크립트 | ES Modules, DOM API, Fetch API |
| 폰트 | Space Grotesk, Noto Sans KR, IBM Plex Mono |
| 배포 | GitHub Pages |

외부 UI·JavaScript 라이브러리와 별도 빌드 단계는 없습니다.

## 폴더 구조

```text
.
├── index.html
├── css/
│   ├── style.css        # CSS 진입점
│   ├── tokens.css       # 색상·글꼴·간격 토큰
│   ├── base.css         # reset과 기본 요소
│   ├── layout.css       # 컨테이너와 반응형 배치
│   ├── components.css   # 공통 컴포넌트
│   ├── sections.css     # Hero·About·Skills·Footer
│   ├── projects.css     # 프로젝트 카드·필터·상태
│   └── contact.css      # 문의 폼과 성공 패널
├── js/
│   ├── main.js          # 초기화와 렌더 구독
│   ├── store.js         # 공유 상태
│   ├── dom.js           # DOM 공통 함수
│   ├── github-api.js    # 저장소 요청·정규화·캐시
│   └── features/
│       ├── theme.js
│       ├── navigation.js
│       ├── scroll-reveal.js
│       ├── typing.js
│       ├── projects.js
│       └── contact-form.js
├── images/
│   └── profile.jpg
└── .github/screenshots/
    ├── desktop-light.png
    ├── desktop-dark.png
    └── mobile-dark.png
```

브라우저가 직접 연결하는 진입점은 `index.html`, `css/style.css`, `js/main.js`입니다. 내부 파일은 CSS `@import`와 JavaScript `import`로 연결됩니다.

## 실행 방법

ES Modules를 사용하므로 `file://`가 아닌 로컬 HTTP 주소로 열어야 합니다.

VS Code에서는 Live Server로 `index.html`을 열어 로컬 HTTP 주소에 접속합니다.

다음 명령은 Live Server를 사용하지 않을 때의 대안입니다.

```bash
python3 -m http.server 8000
```

저장소 루트에서 실행한 뒤 http://127.0.0.1:8000 에 접속합니다.

## 배포

GitHub Pages에서 `main` 브랜치의 `/ (root)`를 서비스합니다.

1. 저장소 Settings의 Pages 메뉴를 연다
2. Source를 `Deploy from a branch`로 선택한다
3. Branch는 `main`, 폴더는 `/ (root)`로 저장한다
4. 배포가 끝나면 공개 URL에서 기능과 자산 경로를 확인한다

## 스크린샷

### 데스크톱 라이트 · 1440px

![데스크톱 라이트 화면](.github/screenshots/desktop-light.png)

### 데스크톱 다크 · 1440px

![데스크톱 다크 화면](.github/screenshots/desktop-dark.png)

### 모바일 다크 · 390px

![모바일 다크 화면](.github/screenshots/mobile-dark.png)

프로젝트 언어와 최근 push일은 촬영 시점의 응답을 기준으로 합니다.

## 동작 기준값

| 항목 | 값 |
| --- | --- |
| 헤더 배경 전환 | `scrollY >= 60px` |
| 맨 위로 버튼 | `scrollY > 320px` |
| 앵커 이동 보정 | `72px` |
| 등장 효과 | Intersection Observer threshold `0.2` |
| Hero 타이핑 | 입력 `70ms` · 삭제 `34ms` · 대기 `1.6s` |
| Hero 커서 | blink `1s` |
| 프로젝트 캐시 | `10분` |
| 브레이크포인트 | `768px` · `1024px` · `1180px` |

테마는 저장값을 먼저 사용하고 값이 없을 때만 시스템 설정을 따릅니다. 모션 축소 설정에서는 타이핑, 커서 blink, 등장 이동과 부드러운 이동을 멈춥니다.

## 주요 동작

### 프로젝트 데이터

`b0e2`의 공개 저장소를 한 번 요청해 `pushed_at` 최신 순으로 표시합니다. fork는 포함하고 archived 저장소는 제외하며, `sallae-mallae-app`과 `ai-debate-front`의 언어만 Dart로 보정합니다. 언어가 없으면 `기타`로 표시합니다.

### 응답 캐시

성공한 응답은 사용자명이 포함된 키와 저장 시각으로 브라우저 저장소에 보관합니다. 10분 안의 캐시는 요청 없이 사용하고, 새 요청이 실패하면 이전 캐시를 표시하면서 최신 데이터가 아닐 수 있음을 알립니다. 새로고침 버튼은 캐시를 건너뛰고 다시 요청합니다.

### 프로젝트 상태

Projects는 `loading`, `ready`, `error`, `empty` 중 하나만 표시합니다. STATE DEMO는 추가 요청 없이 네 화면을 확인하며 새로고침하면 실데이터로 돌아갑니다.

### 문의 폼

이름과 이메일은 필수이고 메시지는 공백을 제외해 10자 이상이어야 합니다. 오류는 필드를 벗어난 뒤부터 표시하며 제출할 때 전체 값을 다시 검사합니다. 성공하면 이름과 이메일을 담은 패널을 표시합니다.

## 설계 결정

### 시맨틱 구조

페이지 영역은 `header`, `nav`, `main`, `section`, `article`, `footer`로 구분했습니다. 각 섹션은 제목과 `aria-labelledby`로 연결하고 카드와 프로필에는 내용에 맞는 태그를 사용했습니다.

### 디자인 토큰

색상, 글꼴, 간격과 상태 값은 `tokens.css`의 CSS 변수로 관리합니다. 다크 테마와 반응형 구간은 같은 역할의 변수 값만 바꿉니다.

### Flexbox와 Grid

한 방향으로 흐르는 내비게이션, 툴바와 칩은 Flexbox를 사용합니다. 행과 열이 함께 바뀌는 Hero, Skills와 Projects는 Grid를 사용합니다.

### 이벤트 연결

이벤트는 `addEventListener`로 기능 모듈의 초기화 함수에서 연결합니다. 동적으로 바뀌는 필터와 상태 버튼은 부모 요소에서 한 번 처리하며 HTML에는 인라인 `onclick`을 두지 않습니다.
`addEventListener`는 같은 요소에 여러 핸들러를 연결하거나 해제할 수 있고 마크업에 로직을 섞지 않습니다.

### 상태 관리

테마, 내비게이션, 프로젝트와 폼처럼 여러 이벤트가 읽고 화면을 다시 그리는 값은 `store.js`에 둡니다. 타이핑 위치와 등장 효과처럼 한 기능 안에서 끝나는 값은 해당 모듈이 관리합니다.
관련 값을 한 객체에 모아 현재 값과 변경 지점을 한곳에서 확인할 수 있습니다.

### 모바일 퍼스트

기본 스타일은 한 열로 작성하고 `min-width` 구간에서 열과 간격을 늘립니다. 브레이크포인트 규칙을 `768px`, `1024px`, `1180px` 순서로 누적합니다.
좁은 화면을 기본으로 두면 `min-width`에서 규칙을 추가하면 되지만 넓은 화면부터 작성하면 작은 화면에서 되돌리는 규칙이 쌓입니다.

### 파일 분리

`features/`의 각 파일은 한 기능의 이벤트, 상태 변경과 렌더를 함께 맡습니다. CSS도 공통 컴포넌트, 정적 섹션, Projects와 Contact로 나눠 관련 기능 파일과 경계를 맞췄습니다.

## 데이터 흐름

`github-api.js`는 요청, 응답 정규화와 캐시를 맡고 전역 상태를 직접 바꾸지 않습니다. `features/projects.js`가 결과를 상태로 옮겨 화면을 선택합니다.

저장소 배열은 `filter`로 archived 항목을 제외하고 `map`으로 카드 필드를 만듭니다. `forEach`는 필터 버튼처럼 기존 요소의 상태만 갱신할 때 사용합니다. 요청 실패는 `try/catch`에서 `error` 상태로 전달합니다.
