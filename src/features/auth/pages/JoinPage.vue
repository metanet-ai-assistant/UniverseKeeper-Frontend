<script setup lang="ts">
import { reactive, ref } from 'vue'

import { resolveAuthError, signup } from '@/features/auth/api/authApi'
import AuthHeader from '@/features/auth/components/AuthHeader.vue'
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'
import {
  isValidEmail,
  isValidPassword,
  PASSWORD_HELPER_MESSAGE,
} from '@/features/auth/utils/validation'

const email = ref('')
const verificationCode = ref('')
const password = ref('')
const passwordConfirm = ref('')
const userName = ref('')
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackTone = ref<'danger' | 'success'>('danger')

const fieldErrors = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  userName: '',
})

function resetFieldErrors() {
  fieldErrors.email = ''
  fieldErrors.password = ''
  fieldErrors.passwordConfirm = ''
  fieldErrors.userName = ''
}

function validateSignupForm() {
  resetFieldErrors()

  if (!isValidEmail(email.value)) {
    fieldErrors.email = '*이메일 형식이 아닙니다.'
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
    !fieldErrors.password &&
    !fieldErrors.passwordConfirm &&
    !fieldErrors.userName
  )
}

async function handleSignup() {
  if (isSubmitting.value) {
    return
  }

  feedbackMessage.value = ''

  if (!validateSignupForm()) {
    feedbackTone.value = 'danger'
    return
  }

  isSubmitting.value = true

  try {
    await signup({
      email: email.value.trim(),
      password: password.value,
      user_name: userName.value.trim(),
    })

    feedbackTone.value = 'success'
    feedbackMessage.value = '회원가입이 완료되었습니다.'
  } catch (error) {
    feedbackTone.value = 'danger'
    feedbackMessage.value = resolveAuthError(error, '회원가입 요청에 실패했습니다.')
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
          <button class="join-page__code-button" type="button" :disabled="isSubmitting">
            인증번호 전송
          </button>
        </div>
        <p v-if="fieldErrors.email" class="join-page__error">{{ fieldErrors.email }}</p>
      </div>
      <AuthTextInput
        v-model="verificationCode"
        label="인증번호"
        placeholder="인증번호를 입력해주세요"
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

    <p
      v-if="feedbackMessage"
      class="join-page__feedback"
      :class="`join-page__feedback--${feedbackTone}`"
    >
      {{ feedbackMessage }}
    </p>

    <AuthPrimaryButton
      :disabled="isSubmitting"
      :label="isSubmitting ? '가입 중' : '회원가입'"
      @click="handleSignup"
    />
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

.join-page__feedback {
  margin: 14px 0 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: right;
  white-space: pre-line;
}

.join-page__feedback--danger {
  color: #ff4d4d;
}

.join-page__feedback--success {
  color: var(--color-brand-blue);
}

.join-page :deep(.auth-primary-button) {
  margin-top: auto;
}
</style>
