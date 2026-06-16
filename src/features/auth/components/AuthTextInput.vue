<script setup lang="ts">
const modelValue = defineModel<string>({ default: '' })

defineProps<{
  label: string
  placeholder: string
  autocomplete?: string
  disabled?: boolean
  message?: string
  name?: string
  tone?: 'default' | 'danger'
  type?: 'email' | 'password' | 'text'
}>()
</script>

<template>
  <label class="auth-text-input">
    <span class="auth-text-input__label">{{ label }}</span>
    <input
      v-model="modelValue"
      class="auth-text-input__control"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :name="name"
      :type="type ?? 'text'"
      :placeholder="placeholder"
    />
    <span
      v-if="message"
      class="auth-text-input__message"
      :class="`auth-text-input__message--${tone ?? 'default'}`"
    >
      {{ message }}
    </span>
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

.auth-text-input__control:disabled {
  cursor: not-allowed;
}

.auth-text-input__message {
  display: block;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  text-align: right;
}

.auth-text-input__message--default {
  color: #6f7280;
}

.auth-text-input__message--danger {
  color: #ff4d4d;
}
</style>
