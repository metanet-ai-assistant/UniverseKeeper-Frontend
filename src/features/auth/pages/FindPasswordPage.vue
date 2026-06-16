<script setup lang="ts">
import AuthHeader from '@/features/auth/components/AuthHeader.vue'
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'
</script>

<template>
  <section class="find-password-page" aria-labelledby="find-password-title">
    <AuthLogo class="find-password-page__logo" />
    <AuthHeader title="비밀번호 찾기" back-to="/login" />

    <form class="find-password-page__form">
      <div class="find-password-page__code-row">
        <AuthTextInput label="이메일" placeholder="이메일(아이디)을 입력해주세요" type="email" />
        <button class="find-password-page__code-button" type="button">인증번호 전송</button>
      </div>
      <AuthTextInput label="인증번호" placeholder="인증번호를 입력해주세요" />
    </form>
  </section>
</template>

<style scoped>
.find-password-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 18.6499dvh 24px 0;
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) 101px;
  gap: 8px;
}

.find-password-page__code-button {
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
</style>
