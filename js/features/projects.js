/**
 * GitHub 프로젝트 기능.
 *
 * 요청을 시작하고, 그 결과를 상태로 옮기고, 상태에 맞는 화면을 그린다.
 * 데이터를 가져오는 일은 github-api.js가 맡고, 이 파일은 그것을
 * 언제 부르고 결과를 어떤 상태로 옮길지만 정한다.
 *
 *   loadProjects → status: 'loading' → 요청 → success / empty / error → renderProjects
 */
import { getState, setState } from '../store.js';
import { $, $$, escapeHtml } from '../dom.js';
import {
  fetchRepositories,
  normalizeRepository,
  selectPortfolioRepositories,
} from '../github-api.js';

const GITHUB_USERNAME = 'b0e2';
const ALL_LANGUAGES = 'all';

const ERROR_MESSAGES = {
  403: '시간당 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
  404: `GitHub 사용자 ${GITHUB_USERNAME}의 저장소를 찾을 수 없습니다.`,
  default: '프로젝트를 불러올 수 없습니다.',
};

let filtersElement = null;
let statusElement = null;
let gridElement = null;

/** 필터 버튼은 언어 목록이 달라졌을 때만 다시 만든다. 매번 새로 그리면 포커스가 날아간다. */
let renderedLanguageKey = '';

const setProjects = (changes) =>
  setState(({ projects }) => ({ projects: { ...projects, ...changes } }));

const resolveErrorMessage = ({ status }) => ERROR_MESSAGES[status] ?? ERROR_MESSAGES.default;

/** 선택한 언어에 해당하는 항목만 남긴다. 원본 목록은 그대로 두고 볼 것만 골라 낸다. */
const selectByLanguage = (items, language) =>
  language === ALL_LANGUAGES ? items : items.filter((item) => item.language === language);

/**
 * 요청 한 번의 전 과정.
 * 시작할 때 loading으로 바꾸고, 끝나면 결과에 따라 세 갈래로 나뉜다.
 */
const loadProjects = async () => {
  setProjects({ status: 'loading', errorMessage: '' });

  try {
    const repositories = await fetchRepositories(GITHUB_USERNAME);
    const items = selectPortfolioRepositories(repositories).map(normalizeRepository);

    setProjects({ status: items.length > 0 ? 'success' : 'empty', items });
  } catch (error) {
    setProjects({ status: 'error', items: [], errorMessage: resolveErrorMessage(error) });
  }
};

const handleStatusClick = (event) => {
  if (!event.target.closest('#projects-retry')) return;

  loadProjects();
};

const handleFilterClick = (event) => {
  const button = event.target.closest('.filter-btn');

  if (!button) return;

  setProjects({ language: button.dataset.language });
};

export const initProjects = () => {
  filtersElement = $('#project-filters');
  statusElement = $('#projects-status');
  gridElement = $('#projects-grid');

  // 재시도 버튼과 필터 버튼은 렌더될 때마다 새로 생기므로, 컨테이너에서 위임해 받는다.
  statusElement.addEventListener('click', handleStatusClick);
  filtersElement.addEventListener('click', handleFilterClick);

  loadProjects();
};

const createCardMarkup = ({ name, description, language, stars, url }) => `
  <article class="project-card">
    <h3 class="project-card__title">
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>
    </h3>
    <p class="project-card__description">${escapeHtml(description)}</p>
    <p class="project-card__meta">
      <span class="project-card__language">${escapeHtml(language)}</span>
      <span class="project-card__stars"><span aria-hidden="true">★</span> ${stars}<span class="sr-only">개의 스타</span></span>
    </p>
  </article>
`;

const createStateMarkup = (status, errorMessage) => {
  if (status === 'loading') {
    return `<div class="state"><span class="spinner" aria-hidden="true"></span><p>프로젝트를 불러오는 중입니다.</p></div>`;
  }

  if (status === 'error') {
    return `<div class="state">
      <p>${escapeHtml(errorMessage)}</p>
      <button class="btn btn--ghost" id="projects-retry" type="button">다시 시도</button>
    </div>`;
  }

  return `<div class="state"><p>표시할 프로젝트가 없습니다.</p></div>`;
};

const renderFilters = ({ status, items, language }) => {
  const hasFilters = status === 'success' && items.length > 0;

  filtersElement.hidden = !hasFilters;

  if (!hasFilters) {
    filtersElement.innerHTML = '';
    renderedLanguageKey = '';
    return;
  }

  const languages = [ALL_LANGUAGES, ...new Set(items.map((item) => item.language))];
  const languageKey = languages.join('|');

  if (languageKey !== renderedLanguageKey) {
    filtersElement.innerHTML = languages
      .map(
        (value) =>
          `<button class="filter-btn" type="button" data-language="${escapeHtml(value)}">${
            value === ALL_LANGUAGES ? '전체' : escapeHtml(value)
          }</button>`,
      )
      .join('');
    renderedLanguageKey = languageKey;
  }

  $$('.filter-btn', filtersElement).forEach((button) => {
    const isActive = button.dataset.language === language;

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

/** 상태를 받아 화면에만 반영한다. */
export const renderProjects = ({ projects }) => {
  const { status, items, language, errorMessage } = projects;
  const visibleItems = status === 'success' ? selectByLanguage(items, language) : [];

  renderFilters(projects);

  gridElement.innerHTML = visibleItems.map(createCardMarkup).join('');

  // 보여 줄 카드가 없을 때만 상태 영역이 자리를 대신한다.
  statusElement.innerHTML =
    status === 'idle' || visibleItems.length > 0 ? '' : createStateMarkup(status, errorMessage);
};
