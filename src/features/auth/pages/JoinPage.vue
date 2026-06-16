<script setup lang="ts">
import AuthHeader from '@/features/auth/components/AuthHeader.vue'
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'
</script>

<template>
  <section class="join-page" aria-labelledby="join-title">
    <AuthLogo class="join-page__logo" />
    <AuthHeader title="회원가입" back-to="/login" />

    <form class="join-page__form">
      <div class="join-page__code-row">
        <AuthTextInput label="아이디" placeholder="아이디 입력(email)" type="email" />
        <button class="join-page__code-button" type="button">인증번호 전송</button>
      </div>
      <AuthTextInput label="인증번호" placeholder="인증번호를 입력해주세요" />
      <div class="join-page__field-with-helper">
        <AuthTextInput label="비밀번호" placeholder="비밀번호를 입력" type="password" />
        <p class="join-page__helper">*영어, 숫자, 특수문자 사용, 8자리 이상</p>
      </div>
      <AuthTextInput label="비밀번호 확인" placeholder="비밀번호를 재확인" type="password" />
      <AuthTextInput label="닉네임" placeholder="닉네임 입력" />
    </form>

    <AuthPrimaryButton label="회원가입" />
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) 101px;
  gap: 8px;
}

.join-page__code-button {
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

.join-page__helper {
  margin: 0;
  color: #6f7280;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  text-align: right;
}

.join-page :deep(.auth-primary-button) {
  margin-top: auto;
}
</style>
