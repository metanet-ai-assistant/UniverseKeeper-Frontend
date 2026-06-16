<script setup lang="ts">
defineProps<{
  title: string
  backTo: string
}>()
</script>

<template>
  <header class="auth-header">
    <RouterLink class="auth-header__back" :to="backTo" :aria-label="`${title}에서 돌아가기`">
      <span aria-hidden="true" class="auth-header__back-icon"></span>
    </RouterLink>
    <h1 class="auth-header__title">{{ title }}</h1>
  </header>
</template>

<style scoped>
.auth-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  min-height: 52px;
  padding-top: 2px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eaf1ff;
}

.auth-header__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.auth-header__back-icon {
  width: 14px;
  height: 14px;
  border-bottom: 2px solid #111;
  border-left: 2px solid #111;
  transform: rotate(45deg);
}

.auth-header__title {
  margin: 0;
  color: #2d2d2d;
  font-family: var(--font-family-base);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
}
</style>
