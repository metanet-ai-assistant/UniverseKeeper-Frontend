<script setup lang="ts">
defineProps<{
  label: string
  placeholder: string
  type?: 'email' | 'password' | 'text'
}>()
</script>

<template>
  <label class="auth-text-input">
    <span class="auth-text-input__label">{{ label }}</span>
    <input class="auth-text-input__control" :type="type ?? 'text'" :placeholder="placeholder" />
  </label>
</template>

<style scoped>
.auth-text-input {
  display: block;
  width: 100%;
}

.auth-text-input__label {
  display: none;
}

.auth-text-input__control {
  width: 100%;
  height: 58px;
  padding: 0 18px;
  color: #2d2d2d;
  background: #f6f8fb;
  border: 1.5px solid transparent;
  border-radius: 16px;
  outline: none;
  font-family: var(--font-family-base);
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
}

.auth-text-input__control::placeholder {
  color: #cccfdb;
  opacity: 1;
}

.auth-text-input__control:focus {
  border-color: var(--color-brand-blue);
}
</style>
