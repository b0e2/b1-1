/**
 * 스크롤 등장 애니메이션.
 *
 * 다른 기능과 달리 전역 상태를 거치지 않는다. 한 번 보이고 나면 끝나는
 * 일시적인 시각 효과라 저장할 값도, 다른 곳과 공유할 값도 없기 때문이다.
 * 상태에 넣으면 스크롤할 때마다 전체 렌더가 도는 비용만 생긴다.
 *
 * 관찰 대상은 페이지에 처음부터 있는 정적 요소로 한정한다. 비동기로 그려지는
 * 프로젝트 카드까지 맡으면 projects 기능과 서로를 알아야 해서, 기능끼리
 * 독립적으로 둔다는 규칙이 깨진다.
 */
import { $$ } from '../dom.js';

/** 요소가 이만큼 보이면 등장시킨다. README에 같은 값을 기록해 둔다. */
const REVEAL_THRESHOLD = 0.2;

const REVEAL_SELECTOR = '.reveal';
const VISIBLE_CLASS = 'is-visible';

const showAll = (targets) => targets.forEach((target) => target.classList.add(VISIBLE_CLASS));

export const initScrollReveal = () => {
  const targets = $$(REVEAL_SELECTOR);

  if (targets.length === 0) return;

  // 지원하지 않는 브라우저에서는 효과만 포기하고 콘텐츠는 그대로 보여 준다.
  if (!('IntersectionObserver' in window)) {
    showAll(targets);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;

        target.classList.add(VISIBLE_CLASS);

        // 한 번 보인 요소는 다시 볼 필요가 없으므로 관찰을 끊는다.
        observer.unobserve(target);
      });
    },
    { threshold: REVEAL_THRESHOLD },
  );

  targets.forEach((target) => observer.observe(target));
};
