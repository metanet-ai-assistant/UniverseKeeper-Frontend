<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { resolveAuthError } from '@/features/auth/api/authApi'
import AuthLogo from '@/features/auth/components/AuthLogo.vue'
import AuthPrimaryButton from '@/features/auth/components/AuthPrimaryButton.vue'
import AuthTextInput from '@/features/auth/components/AuthTextInput.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const feedbackMessage = ref('')
const feedbackTone = ref<'danger' | 'success'>('danger')
const isSubmitting = ref(false)

async function handleLogin() {
  if (isSubmitting.value) {
    return
  }

  feedbackMessage.value = ''

  if (!email.value.trim() || !password.value) {
    feedbackTone.value = 'danger'
    feedbackMessage.value = '이메일과 비밀번호를 입력해주세요.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.loginWithCredentials({
      email: email.value.trim(),
      password: password.value,
    })

    feedbackTone.value = 'success'
    feedbackMessage.value = '로그인되었습니다.'
    await router.push(
      typeof route.query.redirect === 'string' ? route.query.redirect : '/workspaces',
    )
  } catch (error) {
    feedbackTone.value = 'danger'
    feedbackMessage.value = resolveAuthError(error, '이메일 또는 비밀번호를 확인해주세요.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="login-page" aria-labelledby="login-title">
    <AuthLogo class="login-page__logo" />
    <h1 id="login-title" class="login-page__title">로그인</h1>

    <form class="login-page__form" @submit.prevent="handleLogin">
      <AuthTextInput
        v-model="email"
        autocomplete="username"
        label="아이디"
        name="email"
        placeholder="아이디를 입력해주세요"
        type="email"
        :disabled="isSubmitting"
      />
      <AuthTextInput
        v-model="password"
        autocomplete="current-password"
        label="비밀번호"
        name="password"
        placeholder="비밀번호를 입력해주세요"
        type="password"
        :disabled="isSubmitting"
      />
      <RouterLink class="login-page__find-password" to="/findpw">비밀번호 찾기</RouterLink>
    </form>

    <p
      v-if="feedbackMessage"
      class="login-page__feedback"
      :class="`login-page__feedback--${feedbackTone}`"
    >
      {{ feedbackMessage }}
    </p>

    <p class="login-page__join">
      <span class="login-page__brand">UVK</span>가 처음이라면,
      <RouterLink class="login-page__join-link" to="/join">회원가입</RouterLink>
      하기
    </p>

    <AuthPrimaryButton
      :disabled="isSubmitting"
      :label="isSubmitting ? '로그인 중' : '로그인하기'"
      @click="handleLogin"
    />
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

.login-page__feedback {
  margin: 14px 0 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-align: right;
  white-space: pre-line;
}

.login-page__feedback--danger {
  color: #ff4d4d;
}

.login-page__feedback--success {
  color: var(--color-brand-blue);
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
  font-weight: 800;
  text-decoration: none;
}
</style>
