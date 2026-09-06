# 포트폴리오

HTML, CSS, JavaScript로 만든 반응형 포트폴리오입니다. 외부 UI·JavaScript 라이브러리와 별도 빌드 단계 없이, 테마·내비게이션·프로젝트 목록·문의 폼을 기능별 모듈로 나눠 구성했습니다.

- 배포 URL: https://b0e2.github.io/b1-1/
- 저장소: https://github.com/b0e2/b1-1

## 사용 기술

| 구분 | 내용 |
| --- | --- |
| 마크업 | HTML5 시맨틱 태그 |
| 스타일 | CSS 변수, Flexbox, Grid, 모바일 퍼스트 반응형 |
| 스크립트 | ES Modules, DOM API, Fetch API, Intersection Observer |
| 데이터 | GitHub REST API, localStorage |
| 폼 전송 | Formspree |
| 폰트 | Space Grotesk, Noto Sans KR, IBM Plex Mono |
| 배포 | GitHub Pages |

## 주요 기능

| 기능 | 동작 | 구현 |
| --- | --- | --- |
| 다크 모드 | 토글로 전환하고 `localStorage`에 저장해 새로고침 후에도 유지 | `js/features/theme.js` |
| 햄버거 메뉴 | 768px 미만에서 버튼 노출, `classList.toggle('active')`로 열고 닫음, Escape로 닫힘 | `js/features/navigation.js` |
| 부드러운 스크롤 | 앵커 기본 이동을 막고 `scrollIntoView`로 이동한 뒤 대상 섹션에 포커스 | `js/features/navigation.js` |
| 스크롤 탑 버튼 | 320px를 넘으면 나타나고 클릭 시 맨 위로 | `js/features/navigation.js` |
| 헤더 배경 전환 | 60px를 넘으면 헤더에 배경과 경계선 | `js/features/navigation.js` |
| 스크롤 애니메이션 | Intersection Observer(threshold `0.2`)로 등장, 전부 나타나면 관찰 해제 | `js/features/scroll-reveal.js` |
| 프로젝트 목록 | GitHub API 응답을 카드로 렌더, 로딩·성공·에러·빈 상태 구분 | `js/features/projects.js` |
| 응답 캐시 | 성공 응답을 10분간 `localStorage`에 보관, 요청 실패 시 대체 표시 | `js/github-api.js` |
| 폼 유효성 검사 | 필수값·이메일 형식·메시지 길이를 검사하고 필드 옆에 오류 표시 | `js/features/contact-form.js` |
| 폼 실제 전송 | Formspree로 POST, 전송 중에는 버튼을 잠가 중복 제출 차단 | `js/features/contact-form.js` |

보너스 과제는 **언어별 필터링**, **Hero 타이핑 효과**, **시스템 다크 모드 감지(`prefers-color-scheme`)**, **폼 실제 전송(Formspree)** 네 가지를 모두 구현했습니다.

## 상태 → 렌더링 흐름

상태는 `js/store.js` 한 곳에 모으고, 흐름은 항상 한 방향입니다.

```
이벤트 → setState → 구독자에게 통지 → render → DOM
```

`main.js`가 렌더러를 구독시키는 조립 지점이고, 각 기능은 자기 상태와 렌더를 스스로 소유합니다.

```js
// js/main.js
const renderApp = (state) => {
  renderTheme(state);
  renderNavigation(state);
  renderProjects(state);
  renderContactForm(state);
};

subscribe(renderApp);
```

### 1. 다크 모드

```js
// 이벤트          js/features/theme.js
toggleButton.addEventListener('click', handleToggleClick);

// 상태 변경
const handleToggleClick = () => {
  const { theme } = getState();
  applyTheme(theme === 'dark' ? 'light' : 'dark');  // setState + localStorage 저장
};

// 렌더
export const renderTheme = ({ theme }) => {
  document.documentElement.dataset.theme = theme;   // CSS 변수 전체가 교체된다
};
```

### 2. 프로젝트 API

```js
// 이벤트(초기화·재시도)  js/features/projects.js
const loadProjects = async ({ forceRefresh = false } = {}) => {
  setProjects({ status: 'loading' });                 // 상태 변경 ①

  try {
    const { repositories } = await loadRepositories(GITHUB_USERNAME, { forceRefresh });
    const items = sortByRecentPush(
      selectPortfolioRepositories(repositories).map(normalizeRepository),
    );

    setProjects({ status: items.length > 0 ? 'ready' : 'empty', items });  // 상태 변경 ②
  } catch (error) {
    setProjects({ status: 'error', items: [], errorMessage: resolveErrorMessage(error) });
  }
};

// 렌더 — status 하나로 그릴 화면이 정해진다
export const renderProjects = ({ projects: { status, items, language } }) => { /* ... */ };
```

### 3. 폼 유효성 검사

```js
// 이벤트          js/features/contact-form.js
inputs[field].addEventListener('input', handleFieldInput);
inputs[field].addEventListener('blur', handleFieldBlur);

// 상태 변경 — 한 번 떠난(touched) 필드만 글자마다 재검증한다
setForm({
  values: nextValues,
  errors: { ...errors, [name]: touched[name] ? validateField(name, value) : '' },
});

// 렌더
errorElements[field].textContent = message;
input.setAttribute('aria-invalid', String(Boolean(message)));
```

### 4. 언어 필터

```js
// 이벤트(위임)     js/features/projects.js
filtersElement.addEventListener('click', handleFilterClick);

// 상태 변경
setProjects({ language: button.dataset.language });

// 렌더 — 원본 items는 그대로 두고 볼 것만 골라 낸다
const selectByLanguage = (items, language) =>
  language === ALL_LANGUAGES ? items : items.filter((item) => item.language === language);
```

## 프로젝트 상태 UI

`Projects` 섹션은 아래 네 화면 중 하나만 표시합니다.

| 상태 | 조건 | 화면 |
| --- | --- | --- |
| `loading` | 요청 진행 중 | 스피너 + "저장소를 불러오는 중입니다." + 스켈레톤 카드 3장 |
| `ready` | 응답 1건 이상 | 카드 그리드 + 언어 필터 칩 |
| `empty` | 응답 0건 | "표시할 프로젝트가 없습니다." |
| `empty` | 필터 결과 0건 | "선택한 언어에 해당하는 프로젝트가 없습니다." + 필터 초기화 |
| `error` | 요청 실패 | 사유 문구 + 다시 시도 버튼 |

`STATE DEMO` 컨트롤로 추가 요청 없이 네 화면을 확인할 수 있습니다. 선택값은 저장하지 않으므로 새로고침하면 실데이터로 돌아옵니다.

## 에러 처리

### GitHub API

인증 없이 호출하므로 **시간당 60회** 제한이 있습니다. 짧은 시간에 반복 새로고침하면 `403`이 돌아옵니다.

| 응답 | 화면 |
| --- | --- |
| `403` | "시간당 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요." |
| `404` | "GitHub 사용자 b0e2의 저장소를 찾을 수 없습니다." |
| 그 외·네트워크 실패 | "프로젝트를 불러올 수 없습니다." |

한도를 넘겨도 저장해 둔 응답이 있으면 오류 화면 대신 그 목록을 보여 주고, 최신이 아닐 수 있다는 안내와 새로고침 버튼을 함께 붙입니다.

```js
// js/github-api.js — 캐시 우선순위
유효한 캐시가 있으면            → 요청하지 않고 그대로 사용
없거나 만료됐으면               → 요청하고 성공 시 캐시 갱신
요청이 실패했는데 캐시가 있으면 → 만료됐더라도 그것으로 대체 (isStale)
요청도 실패하고 캐시도 없으면   → error 상태
```

### 폼 전송

| 응답 | 화면 |
| --- | --- |
| `422` | "입력값을 다시 확인해 주세요." |
| `429` | "잠시 뒤에 다시 보내 주세요. 짧은 시간에 너무 많이 전송되었습니다." |
| 그 외·네트워크 실패 | "메시지를 보내지 못했습니다. 잠시 후 다시 시도해 주세요." |

실패해도 입력값은 지우지 않습니다. 보내지 못한 것은 네트워크 사정이지 입력의 잘못이 아니므로, 같은 내용을 다시 쓰게 만들 이유가 없습니다.

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
| 메시지 최소 길이 | 공백 제외 `10자` |
| 브레이크포인트 | `768px` · `1024px` · `1180px` |

### localStorage

| 키 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `portfolio-theme` | `light` \| `dark` | `js/features/theme.js` |
| `portfolio-repos:b0e2` | `{ savedAt, repositories }` | `js/github-api.js` |

테마는 저장값을 먼저 사용하고, 값이 없을 때만 시스템 설정(`prefers-color-scheme`)을 따릅니다. 모션 축소 설정에서는 타이핑, 커서 blink, 등장 이동과 부드러운 이동을 멈춥니다.

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
```

브라우저가 직접 연결하는 진입점은 `index.html`, `css/style.css`, `js/main.js` 셋뿐입니다. 나머지는 CSS `@import`와 JavaScript `import`로 연결됩니다.

## 설계 결정

| 결정 | 이유 |
| --- | --- |
| HTML·CSS·JS 파일 분리 | 구조·표현·동작이 서로 다른 이유로 바뀐다. 한 파일을 고칠 때 나머지를 읽지 않아도 된다 |
| 기능별 모듈 (`features/`) | 한 기능의 이벤트·상태 변경·렌더가 한 파일에 모여, 고칠 때 열 파일이 하나다 |
| 상태를 `store.js` 객체로 | 흩어진 전역 변수는 서로 어긋난다. 현재 값과 변경 지점이 한곳에 있어야 화면이 왜 이렇게 그려졌는지 추적할 수 있다 |
| CSS 변수(`:root`) | 다크 테마와 반응형 구간이 같은 역할의 변수 값만 바꾼다. 테마 전환이 `data-theme` 하나로 끝난다 |
| `addEventListener` | 같은 요소에 여러 핸들러를 붙이거나 뗄 수 있고, 마크업에 로직이 섞이지 않는다 |
| 모바일 퍼스트 | 좁은 화면을 기본으로 두면 `min-width`에서 규칙을 더하기만 하면 된다. 넓은 화면부터 쓰면 작은 화면에서 되돌리는 규칙이 쌓인다 |

### 시맨틱 태그 선택 기준

| 태그 | 쓴 곳 | 기준 |
| --- | --- | --- |
| `header` / `footer` | 사이트 머리말·꼬리말 | 페이지 전체에 걸치는 영역 |
| `nav` | 주요 메뉴 | 다른 곳으로 가는 링크 묶음 |
| `main` | 본문 전체 | 페이지당 하나, 반복되지 않는 핵심 내용 |
| `section` | Hero·About·Skills·Projects·Contact | 제목을 가진 주제 단위 (`aria-labelledby`로 연결) |
| `article` | 기술 스택 카드, 프로젝트 카드 | 떼어 놓아도 그 자체로 말이 되는 단위 |
| `figure` / `figcaption` | 프로필 사진 | 설명이 붙는 이미지 |
| `dl` / `dt` / `dd` | About 지표, 성공 패널 요약 | 이름과 값의 짝 |

### Flexbox와 Grid

| 방식 | 쓴 곳 | 이유 |
| --- | --- | --- |
| Flexbox | 내비게이션, 툴바, 태그 칩, 푸터 | 한 방향으로 흐르고 항목 수가 유동적이다. 로고와 메뉴를 양 끝으로 미는 `space-between`이 한 줄로 끝난다 |
| Grid | Hero, Skills, Projects, 폼 | 행과 열이 함께 바뀐다. 특히 Projects는 미디어쿼리 없이 컨테이너 폭만으로 열 수가 정해져야 한다 |

```css
/* css/layout.css — 카드 열 수를 폭이 스스로 정한다 */
.projects__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18.75rem, 100%), 1fr));
}
```

### 배열 메서드

```js
// filter — archived 저장소를 걸러 낸다              js/github-api.js
repositories.filter(({ archived }) => !archived)

// map — 응답 객체를 화면에 쓸 필드로 바꾼다          js/features/projects.js
selectPortfolioRepositories(repositories).map(normalizeRepository)

// map — 그 배열을 템플릿 리터럴로 카드 HTML로 바꾼다
gridElement.innerHTML = visibleItems.map(createCardMarkup).join('');

// forEach — 기존 요소의 상태만 갱신한다 (반환값이 필요 없다)
$$('.filter-btn', filtersElement).forEach((button) => {
  button.classList.toggle('is-active', button.dataset.language === language);
});
```

`normalizeRepository`는 구조분해 할당으로 필요한 필드만 꺼내고, `stargazers_count` 같은 API 표기를 화면에서 쓸 이름으로 바꿉니다.

```js
export const normalizeRepository = ({
  id, name, description, language, fork,
  stargazers_count: stars,
  html_url: url,
  pushed_at: pushedAt,
}) => ({ /* ... */ });
```

## 실행 방법

ES Modules를 사용하므로 `file://`가 아닌 로컬 HTTP 주소로 열어야 합니다. VS Code에서는 Live Server로 `index.html`을 엽니다.

Live Server를 쓰지 않을 때의 대안입니다.

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

| 데스크톱 라이트 · 1440px | 데스크톱 다크 · 1440px |
| --- | --- |
| ![데스크톱 라이트 화면](.github/screenshots/desktop-light.png) | ![데스크톱 다크 화면](.github/screenshots/desktop-dark.png) |

| 모바일 다크 · 390px |
| --- |
| ![모바일 다크 화면](.github/screenshots/mobile-dark.png) |

프로젝트 언어와 최근 push일은 촬영 시점의 응답을 기준으로 합니다.
