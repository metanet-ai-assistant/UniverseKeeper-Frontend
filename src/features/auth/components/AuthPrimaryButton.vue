<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <button class="auth-primary-button" type="button">{{ label }}</button>
</template>

<style scoped>
.auth-primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 64px;
  padding: 0 24px;
  color: #2d2d2d;
  background: var(--color-brand-lime);
  border: 0;
  border-radius: 16px;
  font-family: var(--font-family-base);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
  cursor: pointer;
}
</style>
