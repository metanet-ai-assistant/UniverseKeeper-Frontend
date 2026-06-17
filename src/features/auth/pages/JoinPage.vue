<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { resolveAuthError, sendVerificationEmail, signup } from '@/features/auth/api/authApi'
import AuthHeader from '@/features/auth/components/AuthHeader.vue'
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'
import AuthToast from '@/features/auth/components/AuthToast.vue'
import {
  isValidEmail,
  isValidPassword,
  PASSWORD_HELPER_MESSAGE,
} from '@/features/auth/utils/validation'

const VERIFICATION_COUNTDOWN_SECONDS = 10 * 60
const TOAST_DURATION_MS = 3000

const router = useRouter()
const email = ref('')
const verificationCode = ref('')
const password = ref('')
const passwordConfirm = ref('')
const userName = ref('')
const isSendingCode = ref(false)
const isSubmitting = ref(false)
const verificationCountdown = ref(0)
const toastMessage = ref('')
const toastTone = ref<'danger' | 'success'>('success')
let countdownTimer: number | undefined
let toastTimer: number | undefined

const fieldErrors = reactive({
  email: '',
  verificationCode: '',
  password: '',
  passwordConfirm: '',
  userName: '',
})

const verificationButtonLabel = computed(() => {
  if (isSendingCode.value) {
    return '전송 중'
  }

  if (verificationCountdown.value <= 0) {
    return '인증번호 전송'
  }

  const minutes = Math.floor(verificationCountdown.value / 60)
  const seconds = verificationCountdown.value % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

watch(password, validatePasswordField)
watch([password, passwordConfirm], validatePasswordConfirmField)

onBeforeUnmount(() => {
  stopVerificationCountdown()
  clearToastTimer()
})

function resetFieldErrors() {
  fieldErrors.email = ''
  fieldErrors.verificationCode = ''
  fieldErrors.password = ''
  fieldErrors.passwordConfirm = ''
  fieldErrors.userName = ''
}

function clearToastTimer() {
  if (!toastTimer) {
    return
  }

  window.clearTimeout(toastTimer)
  toastTimer = undefined
}

function showToast(message: string, tone: 'danger' | 'success') {
  clearToastTimer()
  toastMessage.value = message
  toastTone.value = tone

  toastTimer = window.setTimeout(() => {
    toastMessage.value = ''
    toastTimer = undefined
  }, TOAST_DURATION_MS)
}

function stopVerificationCountdown() {
  if (!countdownTimer) {
    return
  }

  window.clearInterval(countdownTimer)
  countdownTimer = undefined
}

function startVerificationCountdown() {
  stopVerificationCountdown()
  verificationCountdown.value = VERIFICATION_COUNTDOWN_SECONDS

  countdownTimer = window.setInterval(() => {
    verificationCountdown.value -= 1

    if (verificationCountdown.value <= 0) {
      verificationCountdown.value = 0
      stopVerificationCountdown()
    }
  }, 1000)
}

function validatePasswordField() {
  if (!password.value) {
    fieldErrors.password = ''
    return
  }

  fieldErrors.password = isValidPassword(password.value) ? '' : PASSWORD_HELPER_MESSAGE
}

function validatePasswordConfirmField() {
  if (!passwordConfirm.value) {
    fieldErrors.passwordConfirm = ''
    return
  }

  fieldErrors.passwordConfirm =
    password.value === passwordConfirm.value ? '' : '*비밀번호가 일치하지 않습니다.'
}

function validateEmailField() {
  fieldErrors.email = ''

  if (!isValidEmail(email.value)) {
    fieldErrors.email = '*이메일 형식이 아닙니다.'
    return false
  }

  return true
}

function validateSignupForm() {
  resetFieldErrors()

  if (!isValidEmail(email.value)) {
    fieldErrors.email = '*이메일 형식이 아닙니다.'
  }

  if (!verificationCode.value.trim()) {
    fieldErrors.verificationCode = '*인증번호를 입력해주세요.'
  }

  if (!isValidPassword(password.value)) {
    fieldErrors.password = PASSWORD_HELPER_MESSAGE
  }

  if (!passwordConfirm.value || password.value !== passwordConfirm.value) {
    fieldErrors.passwordConfirm = '*비밀번호가 일치하지 않습니다.'
  }

  if (!userName.value.trim()) {
    fieldErrors.userName = '*닉네임을 입력해주세요.'
  }

  return (
    !fieldErrors.email &&
    !fieldErrors.verificationCode &&
    !fieldErrors.password &&
    !fieldErrors.passwordConfirm &&
    !fieldErrors.userName
  )
}

async function handleSendVerificationCode() {
  if (isSendingCode.value || isSubmitting.value || verificationCountdown.value > 0) {
    return
  }

  if (!validateEmailField()) {
    return
  }

  isSendingCode.value = true

  try {
    const response = await sendVerificationEmail({
      email: email.value.trim(),
      purpose: 'SIGNUP',
    })

    showToast(response.message || '인증번호를 전송했습니다.', 'success')
    startVerificationCountdown()
  } catch (error) {
    showToast(resolveAuthError(error, '인증번호 전송에 실패했습니다.'), 'danger')
  } finally {
    isSendingCode.value = false
  }
}

async function handleSignup() {
  if (isSubmitting.value) {
    return
  }

  toastMessage.value = ''

  if (!validateSignupForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await signup({
      email: email.value.trim(),
      password: password.value,
      user_name: userName.value.trim(),
      code: verificationCode.value.trim(),
    })

    await router.push('/login')
  } catch (error) {
    showToast(resolveAuthError(error, '회원가입 요청에 실패했습니다.'), 'danger')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="join-page" aria-labelledby="join-title">
    <AuthLogo class="join-page__logo" />
    <AuthHeader title="회원가입" back-to="/login" />

    <form class="join-page__form" @submit.prevent="handleSignup">
      <div class="join-page__field-with-helper">
        <div class="join-page__code-row">
          <AuthTextInput
            v-model="email"
            autocomplete="username"
            label="아이디"
            name="email"
            placeholder="아이디 입력(email)"
            type="email"
            :disabled="isSubmitting"
          />
          <button
            class="join-page__code-button"
            type="button"
            :disabled="isSubmitting || isSendingCode || verificationCountdown > 0"
            @click="handleSendVerificationCode"
          >
            {{ verificationButtonLabel }}
          </button>
        </div>
        <p v-if="fieldErrors.email" class="join-page__error">{{ fieldErrors.email }}</p>
      </div>
      <AuthTextInput
        v-model="verificationCode"
        label="인증번호"
        placeholder="인증번호를 입력해주세요"
        :message="fieldErrors.verificationCode || undefined"
        tone="danger"
        :disabled="isSubmitting"
      />
      <AuthTextInput
        v-model="password"
        autocomplete="new-password"
        label="비밀번호"
        name="password"
        placeholder="비밀번호를 입력"
        :message="fieldErrors.password || PASSWORD_HELPER_MESSAGE"
        :tone="fieldErrors.password ? 'danger' : 'default'"
        type="password"
        :disabled="isSubmitting"
      />
      <AuthTextInput
        v-model="passwordConfirm"
        autocomplete="new-password"
        label="비밀번호 확인"
        name="password-confirm"
        placeholder="비밀번호를 재확인"
        :message="fieldErrors.passwordConfirm || undefined"
        tone="danger"
        type="password"
        :disabled="isSubmitting"
      />
      <AuthTextInput
        v-model="userName"
        autocomplete="nickname"
        label="닉네임"
        name="user-name"
        placeholder="닉네임 입력"
        :message="fieldErrors.userName || undefined"
        tone="danger"
        :disabled="isSubmitting"
      />
    </form>

    <div class="join-page__button-area">
      <AuthToast :message="toastMessage" :tone="toastTone" />

      <AuthPrimaryButton
        :disabled="isSubmitting"
        :label="isSubmitting ? '가입 중' : '회원가입'"
        @click="handleSignup"
      />
    </div>
  </section>
</template>

<style scoped>
.join-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 18.6499dvh 24px 7.2082dvh;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.join-page__logo {
  align-self: center;
  margin-bottom: 2.2883dvh;
}

.join-page__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.join-page__code-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.join-page__code-row :deep(.auth-text-input) {
  flex: 1 1 0;
  min-width: 0;
}

.join-page__code-button {
  flex: 0 0 101px;
  min-height: 58px;
  padding: 0 12px;
  color: var(--color-brand-blue);
  background: #fefefe;
  border: 1.5px solid var(--color-brand-blue);
  border-radius: 16px;
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;
  cursor: pointer;
}

.join-page__code-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.join-page__field-with-helper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.join-page__error {
  margin: 0;
  color: #ff4d4d;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  text-align: right;
}

.join-page__button-area {
  margin-top: auto;
}
</style>
