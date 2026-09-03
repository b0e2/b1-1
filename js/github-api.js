/**
 * GitHub API 계층.
 *
 * 데이터를 가져오고 화면이 쓰기 좋은 모양으로 다듬는 일만 한다.
 * 전역 상태를 읽지도 바꾸지도 않으므로, 이 파일만 따로 떼어 테스트하거나
 * 다른 화면에서 재사용할 수 있다. 상태를 언제 어떻게 바꿀지는 부르는 쪽이 정한다.
 */
const API_ORIGIN = 'https://api.github.com';

const REQUEST_HEADERS = { Accept: 'application/vnd.github+json' };

const FALLBACK_DESCRIPTION = '아직 설명이 없는 저장소입니다.';
const FALLBACK_LANGUAGE = 'Other';

/**
 * 저장소 목록을 가져온다.
 * 실패하면 응답 코드를 담은 Error를 던져서, 부르는 쪽이 상황별로 안내를 고를 수 있게 한다.
 */
export const fetchRepositories = async (username) => {
  const endpoint = `${API_ORIGIN}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`;
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
  stargazers_count: stars,
  html_url: url,
}) => ({
  id,
  name,
  description: description?.trim() || FALLBACK_DESCRIPTION,
  language: language || FALLBACK_LANGUAGE,
  stars,
  url,
});

/** 포트폴리오에는 직접 만들어 관리 중인 저장소만 싣는다. */
export const selectPortfolioRepositories = (repositories) =>
  repositories.filter(({ fork, archived }) => !fork && !archived);
