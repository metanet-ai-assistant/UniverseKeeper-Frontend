import { apiClient } from '@/api/client'

export interface ConflictCheckItem {
  chunk_index: number
  chunk_text: string
  is_conflict: boolean
  conflicting_sentence: string
  evidence_text: string
  evidence_location: string
  reason: string
  recommended_sentence: string
  confidence_score: number
  hallucination_rate: number
  graph_visualization: Record<string, unknown>
}

export interface ConflictCheckResponse {
  file_name: string
  checked_chunks: number
  is_conflict: boolean
  conflicts: ConflictCheckItem[]
}

export interface ConflictReportResponse {
  id: number
  work_id: number
  episode_id: number
  title: string
  current_sentence: string
  suggested_sentence: string
  reason: string
  confidence_score: number
  hallucination_score: number
  created_at: string
}

export interface ConflictCheckRequest {
  file: File
  workId?: number
  title?: string
}

export async function checkUploadedFileConflict(
  payload: ConflictCheckRequest,
): Promise<ConflictCheckResponse> {
  const formData = new FormData()
  formData.append('file', payload.file)

  if (payload.workId) {
    formData.append('work_id', String(payload.workId))
  }

  if (payload.title) {
    formData.append('title', payload.title)
  }

  const response = await apiClient.post<ConflictCheckResponse>('/api/v1/conflict/check', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function getConflictReports(
  episodeId: number | string,
): Promise<ConflictReportResponse[]> {
  const response = await apiClient.get<ConflictReportResponse[]>(
    `/api/v1/${episodeId}/conflict_reports`,
  )
  return response.data
}
