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
    latestEpisodeNumber.value = payload.episodeNumber
    latestTitle.value = payload.title
    analysisError.value = ''
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
    latestEpisodeNumber,
    latestResult,
    latestTitle,
    latestWorkId,
    pendingRequest,
    queueAnalysis,
    runPendingAnalysis,
  }
})
