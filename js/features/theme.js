/**
 * 다크 모드 기능.
 *
 * 이 파일 하나에 테마의 초기값 결정, 이벤트 연결, 상태 변경, 화면 반영이
 * 모두 들어 있다. 기능을 고칠 때 이 파일만 열면 되고, 아래로 읽어 내려가면
 * 이벤트에서 화면까지의 흐름이 그대로 이어진다.
 *
 *   click → handleToggleClick → setState → (구독) → renderTheme → DOM
 */
import { getState, setState } from '../store.js';
import { $ } from '../dom.js';

const STORAGE_KEY = 'portfolio-theme';
const THEMES = ['light', 'dark'];

let toggleButton = null;

/** localStorage는 브라우저 설정에 따라 막힐 수 있으므로 실패를 감수한다. */
const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return THEMES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

const writeStoredTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // 저장에 실패해도 이번 방문 동안의 테마 전환은 그대로 동작한다.
  }
};

/*
 * 운영체제의 밝은/어두운 모드. 첫 값을 읽을 때와 도중에 바뀌는 것을 지켜볼 때
 * 같은 객체를 쓰므로 한 번만 만들어 둔다.
 */
const systemScheme = window.matchMedia('(prefers-color-scheme: dark)');

/** 저장된 선택이 최우선이고, 없을 때만 운영체제 설정을 따른다. */
const resolveInitialTheme = () => readStoredTheme() ?? (systemScheme.matches ? 'dark' : 'light');

const applyTheme = (theme) => {
  setState({ theme });
  writeStoredTheme(theme);
};

const handleToggleClick = () => {
  const { theme } = getState();

  applyTheme(theme === 'dark' ? 'light' : 'dark');
};

/**
 * 페이지를 연 채로 운영체제 설정이 바뀌면 화면도 따라간다.
 * 첫 값만 읽고 끝내면 사용자는 새로고침해야 반영되는 이유를 알 수 없다.
 *
 * 다만 직접 고른 값이 있으면 그 선택을 계속 우선한다. 저장하지도 않는다.
 * 여기서 저장하면 사용자가 고르지 않은 값이 저장된 선택으로 남아,
 * 이후 시스템 설정을 따라갈 길이 영영 막힌다.
 */
const handleSystemSchemeChange = ({ matches }) => {
  if (readStoredTheme()) return;

  setState({ theme: matches ? 'dark' : 'light' });
};

export const initTheme = () => {
  toggleButton = $('#theme-toggle');

  setState({ theme: resolveInitialTheme() });
  toggleButton.addEventListener('click', handleToggleClick);
  systemScheme.addEventListener('change', handleSystemSchemeChange);
};

/** 상태를 받아 화면에만 반영한다. 여기서 상태를 바꾸지 않는다. */
export const renderTheme = ({ theme }) => {
  const isDark = theme === 'dark';

  document.documentElement.dataset.theme = theme;
  toggleButton.setAttribute('aria-pressed', String(isDark));
  toggleButton.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
};
