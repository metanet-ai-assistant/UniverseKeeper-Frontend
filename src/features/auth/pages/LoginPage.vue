<script setup lang="ts">
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'
</script>

<template>
  <section class="login-page" aria-labelledby="login-title">
    <AuthLogo class="login-page__logo" />
    <h1 id="login-title" class="login-page__title">로그인</h1>

    <form class="login-page__form">
      <AuthTextInput label="아이디" placeholder="아이디를 입력해주세요" />
      <AuthTextInput label="비밀번호" placeholder="비밀번호를 입력해주세요" type="password" />
      <RouterLink class="login-page__find-password" to="/findpw">비밀번호 찾기</RouterLink>
    </form>

    <p class="login-page__join">
      <span class="login-page__brand">UVK</span>가 처음이라면,
      <RouterLink class="login-page__join-link" to="/join">회원가입</RouterLink>
      하기
    </p>

    <AuthPrimaryButton label="로그인하기" />
  </section>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 18.6499dvh 24px 7.2082dvh;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.login-page__logo {
  align-self: center;
  margin-bottom: 2.2883dvh;
}

.login-page__title {
  margin: 0 0 20px;
  color: #2d2d2d;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
}

.login-page__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-page__find-password {
  align-self: flex-end;
  margin-top: 27px;
  margin-right: 21px;
  color: #828797;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  text-decoration: none;
}

.login-page__join {
  align-self: center;
  margin: auto 0 36px;
  color: #2d2d2d;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  white-space: nowrap;
}

.login-page__brand,
.login-page__join-link {
  color: var(--color-brand-blue);
}

.login-page__join-link {
  margin-inline: 10px;
  font-weight: 800;
  text-decoration: none;
}
</style>
