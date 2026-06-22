import { apiClient } from '@/api/client'

export interface WorkspaceDetailResponse {
  work_id: number
  genre: string
  title: string
  episode_count: number
  total_conflict_count: number
  original_text: string
}

export interface WorkspaceEpisodeResponse {
  episode_id?: number
  episode_no: number
  title: string
  is_conflict: boolean
}

export async function getWorkspaceDetail(workId: number): Promise<WorkspaceDetailResponse> {
  const response = await apiClient.get<WorkspaceDetailResponse>(`/api/v1/workspace/${workId}`)
  return response.data
}

export async function getWorkspaceEpisodes(workId: number): Promise<WorkspaceEpisodeResponse[]> {
  const response = await apiClient.get<WorkspaceEpisodeResponse[]>(`/api/v1/${workId}/episode`)
  return response.data
}
