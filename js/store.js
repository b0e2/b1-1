/**
 * 애플리케이션의 단일 상태 저장소.
 *
 * 화면에 보이는 모든 것의 근거를 한 객체에 모아 둔다. 상태를 DOM에서
 * 읽어 오거나 여기저기 흩어진 전역 변수로 관리하면, 지금 화면이 왜
 * 이렇게 그려졌는지 추적할 수 없고 값이 서로 어긋나기 시작한다.
 *
 * 흐름은 항상 한 방향이다.
 *   이벤트 → setState → 구독자에게 통지 → render → DOM
 */
let state = {
  // 'light' | 'dark'
  theme: 'light',

  navigation: {
    menuOpen: false,
    isScrolled: false,
    showTopButton: false,
  },

  projects: {
    // 'idle' | 'loading' | 'success' | 'error' | 'empty'
    status: 'idle',
    items: [],
    language: 'all',
    errorMessage: '',
  },

  form: {
    values: { name: '', email: '', message: '' },
    errors: { name: '', email: '', message: '' },
    submitted: false,
  },
};

const listeners = new Set();

/** 현재 상태를 읽는다. 반환값을 직접 수정하지 말고 setState를 쓴다. */
export const getState = () => state;

/**
 * 상태를 바꾸고 구독자에게 알린다.
 * 이전 상태를 받아 바뀔 부분만 돌려주는 함수를 넘기거나, 객체를 바로 넘긴다.
 *
 *   setState({ theme: 'dark' })
 *   setState(({ theme }) => ({ theme: theme === 'dark' ? 'light' : 'dark' }))
 *
 * 기존 객체를 고치지 않고 새 객체로 교체하므로, 변경 전후를 비교할 수 있다.
 */
export const setState = (updater) => {
  const changes = typeof updater === 'function' ? updater(state) : updater;

  state = { ...state, ...changes };
  listeners.forEach((listener) => listener(state));
};

/**
 * 상태가 바뀔 때마다 호출될 함수를 등록하고, 해제 함수를 돌려준다.
 * 구독자는 '무엇이 바뀌었는지'가 아니라 '지금 상태가 무엇인지'만 받는다.
 */
export const subscribe = (listener) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};
