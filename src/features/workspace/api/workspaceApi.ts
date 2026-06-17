import { apiClient } from '@/api/client'

export interface KpiSummaryResponse {
  total_works: number
  total_requests: number
  conflicted_episodes: number
}

export interface WorkspaceListItemResponse {
  work_id: number
  genre: string
  title: string
  episode_count: number
  latest_version_conflict_count: number
}

export async function getKpiSummary(): Promise<KpiSummaryResponse> {
  const response = await apiClient.get<KpiSummaryResponse>('/api/v1/kpi/summary')
  return response.data
}

export async function getWorkspaces(): Promise<WorkspaceListItemResponse[]> {
  const response = await apiClient.get<WorkspaceListItemResponse[]>('/api/v1/workspace')
  return response.data
}
