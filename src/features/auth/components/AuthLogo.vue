<script setup lang="ts">
import logoAuth from '@/assets/images/brand/Logo1.svg'
</script>

<template>
  <RouterLink class="auth-logo-link" to="/splash" aria-label="첫 화면으로 이동">
    <img class="auth-logo" :src="logoAuth" alt="UniverseKeeper UVK" />
  </RouterLink>
</template>

<style scoped>
.auth-logo-link {
  display: inline-flex;
  width: fit-content;
  text-decoration: none;
}

.auth-logo {
  width: min(41.0448vw, 18.8787dvh);
  height: auto;
  aspect-ratio: 172 / 78;
  object-fit: contain;
}
</style>
