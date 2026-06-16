<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'

import { resetPassword, resolveAuthError } from '@/features/auth/api/authApi'
import AuthHeader from '@/features/auth/components/AuthHeader.vue'
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'
import {
  isValidEmail,
  isValidPassword,
  PASSWORD_HELPER_MESSAGE,
} from '@/features/auth/utils/validation'

const mode = ref<'email' | 'reset'>('email')
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const passwordConfirm = ref('')
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const showSuccess = ref(false)
const dialogRef = ref<HTMLDialogElement>()

const fieldErrors = reactive({
  email: '',
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

function resetFieldErrors() {
  fieldErrors.email = ''
  fieldErrors.newPassword = ''
  fieldErrors.passwordConfirm = ''
}

function handlePasswordStep() {
  resetFieldErrors()
  feedbackMessage.value = ''

  if (!isValidEmail(email.value)) {
    fieldErrors.email = '*이메일 형식이 아닙니다.'
    return
  }

  mode.value = 'reset'
}

function validateResetForm() {
  resetFieldErrors()

  if (!isValidPassword(newPassword.value)) {
    fieldErrors.newPassword = PASSWORD_HELPER_MESSAGE
  }

  if (!passwordConfirm.value || newPassword.value !== passwordConfirm.value) {
    fieldErrors.passwordConfirm = '*비밀번호가 일치하지 않습니다.'
  }

  return !fieldErrors.newPassword && !fieldErrors.passwordConfirm
}

async function handleResetPassword() {
  if (isSubmitting.value) {
    return
  }

  feedbackMessage.value = ''

  if (!validateResetForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await resetPassword({
      email: email.value.trim(),
      new_password: newPassword.value,
    })

    showSuccess.value = true
  } catch (error) {
    feedbackMessage.value = resolveAuthError(error, '비밀번호 변경 요청에 실패했습니다.')
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
      @submit.prevent="mode === 'reset' ? handleResetPassword() : handlePasswordStep()"
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
          />
          <button class="find-password-page__code-button" type="submit">인증번호 전송</button>
        </div>
        <AuthTextInput
          v-model="verificationCode"
          label="인증번호"
          placeholder="인증번호를 입력해주세요"
        />
      </template>

      <template v-else>
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

    <p v-if="feedbackMessage" class="find-password-page__feedback">{{ feedbackMessage }}</p>

    <AuthPrimaryButton
      v-if="mode === 'reset'"
      :disabled="isSubmitting"
      :label="isSubmitting ? '변경 중' : '변경 완료'"
      @click="handleResetPassword"
    />

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

.find-password-page__feedback {
  margin: 14px 0 0;
  color: #ff4d4d;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: right;
  white-space: pre-line;
}

.find-password-page :deep(.auth-primary-button) {
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
