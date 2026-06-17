<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string
    tone?: 'danger' | 'success'
  }>(),
  {
    tone: 'success',
  },
)
</script>

<template>
  <Transition name="auth-toast">
    <p v-if="message" class="auth-toast" :class="`auth-toast--${tone}`">
      {{ message }}
    </p>
  </Transition>
</template>

<style scoped>
.auth-toast {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto 12px;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(45, 45, 45, 0.12);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-align: center;
  transform-origin: 50% 100%;
  white-space: pre-line;
  will-change: opacity, transform;
}

.auth-toast--danger {
  color: #ff4d4d;
  background: #fff4f4;
  border-color: #ffd7d7;
}

.auth-toast--success {
  color: var(--color-brand-blue);
  background: #f2f8ff;
  border-color: #d7e8ff;
}

.auth-toast-enter-active {
  animation: auth-toast-pop-in 420ms cubic-bezier(0.2, 1.35, 0.35, 1);
}

.auth-toast-leave-active {
  animation: auth-toast-pop-out 220ms ease-in forwards;
}

@keyframes auth-toast-pop-in {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.86);
  }

  55% {
    opacity: 1;
    transform: translateY(-4px) scale(1.04);
  }

  78% {
    transform: translateY(2px) scale(0.98);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes auth-toast-pop-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(8px) scale(0.94);
  }
}
</style>
