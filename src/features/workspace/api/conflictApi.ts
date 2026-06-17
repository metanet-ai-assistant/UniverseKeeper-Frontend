import { apiClient } from '@/api/client'

export interface ConflictCheckItem {
  chunk_index: number
  chunk_text: string
  is_conflict?: boolean | null
  conflicting_sentence?: string | null
  evidence_text?: string | null
  evidence_location?: string | null
  reason?: string | null
  recommended_sentence?: string | null
  confidence_score?: number | null
  hallucination_rate?: number | null
  hallucination_score?: number | null
  graph_visualization?: Record<string, unknown> | null
}

export interface ConflictCheckResponse {
  episode_id?: number | string | null
  work_id?: number | string | null
  file_name: string
  checked_chunks: number
  is_conflict: boolean
  conflicts: ConflictCheckItem[]
}

export interface ConflictReportResponse {
  id: number
  work_id: number
  episode_id: number
  title?: string | null
  current_sentence?: string | null
  suggested_sentence?: string | null
  reason?: string | null
  confidence_score?: number | null
  hallucination_score?: number | null
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
    timeout: 0,
  })
  return response.data
}

export async function getConflictReports(
  episodeId: number | string,
): Promise<ConflictReportResponse[]> {
  const response = await apiClient.get<ConflictReportResponse[]>(
    `/api/v1/${episodeId}/conflict_reports`,
    {
      timeout: 0,
    },
  )
  return response.data
}
