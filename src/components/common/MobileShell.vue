<template>
  <main class="mobile-shell">
    <slot />
  </main>
</template>

<style scoped>
.mobile-shell {
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--color-surface-primary);
}
</style>
