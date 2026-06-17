<script setup lang="ts">
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'

import { resetPassword, resolveAuthError, sendVerificationEmail } from '@/features/auth/api/authApi'
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

const TOAST_DURATION_MS = 3000

const mode = ref<'email' | 'reset'>('email')
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const passwordConfirm = ref('')
const isSendingCode = ref(false)
const isSubmitting = ref(false)
const toastMessage = ref('')
const toastTone = ref<'danger' | 'success'>('success')
const showSuccess = ref(false)
const dialogRef = ref<HTMLDialogElement>()
let toastTimer: number | undefined

const fieldErrors = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  passwordConfirm: '',
})

watch(showSuccess, async (shouldShow) => {
  await nextTick()

  const dialog = dialogRef.value

  if (!dialog) {
    return
  }

  if (shouldShow) {
    if (!dialog.open && typeof dialog.showModal === 'function') {
      dialog.showModal()
      dialog.focus()
      return
    }

    dialog.setAttribute('open', '')
    dialog.focus()
    return
  }

  if (dialog.open && typeof dialog.close === 'function') {
    dialog.close()
    return
  }

  dialog.removeAttribute('open')
})

onBeforeUnmount(() => {
  clearToastTimer()
})

function resetFieldErrors() {
  fieldErrors.email = ''
  fieldErrors.verificationCode = ''
  fieldErrors.newPassword = ''
  fieldErrors.passwordConfirm = ''
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

function validateEmailField() {
  fieldErrors.email = ''

  if (!isValidEmail(email.value)) {
    fieldErrors.email = '*이메일 형식이 아닙니다.'
    return false
  }

  return true
}

async function handleSendVerificationCode() {
  if (isSendingCode.value || isSubmitting.value) {
    return
  }

  toastMessage.value = ''

  if (!validateEmailField()) {
    return
  }

  isSendingCode.value = true

  try {
    const response = await sendVerificationEmail({
      email: email.value.trim(),
      purpose: 'PASSWORD_RESET',
    })

    showToast(response.message || '인증번호를 전송했습니다.', 'success')
    mode.value = 'reset'
  } catch (error) {
    showToast(resolveAuthError(error, '인증번호 전송에 실패했습니다.'), 'danger')
  } finally {
    isSendingCode.value = false
  }
}

function validateResetForm() {
  resetFieldErrors()

  if (!isValidEmail(email.value)) {
    fieldErrors.email = '*이메일 형식이 아닙니다.'
  }

  if (!verificationCode.value.trim()) {
    fieldErrors.verificationCode = '*인증번호를 입력해주세요.'
  }

  if (!isValidPassword(newPassword.value)) {
    fieldErrors.newPassword = PASSWORD_HELPER_MESSAGE
  }

  if (!passwordConfirm.value || newPassword.value !== passwordConfirm.value) {
    fieldErrors.passwordConfirm = '*비밀번호가 일치하지 않습니다.'
  }

  return (
    !fieldErrors.email &&
    !fieldErrors.verificationCode &&
    !fieldErrors.newPassword &&
    !fieldErrors.passwordConfirm
  )
}

async function handleResetPassword() {
  if (isSubmitting.value) {
    return
  }

  toastMessage.value = ''

  if (!validateResetForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await resetPassword({
      email: email.value.trim(),
      code: verificationCode.value.trim(),
      new_password: newPassword.value,
    })

    showSuccess.value = true
  } catch (error) {
    showToast(resolveAuthError(error, '비밀번호 변경 요청에 실패했습니다.'), 'danger')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="find-password-page" aria-labelledby="find-password-title">
    <AuthLogo class="find-password-page__logo" />
    <AuthHeader :title="mode === 'reset' ? '비밀번호 재설정' : '비밀번호 찾기'" back-to="/login" />

    <form
      class="find-password-page__form"
      @submit.prevent="mode === 'reset' ? handleResetPassword() : handleSendVerificationCode()"
    >
      <template v-if="mode === 'email'">
        <div class="find-password-page__code-row">
          <AuthTextInput
            v-model="email"
            autocomplete="username"
            label="이메일"
            name="email"
            placeholder="이메일(아이디)을 입력해주세요"
            type="email"
            :message="fieldErrors.email || undefined"
            tone="danger"
            :disabled="isSendingCode"
          />
          <button class="find-password-page__code-button" type="submit" :disabled="isSendingCode">
            {{ isSendingCode ? '전송 중' : '인증번호 전송' }}
          </button>
        </div>
      </template>

      <template v-else>
        <AuthTextInput
          v-model="verificationCode"
          label="인증번호"
          placeholder="인증번호를 입력해주세요"
          :message="fieldErrors.verificationCode || undefined"
          tone="danger"
          :disabled="isSubmitting"
        />
        <AuthTextInput
          v-model="newPassword"
          autocomplete="new-password"
          label="새 비밀번호"
          name="new-password"
          placeholder="새로운 비밀번호를 입력"
          :message="fieldErrors.newPassword || PASSWORD_HELPER_MESSAGE"
          :tone="fieldErrors.newPassword ? 'danger' : 'default'"
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
      </template>
    </form>

    <div class="find-password-page__button-area">
      <AuthToast :message="toastMessage" :tone="toastTone" />

      <AuthPrimaryButton
        v-if="mode === 'reset'"
        :disabled="isSubmitting"
        :label="isSubmitting ? '변경 중' : '변경 완료'"
        @click="handleResetPassword"
      />
    </div>

    <dialog
      ref="dialogRef"
      class="find-password-page__dialog"
      tabindex="-1"
      aria-labelledby="password-reset-success-title"
      @cancel.prevent
    >
      <p id="password-reset-success-title" class="find-password-page__dialog-message">
        비밀번호가 정상적으로<br />
        변경 되었습니다.
      </p>
      <RouterLink class="find-password-page__dialog-button" to="/login">로그인</RouterLink>
    </dialog>
  </section>
</template>

<style scoped>
.find-password-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 18.6499dvh 24px 7.2082dvh;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.find-password-page__logo {
  align-self: center;
  margin-bottom: 2.5172dvh;
}

.find-password-page__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 22px;
}

.find-password-page__code-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.find-password-page__code-row :deep(.auth-text-input) {
  flex: 1 1 0;
  min-width: 0;
}

.find-password-page__code-button {
  display: inline-flex;
  flex: 0 0 101px;
  align-items: center;
  justify-content: center;
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

.find-password-page__code-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.find-password-page__button-area {
  margin-top: auto;
}

.find-password-page__dialog {
  width: min(calc(100vw - 98px), 303px);
  padding: 48px 28px;
  margin: auto;
  background: #fefefe;
  border: 0;
  border-radius: 8px;
  outline: none;
  box-shadow: 0 10px 40px rgba(45, 45, 45, 0.18);
}

.find-password-page__dialog::backdrop {
  background: rgba(45, 45, 45, 0.48);
}

.find-password-page__dialog-message {
  margin: 0 0 19px;
  color: #2d2d2d;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.65;
  text-align: center;
}

.find-password-page__dialog-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 141px);
  min-height: 63px;
  margin: 0 auto;
  color: #fefefe;
  background: var(--color-brand-blue);
  border-radius: 16px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
}

.find-password-page__dialog-button:focus-visible {
  outline: 2px solid var(--color-brand-blue);
  outline-offset: 3px;
}
</style>
