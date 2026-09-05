/**
 * 문의 폼 기능.
 *
 * 입력값과 오류를 모두 상태에 두고, 화면은 그 상태를 비추기만 한다.
 * 오류 메시지를 DOM에서 되읽지 않으므로 "지금 이 폼이 제출 가능한가"의
 * 답이 항상 상태 한 곳에 있다.
 *
 *   input/blur/submit → 검증 → setState → (구독) → renderContactForm → DOM
 *
 * 피드백 시점은 두 단계다. 처음 쓰는 동안에는 아무 말도 하지 않다가,
 * 필드를 한 번 떠난(blur) 뒤부터 그 필드만 글자마다 다시 봐 준다.
 * 다 쓰지도 않은 입력에 "이름을 입력해 주세요"를 들이밀지 않기 위해서다.
 */
import { getState, setState } from '../store.js';
import { $ } from '../dom.js';

const FIELDS = ['name', 'email', 'message'];

/**
 * @ 앞뒤가 있고, 점 뒤 최상위 도메인이 두 글자 이상인지까지 본다.
 * 더 엄격하게 굴면 정상적인 주소까지 막게 되므로 여기서 멈춘다.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** 메시지 최소 길이. 공백은 세지 않으므로 스페이스로 채워 넘길 수 없다. */
const MESSAGE_MIN_LENGTH = 10;

const REQUIRED_MESSAGES = {
  name: '이름을 입력해 주세요.',
  email: '이메일을 입력해 주세요.',
  message: '메시지를 입력해 주세요.',
};

const EMAIL_FORMAT_MESSAGE = '이메일 형식이 올바르지 않습니다. 예: you@example.com';
const MESSAGE_LENGTH_MESSAGE = `메시지를 공백 제외 ${MESSAGE_MIN_LENGTH}자 이상 적어 주세요.`;

const EMPTY_VALUES = { name: '', email: '', message: '' };
const EMPTY_ERRORS = { name: '', email: '', message: '' };
const UNTOUCHED = { name: false, email: false, message: false };

const MESSAGE_COUNT_ID = 'contact-message-count';

let formElement = null;
let successElement = null;
let alertElement = null;
let messageCountElement = null;
let successNameElement = null;
let successEmailElement = null;

const inputs = {};
const errorElements = {};

const setForm = (changes) => setState(({ form }) => ({ form: { ...form, ...changes } }));

/** 공백을 뺀 실제 글자 수. 길이 판정과 화면 안내가 같은 기준을 쓴다. */
const countWithoutSpaces = (value) => value.replace(/\s/g, '').length;

/** 값 하나를 검증해 오류 문구를 돌려준다. 문제가 없으면 빈 문자열이다. */
export const validateField = (field, value) => {
  const trimmed = value.trim();

  if (!trimmed) return REQUIRED_MESSAGES[field];
  if (field === 'email' && !EMAIL_PATTERN.test(trimmed)) return EMAIL_FORMAT_MESSAGE;
  if (field === 'message' && countWithoutSpaces(value) < MESSAGE_MIN_LENGTH) {
    return MESSAGE_LENGTH_MESSAGE;
  }

  return '';
};

/** 전체 값을 검증해 필드별 오류 문구를 모은다. */
export const validateForm = (values) =>
  Object.fromEntries(FIELDS.map((field) => [field, validateField(field, values[field])]));

/**
 * 입력하는 동안에는 값만 옮기고, 이미 blur를 거친 필드만 다시 검증한다.
 * submitAlert는 건드리지 않는다. 제출 요약이 글자마다 바뀌면
 * role="alert"가 타이핑 도중 하던 낭독을 끊는다.
 */
const handleFieldInput = ({ target: { name, value } }) => {
  const { values, errors, touched } = getState().form;
  const nextValues = { ...values, [name]: value };

  setForm({
    values: nextValues,
    errors: { ...errors, [name]: touched[name] ? validateField(name, value) : '' },
  });
};

/** 필드를 떠나는 순간부터 그 필드는 검증 대상이 된다. */
const handleFieldBlur = ({ target: { name, value } }) => {
  const { errors, touched } = getState().form;

  if (touched[name] && errors[name] === validateField(name, value)) return;

  setForm({
    touched: { ...touched, [name]: true },
    errors: { ...errors, [name]: validateField(name, value) },
  });
};

const handleSubmit = (event) => {
  // 기본 동작은 페이지를 새로 불러오는 것이라 상태가 모두 사라진다.
  event.preventDefault();

  const { values } = getState().form;
  const errors = validateForm(values);
  const invalidFields = FIELDS.filter((field) => errors[field]);

  if (invalidFields.length > 0) {
    /*
     * 제출을 눌렀다면 아직 손대지 않은 필드도 검토 대상이다.
     * 전부 touched로 만들어야 이후 입력에서도 계속 재검증이 돈다.
     */
    setForm({
      touched: { name: true, email: true, message: true },
      errors,
      submitAlert: `확인이 필요한 항목이 ${invalidFields.length}개 있습니다.`,
      sent: false,
    });

    // 요약은 개수만 알린다. 무엇이 틀렸는지는 이동한 필드의 안내가 설명한다.
    inputs[invalidFields[0]].focus();

    return;
  }

  // 실제 전송은 이번 과제 범위가 아니라, 검증을 통과했음을 알리는 데서 끝낸다.
  setForm({ errors: { ...EMPTY_ERRORS }, submitAlert: '', sent: true });

  // 방금까지 포커스가 있던 제출 버튼이 숨겨지므로, 갈 곳을 직접 정해 준다.
  successElement.focus();
};

/** 성공 패널에서 되돌아오면 폼은 처음 상태여야 한다. */
const handleReset = () => {
  setForm({
    values: { ...EMPTY_VALUES },
    touched: { ...UNTOUCHED },
    errors: { ...EMPTY_ERRORS },
    submitAlert: '',
    sent: false,
  });

  inputs.name.focus();
};

export const initContactForm = () => {
  formElement = $('#contact-form');
  successElement = $('#contact-success');
  alertElement = $('#contact-alert');
  messageCountElement = $(`#${MESSAGE_COUNT_ID}`);
  successNameElement = $('#contact-success-name');
  successEmailElement = $('#contact-success-email');

  FIELDS.forEach((field) => {
    inputs[field] = $(`#contact-${field}`);
    errorElements[field] = $(`#contact-${field}-error`);

    inputs[field].addEventListener('input', handleFieldInput);
    inputs[field].addEventListener('blur', handleFieldBlur);
  });

  formElement.addEventListener('submit', handleSubmit);
  $('#contact-reset').addEventListener('click', handleReset);
};

/**
 * 입력을 설명하는 요소만 aria-describedby로 잇는다.
 * 빈 문단까지 걸어 두면 읽을 것이 없는데도 설명이 있다고 알리게 된다.
 */
const describedBy = (field, hasError) => {
  const ids = field === 'message' ? [MESSAGE_COUNT_ID] : [];

  if (hasError) ids.push(`contact-${field}-error`);

  return ids.join(' ');
};

/** 상태를 받아 화면에만 반영한다. 여기서 상태를 바꾸지 않는다. */
export const renderContactForm = ({ form: { values, errors, submitAlert, sent } }) => {
  FIELDS.forEach((field) => {
    const input = inputs[field];
    const message = errors[field];

    // 값이 같은데도 다시 대입하면 입력 중 커서가 끝으로 튄다.
    if (input.value !== values[field]) {
      input.value = values[field];
    }

    errorElements[field].textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));

    const ids = describedBy(field, Boolean(message));

    if (ids) {
      input.setAttribute('aria-describedby', ids);
    } else {
      input.removeAttribute('aria-describedby');
    }
  });

  messageCountElement.textContent = `공백 제외 ${countWithoutSpaces(values.message)}자 / 최소 ${MESSAGE_MIN_LENGTH}자`;

  // 같은 문구를 다시 넣어도 라이브 리전은 새 알림으로 읽는다. 달라졌을 때만 쓴다.
  if (alertElement.textContent !== submitAlert) {
    alertElement.textContent = submitAlert;
  }

  /*
   * 폼과 성공 패널은 둘 다 DOM에 남아 있고 보이는 쪽만 바뀐다.
   * 값을 지우지 않으므로 성공 패널이 방금 보낸 이름과 이메일을 그대로 쓸 수 있다.
   */
  formElement.hidden = sent;
  successElement.hidden = !sent;

  if (sent) {
    successNameElement.textContent = values.name;
    successEmailElement.textContent = values.email;
  }
};
