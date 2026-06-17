<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'

const route = useRoute()
const router = useRouter()
const progress = ref(0)

const workspaceId = computed(() => String(route.params.workspaceId ?? 'red-moon'))
const progressStyle = computed(() => ({
  '--analysis-progress': `${progress.value}%`,
}))

let progressTimer: ReturnType<typeof window.setInterval> | undefined

onMounted(() => {
  progressTimer = window.setInterval(() => {
    progress.value = Math.min(100, progress.value + 1)

    if (progress.value >= 100) {
      if (progressTimer) {
        window.clearInterval(progressTimer)
      }

      void router.push(`/workspaces/${workspaceId.value}/reports/mock-episode-19`)
    }
  }, 40)
})

onBeforeUnmount(() => {
  if (progressTimer) {
    window.clearInterval(progressTimer)
  }
})
</script>

<template>
  <section class="episode-analysis-page" aria-labelledby="episode-analysis-title">
    <img class="episode-analysis-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <header class="episode-analysis-page__header">
      <RouterLink
        class="episode-analysis-page__back"
        :to="`/workspaces/${workspaceId}/episodes/new`"
        aria-label="회차 업로드로 돌아가기"
      >
        <span class="episode-analysis-page__back-icon" aria-hidden="true"></span>
      </RouterLink>
      <h1 id="episode-analysis-title" class="episode-analysis-page__title">19화 분석 중</h1>
    </header>

    <div class="episode-analysis-page__content">
      <div class="episode-analysis-page__progress" :style="progressStyle" aria-label="분석 진행 중">
        <span class="episode-analysis-page__progress-hole" aria-hidden="true"></span>
      </div>
      <p class="episode-analysis-page__status">설정과 원문을 비교하고 있습니다.</p>
      <p class="episode-analysis-page__copy">잠시만 기다려주세요. 보통 10~20초가 걸립니다.</p>
    </div>
  </section>
</template>

<style scoped>
.episode-analysis-page {
  min-height: 100dvh;
  padding: 20px 24px 40px;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.episode-analysis-page__logo {
  width: 106px;
  height: 50px;
  object-fit: contain;
}

.episode-analysis-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 53px;
  margin-top: 30px;
  border-bottom: 1px solid #eaf1ff;
}

.episode-analysis-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #111;
}

.episode-analysis-page__back-icon {
  width: 17px;
  height: 17px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.episode-analysis-page__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-analysis-page__content {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 184px;
}

.episode-analysis-page__progress {
  display: grid;
  place-items: center;
  width: 124px;
  height: 124px;
  background: conic-gradient(
    var(--color-brand-blue) 0 var(--analysis-progress),
    #ecf879 var(--analysis-progress) 100%
  );
  border-radius: 50%;
}

.episode-analysis-page__progress-hole {
  width: 88px;
  height: 88px;
  background: #fefefe;
  border-radius: 50%;
}

.episode-analysis-page__status {
  margin: 30px 0 0;
  color: #2d2d2d;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-analysis-page__copy {
  margin: 24px 0 0;
  color: #6f7280;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}
</style>
