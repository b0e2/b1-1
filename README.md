# 나를 소개하는 웹페이지

외부 라이브러리 없이 순수 HTML, CSS, JavaScript만으로 만든 반응형 포트폴리오입니다.
프레임워크 없이 **사용자 이벤트 → 상태 변경 → 화면 업데이트** 흐름을 직접 구현하는 것을 목표로 합니다.

- 배포 URL: (배포 후 추가)
- 저장소: https://github.com/b0e2/b1-1

## 사용 기술

| 구분 | 내용 |
| --- | --- |
| 마크업 | HTML5 시맨틱 태그 |
| 스타일 | CSS 변수, Flexbox, Grid, 모바일 퍼스트 반응형 |
| 스크립트 | ES Modules, DOM API, Fetch API |
| 폰트 | Google Fonts (Noto Sans KR, DM Sans) |
| 배포 | GitHub Pages |

React, Vue, jQuery, Bootstrap, Tailwind 등 외부 UI/JS 라이브러리는 사용하지 않았습니다.

## 폴더 구조

```
.
├── index.html
├── css/
│   ├── style.css        # 진입점. 아래 파일들을 순서대로 import
│   ├── tokens.css       # 색상·타이포·간격·그림자 토큰 (라이트/다크)
│   ├── base.css         # reset, 요소 기본값, 접근성 보조
│   ├── layout.css       # 헤더·섹션·그리드 골격, 반응형
│   └── components.css   # 버튼·카드·폼·상태 UI
├── js/
│   ├── main.js          # 조립 지점
│   ├── store.js         # 전역 상태와 구독
│   ├── dom.js           # DOM 헬퍼
│   ├── github-api.js    # GitHub API 호출과 정규화
│   └── features/        # 기능별 모듈 (상태·이벤트·렌더를 함께 소유)
├── images/              # 사이트에 쓰이는 이미지
└── .github/screenshots/ # README 전용 캡처
```

## 실행 방법

ES Modules는 `file://`에서 CORS 정책 때문에 로드되지 않습니다.
**반드시 로컬 HTTP 서버로 열어야 합니다.**

1. VS Code에서 Live Server 확장을 설치합니다.
2. `index.html`에서 우클릭 → **Open with Live Server**
3. 브라우저가 `http://127.0.0.1:5500` 형태의 주소로 페이지를 엽니다.

## 스크린샷

(배포 후 추가)

## 동작 기준값

| 항목 | 값 |
| --- | --- |
| 헤더 배경 전환 | `scrollY >= 60px` |
| 맨 위로 버튼 노출 | `scrollY >= 300px` |
| 스크롤 등장 효과 | `IntersectionObserver` threshold `0.2` |

## 설계 노트

(구현 진행하며 추가)
