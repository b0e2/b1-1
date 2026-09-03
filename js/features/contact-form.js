/**
 * 문의 폼 기능.
 *
 * 입력값과 오류를 모두 상태에 두고, 화면은 그 상태를 비추기만 한다.
 * 오류 메시지를 DOM에서 되읽지 않으므로 "지금 이 폼이 제출 가능한가"의
 * 답이 항상 상태 한 곳에 있다.
 *
 *   input/submit → 검증 → setState → (구독) → renderContactForm → DOM
 */
import { getState, setState } from '../store.js';
import { $ } from '../dom.js';

const FIELDS = ['name', 'email', 'message'];

/**
 * 아주 엄격한 이메일 규칙은 정상적인 주소까지 막는다.
 * 여기서는 공백 없이 @ 앞뒤가 있고 점 있는 도메인인지만 본다.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_MESSAGES = {
  name: '이름을 입력해 주세요.',
  email: '이메일을 입력해 주세요.',
  message: '메시지를 입력해 주세요.',
};

const EMAIL_FORMAT_MESSAGE = '이메일 형식이 올바르지 않습니다. 예: you@example.com';
const SUCCESS_MESSAGE = '메시지를 보냈습니다. 확인 후 답장 드리겠습니다.';

const EMPTY_FIELDS = { name: '', email: '', message: '' };

let formElement = null;
let successElement = null;

const inputs = {};
const errorElements = {};

const setForm = (changes) => setState(({ form }) => ({ form: { ...form, ...changes } }));

/** 값 하나를 검증해 오류 문구를 돌려준다. 문제가 없으면 빈 문자열이다. */
export const validateField = (field, value) => {
  const trimmed = value.trim();

  if (!trimmed) return REQUIRED_MESSAGES[field];
  if (field === 'email' && !EMAIL_PATTERN.test(trimmed)) return EMAIL_FORMAT_MESSAGE;

  return '';
};

/** 전체 값을 검증해 필드별 오류 문구를 모은다. */
export const validateForm = (values) =>
  Object.fromEntries(FIELDS.map((field) => [field, validateField(field, values[field])]));

/** 입력하는 동안 해당 필드만 다시 검증한다. 다른 필드의 오류는 건드리지 않는다. */
const handleFieldInput = ({ target: { name, value } }) => {
  const { values, errors } = getState().form;

  setForm({
    values: { ...values, [name]: value },
    errors: { ...errors, [name]: validateField(name, value) },
    // 다시 입력하기 시작했다면 직전 제출의 성공 메시지는 더 이상 맞지 않는다.
    submitted: false,
  });
};

const handleSubmit = (event) => {
  // 기본 동작은 페이지를 새로 불러오는 것이라 상태가 모두 사라진다.
  event.preventDefault();

  const { values } = getState().form;
  const errors = validateForm(values);
  const firstInvalidField = FIELDS.find((field) => errors[field]);

  if (firstInvalidField) {
    setForm({ errors, submitted: false });

    // 어디를 고쳐야 하는지 바로 알 수 있도록 첫 오류로 이동시킨다.
    inputs[firstInvalidField].focus();
    return;
  }

  // 실제 전송은 이번 과제 범위가 아니라, 검증을 통과했음을 알리는 데서 끝낸다.
  setForm({ values: { ...EMPTY_FIELDS }, errors: { ...EMPTY_FIELDS }, submitted: true });
};

export const initContactForm = () => {
  formElement = $('#contact-form');
  successElement = $('#contact-success');

  FIELDS.forEach((field) => {
    inputs[field] = $(`#contact-${field}`);
    errorElements[field] = $(`#contact-${field}-error`);

    inputs[field].addEventListener('input', handleFieldInput);
  });

  formElement.addEventListener('submit', handleSubmit);
};

/** 상태를 받아 화면에만 반영한다. */
export const renderContactForm = ({ form: { values, errors, submitted } }) => {
  FIELDS.forEach((field) => {
    const input = inputs[field];
    const message = errors[field];

    // 값이 같은데도 다시 대입하면 입력 중 커서가 끝으로 튄다.
    if (input.value !== values[field]) {
      input.value = values[field];
    }

    errorElements[field].textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
  });

  successElement.textContent = submitted ? SUCCESS_MESSAGE : '';
};
