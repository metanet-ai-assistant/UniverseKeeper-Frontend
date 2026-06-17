<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import { useEpisodeAnalysisStore } from '@/features/workspace/stores/episodeAnalysisStore'

const route = useRoute()
const router = useRouter()
const analysisStore = useEpisodeAnalysisStore()
const pageError = ref('')
const isNoConflict = ref(false)
const isLoading = computed(() => !pageError.value && !isNoConflict.value)

const workspaceId = computed(() => String(route.params.workspaceId ?? ''))
const episodeLabel = computed(() => {
  const episodeNumber =
    analysisStore.pendingRequest?.episodeNumber || analysisStore.latestEpisodeNumber

  if (isNoConflict.value) {
    return episodeNumber ? `${episodeNumber}화 분석 완료` : '회차 분석 완료'
  }

  return episodeNumber ? `${episodeNumber}화 분석 중` : '회차 분석 중'
})
const statusMessage = computed(() => {
  if (pageError.value) {
    return pageError.value
  }

  if (isNoConflict.value) {
    return '충돌이 없습니다.'
  }

  return '설정과 원문을 비교하고 있습니다.'
})
const statusCopy = computed(() => {
  if (pageError.value) {
    return '회차 업로드 화면에서 다시 시도해주세요.'
  }

  if (isNoConflict.value) {
    return '분석 결과 충돌이 발견되지 않았습니다.'
  }

  return '잠시만 기다려주세요.'
})

async function runAnalysis() {
  if (!analysisStore.hasPendingRequest) {
    pageError.value = '분석할 회차 파일이 없습니다. 회차 업로드 화면에서 다시 시작해주세요.'
    return
  }

  try {
    const result = await analysisStore.runPendingAnalysis()

    if (!result.is_conflict) {
      isNoConflict.value = true
      return
    }

    const episodeId = analysisStore.latestEpisodeId

    if (!episodeId) {
      pageError.value = '분석 결과에서 회차 ID를 확인할 수 없습니다.'
      return
    }

    window.setTimeout(() => {
      void router.push(`/workspaces/${workspaceId.value}/reports/${episodeId}`)
    }, 250)
  } catch {
    pageError.value = analysisStore.analysisError || '충돌 분석에 실패했습니다.'
  }
}

onMounted(() => {
  void runAnalysis()
})
</script>

<template>
  <section class="episode-analysis-page" aria-labelledby="episode-analysis-title">
    <img class="episode-analysis-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <header class="episode-analysis-page__header">
      <h1 id="episode-analysis-title" class="episode-analysis-page__title">{{ episodeLabel }}</h1>
    </header>

    <div class="episode-analysis-page__content">
      <div
        v-if="isLoading"
        class="episode-analysis-page__spinner"
        role="status"
        aria-label="분석 진행 중"
      >
        <span class="episode-analysis-page__spinner-hole" aria-hidden="true"></span>
      </div>
      <div v-else-if="isNoConflict" class="episode-analysis-page__complete" aria-hidden="true">
        <span></span>
      </div>
      <p class="episode-analysis-page__status">{{ statusMessage }}</p>
      <p class="episode-analysis-page__copy">{{ statusCopy }}</p>
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
  justify-content: flex-end;
  min-height: 53px;
  margin-top: 30px;
  border-bottom: 1px solid #eaf1ff;
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

.episode-analysis-page__spinner {
  display: grid;
  place-items: center;
  width: 124px;
  height: 124px;
  background: conic-gradient(var(--color-brand-blue) 0 28%, #ecf879 28% 100%);
  border-radius: 50%;
  animation: episode-analysis-spin 1s linear infinite;
}

.episode-analysis-page__spinner-hole {
  width: 88px;
  height: 88px;
  background: #fefefe;
  border-radius: 50%;
}

.episode-analysis-page__complete {
  position: relative;
  display: grid;
  width: 124px;
  height: 124px;
  place-items: center;
  background: #e8f7f0;
  border: 8px solid #1f9d67;
  border-radius: 50%;
}

.episode-analysis-page__complete span {
  width: 45px;
  height: 25px;
  border-bottom: 6px solid #1f9d67;
  border-left: 6px solid #1f9d67;
  transform: rotate(-45deg) translate(4px, -4px);
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

@keyframes episode-analysis-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
