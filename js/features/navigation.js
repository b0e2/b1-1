/**
 * 내비게이션 기능.
 *
 * 햄버거 메뉴와 앵커 이동을 담당한다. 등장 애니메이션은 성격이 다른
 * 일시 효과라 features/scroll-reveal.js가 따로 맡는다.
 *
 *   click → 핸들러 → setState → (구독) → renderNavigation → DOM
 */
import { getState, setState } from '../store.js';
import { $, $$ } from '../dom.js';

/** 768px부터는 메뉴가 헤더 안으로 들어오므로 햄버거 상태를 유지할 이유가 없다. */
const DESKTOP_QUERY = '(min-width: 768px)';

let header = null;
let menu = null;
let menuToggle = null;

/** navigation 조각만 바꾼다. 나머지 상태는 그대로 둔다. */
const setNavigation = (changes) =>
  setState(({ navigation }) => ({ navigation: { ...navigation, ...changes } }));

const closeMenu = () => {
  if (!getState().navigation.menuOpen) return;

  setNavigation({ menuOpen: false });
};

const handleMenuToggleClick = () => {
  const { menuOpen } = getState().navigation;

  setNavigation({ menuOpen: !menuOpen });
};

/**
 * 앵커 링크의 기본 점프를 막고 부드럽게 이동시킨다.
 * 이동 뒤 대상 섹션으로 포커스를 옮겨 키보드 사용자도 같은 위치에서 이어갈 수 있게 한다.
 */
const handleAnchorClick = (event) => {
  const targetId = event.currentTarget.getAttribute('href').slice(1);
  const target = document.getElementById(targetId);

  if (!target) return;

  event.preventDefault();
  closeMenu();

  target.scrollIntoView({ behavior: 'smooth' });
  target.focus({ preventScroll: true });
};

/** 데스크톱 폭으로 넓어지면 열려 있던 모바일 메뉴 상태를 정리한다. */
const handleDesktopChange = (event) => {
  if (event.matches) closeMenu();
};

export const initNavigation = () => {
  header = $('#site-header');
  menu = $('#nav-menu');
  menuToggle = $('#nav-toggle');

  menuToggle.addEventListener('click', handleMenuToggleClick);

  $$('a[href^="#"]:not(.skip-link)').forEach((anchor) => {
    anchor.addEventListener('click', handleAnchorClick);
  });

  window.matchMedia(DESKTOP_QUERY).addEventListener('change', handleDesktopChange);
};

/** 상태를 받아 화면에만 반영한다. */
export const renderNavigation = ({ navigation: { menuOpen } }) => {
  menu.classList.toggle('active', menuOpen);
  menuToggle.setAttribute('aria-expanded', String(menuOpen));
  menuToggle.setAttribute('aria-label', menuOpen ? '메뉴 닫기' : '메뉴 열기');
};
