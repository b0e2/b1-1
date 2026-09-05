/**
 * GitHub API 계층.
 *
 * 데이터를 가져오고 화면이 쓰기 좋은 모양으로 다듬는 일만 한다.
 * 전역 상태를 읽지도 바꾸지도 않으므로, 이 파일만 따로 떼어 테스트하거나
 * 다른 화면에서 재사용할 수 있다. 상태를 언제 어떻게 바꿀지는 부르는 쪽이 정한다.
 *
 * 화면에 맞춘 판단은 여기 두지 않는다. 날짜를 어떤 형식으로 보여 줄지,
 * 언어 칩을 어떤 순서로 세울지, 배지에 무슨 글자를 쓸지는 features/projects.js가 정한다.
 */
const API_ORIGIN = 'https://api.github.com';

const REQUEST_HEADERS = { Accept: 'application/vnd.github+json' };

const FALLBACK_DESCRIPTION = '아직 설명이 없는 저장소입니다.';

/**
 * 언어 판정이 비어 있는 저장소가 모이는 자리.
 * 화면과 필터 칩이 같은 문자열을 써야 하므로 밖에서도 참조할 수 있게 내보낸다.
 */
export const FALLBACK_LANGUAGE = '기타';

/**
 * GitHub의 언어 판정은 저장소 파일 구성에서 자동으로 나오기 때문에 실제와
 * 어긋날 수 있다. 아래 두 fork는 Flutter 프로젝트인데 판정 결과가 비어 있어
 * 화면에서 언어를 잃는다. 확인된 저장소만 이름으로 바로잡고, 그 밖의 빈 값은
 * 추측하지 않고 기타로 모은다. 규칙을 넓히면 API가 판정을 고쳤을 때
 * 이 표가 조용히 틀린 값을 덮어쓰게 된다.
 */
const LANGUAGE_OVERRIDES = {
  'sallae-mallae-app': 'Dart',
  'ai-debate-front': 'Dart',
};

/**
 * 저장소 목록을 가져온다.
 * 실패하면 응답 코드를 담은 Error를 던져서, 부르는 쪽이 상황별로 안내를 고를 수 있게 한다.
 */
export const fetchRepositories = async (username) => {
  const endpoint = `${API_ORIGIN}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=60`;
  const response = await fetch(endpoint, { headers: REQUEST_HEADERS });

  if (!response.ok) {
    const error = new Error(`GitHub API 응답 오류 (${response.status})`);

    error.status = response.status;
    throw error;
  }

  return response.json();
};

/** 응답에서 화면에 쓸 값만 뽑고, 비어 있을 수 있는 필드는 대체 텍스트로 채운다. */
export const normalizeRepository = ({
  id,
  name,
  description,
  language,
  fork,
  stargazers_count: stars,
  html_url: url,
  pushed_at: pushedAt,
}) => ({
  id,
  name,
  description: description?.trim() || FALLBACK_DESCRIPTION,
  language: LANGUAGE_OVERRIDES[name] || language || FALLBACK_LANGUAGE,
  isFork: Boolean(fork),
  stars,
  url,
  // 표시 형식은 화면이 정하므로 여기서는 비교 가능한 Date로만 넘긴다.
  pushedAt: new Date(pushedAt),
});

/**
 * fork도 포트폴리오에 싣고 배지로 구분한다. 남의 코드에서 출발한 작업도
 * 무엇을 했는지 보여 주는 기록이기 때문이다.
 * 다만 archived는 읽기 전용으로 멈춘 저장소라 최근 활동 순 목록에 섞지 않는다.
 */
export const selectPortfolioRepositories = (repositories) =>
  repositories.filter(({ archived }) => !archived);

/**
 * 최근에 밀어 넣은 저장소가 위로 온다.
 * 목록의 기준은 `updated_at`이 아니라 `pushed_at`이다. `updated_at`은 설명이나
 * 별표처럼 코드와 무관한 변경으로도 갱신되므로 "최근 작업한 순서"와 어긋난다.
 * 원본을 건드리지 않도록 복사한 뒤 정렬한다.
 */
export const sortByRecentPush = (repositories) =>
  [...repositories].sort((a, b) => b.pushedAt - a.pushedAt);
