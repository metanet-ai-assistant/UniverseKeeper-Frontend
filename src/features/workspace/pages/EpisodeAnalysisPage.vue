<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import { useEpisodeAnalysisStore } from '@/features/workspace/stores/episodeAnalysisStore'

const route = useRoute()
const router = useRouter()
const analysisStore = useEpisodeAnalysisStore()
const progress = ref(8)
const pageError = ref('')

const workspaceId = computed(() => String(route.params.workspaceId ?? ''))
const episodeLabel = computed(() => {
  const episodeNumber =
    analysisStore.pendingRequest?.episodeNumber || analysisStore.latestEpisodeNumber

  return episodeNumber ? `${episodeNumber}화 분석 중` : '회차 분석 중'
})
const progressStyle = computed(() => ({
  '--analysis-progress': `${progress.value}%`,
}))

let progressTimer: number | undefined

function startProgress() {
  progressTimer = window.setInterval(() => {
    const limit = analysisStore.isAnalyzing ? 88 : 96
    progress.value = Math.min(limit, progress.value + 4)
  }, 160)
}

function stopProgress() {
  if (progressTimer) {
    window.clearInterval(progressTimer)
    progressTimer = undefined
  }
}

async function runAnalysis() {
  if (!analysisStore.hasPendingRequest) {
    pageError.value = '분석할 회차 파일이 없습니다. 회차 업로드 화면에서 다시 시작해주세요.'
    return
  }

  try {
    startProgress()
    await analysisStore.runPendingAnalysis()
    const episodeId = analysisStore.latestEpisodeId

    if (!episodeId) {
      pageError.value = '분석 결과에서 회차 ID를 확인할 수 없습니다.'
      return
    }

    progress.value = 100
    window.setTimeout(() => {
      void router.push(`/workspaces/${workspaceId.value}/reports/${episodeId}`)
    }, 250)
  } catch {
    pageError.value = analysisStore.analysisError || '충돌 분석에 실패했습니다.'
  } finally {
    stopProgress()
  }
}

onMounted(() => {
  void runAnalysis()
})

onBeforeUnmount(() => {
  stopProgress()
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
      <h1 id="episode-analysis-title" class="episode-analysis-page__title">{{ episodeLabel }}</h1>
    </header>

    <div class="episode-analysis-page__content">
      <div class="episode-analysis-page__progress" :style="progressStyle" aria-label="분석 진행 중">
        <span class="episode-analysis-page__progress-hole" aria-hidden="true"></span>
      </div>
      <p class="episode-analysis-page__status">
        {{ pageError || '설정과 원문을 비교하고 있습니다.' }}
      </p>
      <p class="episode-analysis-page__copy">
        {{ pageError ? '회차 업로드 화면에서 다시 시도해주세요.' : '잠시만 기다려주세요.' }}
      </p>
      <RouterLink
        v-if="pageError"
        class="episode-analysis-page__retry"
        :to="`/workspaces/${workspaceId}/episodes/new`"
      >
        다시 업로드
      </RouterLink>
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
  text-align: center;
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
  line-height: 1.35;
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

.episode-analysis-page__retry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112px;
  min-height: 44px;
  margin-top: 24px;
  color: #fefefe;
  background: var(--color-brand-blue);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
}
</style>
