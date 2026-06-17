<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import {
  getConflictReports,
  type ConflictReportResponse,
} from '@/features/workspace/api/conflictApi'
import { useEpisodeAnalysisStore } from '@/features/workspace/stores/episodeAnalysisStore'

interface ConflictReportItem {
  id: string
  title: string
  manuscript: string
  evidence: string
  recommendation: string
  reason: string
  confidenceLabel: string
  hallucinationLabel: string
}

const route = useRoute()
const analysisStore = useEpisodeAnalysisStore()
const isLoading = ref(false)
const loadError = ref('')
const reportItems = ref<ConflictReportItem[]>([])

const workspaceId = computed(() => getRouteParam(route.params.workspaceId))
const reportId = computed(() => getRouteParam(route.params.reportId))
const reportEpisodeId = computed(() => {
  if (reportId.value === 'latest') {
    return analysisStore.latestEpisodeId
  }

  return reportId.value
})
const summaryMeta = computed(() => {
  if (analysisStore.latestEpisodeId && String(analysisStore.latestEpisodeId) === String(reportEpisodeId.value)) {
    const episodeLabel = analysisStore.latestEpisodeNumber
      ? `${analysisStore.latestEpisodeNumber}화`
      : '최근 분석'
    const titleLabel = analysisStore.latestTitle || '회차 원고'

    return `${episodeLabel} · ${titleLabel}`
  }

  return `회차 ID ${reportEpisodeId.value}`
})
const summaryTitle = computed(() => {
  if (isLoading.value) {
    return '불러오는 중'
  }

  if (loadError.value) {
    return '조회 실패'
  }

  return reportItems.value.length > 0 ? '분석 완료' : '충돌이 없습니다'
})
const summaryCopy = computed(() => {
  if (isLoading.value) {
    return '충돌 리포트를 불러오고 있습니다.'
  }

  if (loadError.value) {
    return loadError.value
  }

  if (reportItems.value.length === 0) {
    return '분석 결과 충돌이 발견되지 않았습니다.'
  }

  return `설정과 원문 사이에서 충돌 ${reportItems.value.length}건을 발견했습니다.`
})

function getRouteParam(param: string | string[] | undefined) {
  if (Array.isArray(param)) {
    return param[0] ?? ''
  }

  return param ?? ''
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return ''
  }

  const normalizedScore = value <= 1 ? value * 100 : value
  return `${Math.round(normalizedScore)}%`
}

function fallbackText(value: unknown, fallback: string) {
  if (value === null || value === undefined) {
    return fallback
  }

  return String(value).trim() || fallback
}

function mapSavedConflict(item: ConflictReportResponse, index: number): ConflictReportItem {
  return {
    id: String(item.id),
    title: fallbackText(item.title, `충돌 ${index + 1}`),
    manuscript: fallbackText(item.current_sentence, '원문 정보가 없습니다.'),
    evidence: '저장된 충돌 리포트',
    recommendation: fallbackText(item.suggested_sentence, '추천 문장이 없습니다.'),
    reason: fallbackText(item.reason, '충돌 사유가 없습니다.'),
    confidenceLabel: formatScore(item.confidence_score),
    hallucinationLabel: formatScore(item.hallucination_score),
  }
}

async function loadReport() {
  loadError.value = ''
  reportItems.value = []
  const episodeId = reportEpisodeId.value

  if (!episodeId) {
    loadError.value = '충돌 리포트 정보를 확인할 수 없습니다.'
    return
  }

  isLoading.value = true

  try {
    const reports = await getConflictReports(episodeId)
    reportItems.value = reports.map((item, index) => mapSavedConflict(item, index))
  } catch {
    loadError.value = '충돌 리포트를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadReport()
})
</script>

<template>
  <section class="conflict-report-page" aria-labelledby="conflict-report-title">
    <img class="conflict-report-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <header class="conflict-report-page__header">
      <RouterLink
        class="conflict-report-page__back"
        :to="`/workspaces/${workspaceId}`"
        aria-label="상세 보기로 돌아가기"
      >
        <span class="conflict-report-page__back-icon" aria-hidden="true"></span>
      </RouterLink>
      <h1 id="conflict-report-title" class="conflict-report-page__title">충돌 리포트</h1>
    </header>

    <article class="conflict-report-page__summary">
      <p class="conflict-report-page__meta">{{ summaryMeta }}</p>
      <h2 class="conflict-report-page__summary-title">{{ summaryTitle }}</h2>
      <p
        class="conflict-report-page__summary-copy"
        :class="{ 'conflict-report-page__summary-copy--clear': reportItems.length === 0 }"
      >
        {{ summaryCopy }}
      </p>
    </article>

    <section class="conflict-report-page__list-section" aria-label="충돌 항목">
      <h2 class="conflict-report-page__section-title">충돌 항목</h2>
      <p v-if="!isLoading && !loadError && reportItems.length === 0" class="conflict-report-page__empty">
        충돌이 없습니다.
      </p>
      <ul class="conflict-report-page__list">
        <li v-for="item in reportItems" :key="item.id" class="conflict-report-card">
          <h3 class="conflict-report-card__title">{{ item.title }}</h3>
          <dl class="conflict-report-card__compare">
            <div>
              <dt>원문</dt>
              <dd>{{ item.manuscript }}</dd>
            </div>
            <div>
              <dt>근거</dt>
              <dd>{{ item.evidence }}</dd>
            </div>
            <div>
              <dt>추천 문장</dt>
              <dd>{{ item.recommendation }}</dd>
            </div>
            <div>
              <dt>사유</dt>
              <dd>{{ item.reason }}</dd>
            </div>
            <div v-if="item.confidenceLabel || item.hallucinationLabel">
              <dt>점수</dt>
              <dd>
                <span v-if="item.confidenceLabel">신뢰도 {{ item.confidenceLabel }}</span>
                <span v-if="item.confidenceLabel && item.hallucinationLabel"> · </span>
                <span v-if="item.hallucinationLabel">환각률 {{ item.hallucinationLabel }}</span>
              </dd>
            </div>
          </dl>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.conflict-report-page {
  min-height: 100dvh;
  padding: 20px 24px 40px;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.conflict-report-page__logo {
  width: 106px;
  height: 50px;
  object-fit: contain;
}

.conflict-report-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 53px;
  margin-top: 30px;
  border-bottom: 1px solid #eaf1ff;
}

.conflict-report-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #111;
}

.conflict-report-page__back-icon {
  width: 17px;
  height: 17px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.conflict-report-page__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__summary {
  min-height: 140px;
  margin-top: 14px;
  padding: 18px 16px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 18px;
}

.conflict-report-page__meta {
  margin: 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__summary-title {
  margin: 22px 0 0;
  color: #2d2d2d;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__summary-copy {
  margin: 13px 0 0;
  color: #d64545;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__summary-copy--clear {
  color: #1f9d67;
}

.conflict-report-page__list-section {
  margin-top: 24px;
}

.conflict-report-page__section-title {
  margin: 0;
  color: #2d2d2d;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 13px 0 0;
  padding: 0;
  list-style: none;
}

.conflict-report-page__empty {
  margin: 13px 0 0;
  padding: 18px 14px;
  color: #6f7280;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: center;
}

.conflict-report-card {
  padding: 17px 15px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.18);
}

.conflict-report-card__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-card__compare {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0 0;
}

.conflict-report-card__compare div {
  padding: 12px;
  background: #f3f9ff;
  border-radius: 10px;
}

.conflict-report-card__compare dt {
  margin: 0;
  color: var(--color-brand-blue);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-card__compare dd {
  margin: 8px 0 0;
  color: #2d2d2d;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0;
}
</style>
