export const PASSWORD_HELPER_MESSAGE = '*영어, 숫자, 특수문자 사용, 8자리 이상'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidPassword(value: string) {
  return PASSWORD_PATTERN.test(value)
}
