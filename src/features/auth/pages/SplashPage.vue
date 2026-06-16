<script setup lang="ts">
import splashImage from '@/assets/images/brand/splashImg.png'
</script>

<template>
  <RouterLink class="splash-page" to="/login" aria-label="로그인 화면으로 이동">
    <p class="splash-page__message">
      작가님의 세계가 무너지지 않도록<br />
      설정과 원고를 함께 지켜드립니다.
    </p>
    <img class="splash-page__image" :src="splashImage" alt="UniverseKeeper UVK" />
    <p class="splash-page__prompt">화면을 <strong>터치해주세요</strong>.</p>
  </RouterLink>
</template>

<style scoped>
.splash-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100dvh;
  padding-block-start: 18.3066dvh;
  padding-inline: 24px;
  overflow: hidden;
  background: #fefefe;
  font-family: var(--font-family-base);
  text-decoration: none;
  cursor: pointer;
}

.splash-page__message,
.splash-page__prompt {
  margin: 0;
  font-size: min(3.7314vw, 1.7163dvh);
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0;
  white-space: nowrap;
}

.splash-page__message {
  width: min(49.005vw, 22.5401dvh);
  margin-bottom: 2.5172dvh;
  color: #2d2d2d;
}

.splash-page__image {
  width: min(78.8557vw, 36.27dvh);
  height: auto;
  margin-bottom: 5.1487dvh;
  aspect-ratio: 300 / 363;
  object-fit: contain;
}

.splash-page__prompt {
  color: #6f7280;
}

.splash-page__prompt strong {
  font-weight: 500;
}
</style>
