import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  checkUploadedFileConflict,
  type ConflictCheckResponse,
} from '@/features/workspace/api/conflictApi'

export interface PendingEpisodeAnalysis {
  workId: number
  episodeNumber: string
  title: string
  file: File
}

export const useEpisodeAnalysisStore = defineStore('episodeAnalysis', () => {
  const pendingRequest = ref<PendingEpisodeAnalysis | null>(null)
  const latestResult = ref<ConflictCheckResponse | null>(null)
  const latestWorkId = ref<number | null>(null)
  const latestEpisodeId = ref<number | string | null>(null)
  const latestEpisodeNumber = ref('')
  const latestTitle = ref('')
  const isAnalyzing = ref(false)
  const analysisError = ref('')

  const hasPendingRequest = computed(() => Boolean(pendingRequest.value))
  const hasLatestResult = computed(() => Boolean(latestResult.value))

  function queueAnalysis(payload: PendingEpisodeAnalysis) {
    pendingRequest.value = payload
    latestResult.value = null
    latestWorkId.value = payload.workId
    latestEpisodeId.value = null
    latestEpisodeNumber.value = payload.episodeNumber
    latestTitle.value = payload.title
    analysisError.value = ''
  }

  function resolveEpisodeId(result: ConflictCheckResponse) {
    return result.episode_id ?? null
  }

  async function runPendingAnalysis() {
    if (!pendingRequest.value) {
      throw new Error('Pending episode analysis is missing.')
    }

    const request = pendingRequest.value
    isAnalyzing.value = true
    analysisError.value = ''

    try {
      const result = await checkUploadedFileConflict({
        file: request.file,
        workId: request.workId,
        title: request.title,
      })

      latestResult.value = result
      latestWorkId.value = request.workId
      latestEpisodeId.value = resolveEpisodeId(result)
      latestEpisodeNumber.value = request.episodeNumber
      latestTitle.value = request.title
      pendingRequest.value = null

      return result
    } catch (error) {
      analysisError.value = '충돌 분석에 실패했습니다.'
      throw error
    } finally {
      isAnalyzing.value = false
    }
  }

  function clearLatestResult() {
    latestResult.value = null
    latestWorkId.value = null
    latestEpisodeId.value = null
    latestEpisodeNumber.value = ''
    latestTitle.value = ''
    analysisError.value = ''
  }

  return {
    analysisError,
    clearLatestResult,
    hasLatestResult,
    hasPendingRequest,
    isAnalyzing,
    latestEpisodeId,
    latestEpisodeNumber,
    latestResult,
    latestTitle,
    latestWorkId,
    pendingRequest,
    queueAnalysis,
    runPendingAnalysis,
  }
})
