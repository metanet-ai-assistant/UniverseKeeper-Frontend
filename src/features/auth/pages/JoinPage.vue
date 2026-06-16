<script setup lang="ts">
import { ref } from 'vue'

import AuthHeader from '@/features/auth/components/AuthHeader.vue'
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'

const showErrors = ref(false)
</script>

<template>
  <section class="join-page" aria-labelledby="join-title">
    <AuthLogo class="join-page__logo" />
    <AuthHeader title="회원가입" back-to="/login" />

    <form class="join-page__form">
      <div class="join-page__field-with-helper">
        <div class="join-page__code-row">
          <AuthTextInput label="아이디" placeholder="아이디 입력(email)" type="email" />
          <button class="join-page__code-button" type="button">인증번호 전송</button>
        </div>
        <p v-if="showErrors" class="join-page__error">*이메일 형식이 아닙니다.</p>
      </div>
      <AuthTextInput
        label="인증번호"
        placeholder="인증번호를 입력해주세요"
        :message="showErrors ? '*인증번호가 틀렸습니다.' : undefined"
        tone="danger"
      />
      <AuthTextInput
        label="비밀번호"
        placeholder="비밀번호를 입력"
        :message="showErrors ? undefined : '*영어, 숫자, 특수문자 사용, 8자리 이상'"
        type="password"
      />
      <AuthTextInput
        label="비밀번호 확인"
        placeholder="비밀번호를 재확인"
        :message="showErrors ? '*비밀번호가 일치하지 않습니다.' : undefined"
        tone="danger"
        type="password"
      />
      <AuthTextInput label="닉네임" placeholder="닉네임 입력" />
    </form>

    <AuthPrimaryButton label="회원가입" @click="showErrors = true" />
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

.join-page :deep(.auth-primary-button) {
  margin-top: auto;
}
</style>
