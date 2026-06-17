import { apiClient } from '@/api/client'

export interface GraphNode {
  id: string
  label: string
  properties: Record<string, unknown>
}

export interface GraphEdge {
  source: string
  target: string
  label: string
  properties: Record<string, unknown>
}

export interface EntityDetailResponse {
  entity: {
    name: string
    type: string
    description: string
    work_id: number
    episode_id: number
    episode_ids: number[]
  }
  relationships: Array<{
    source: string
    target: string
    description: string
    work_id: number
    episode_id: number
    episode_ids: number[]
  }>
}

export interface EntitySubgraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export async function getEntities(workId?: number): Promise<string[]> {
  const response = await apiClient.get<string[]>('/api/v1/entities', {
    params: {
      work_id: workId,
    },
  })
  return response.data
}

export async function getEntityDetails(
  entityName: string,
  workId?: number,
): Promise<EntityDetailResponse> {
  const response = await apiClient.get<EntityDetailResponse>(
    `/api/v1/entities/${encodeURIComponent(entityName)}`,
    {
      params: {
        work_id: workId,
      },
    },
  )
  return response.data
}

export async function getEntitySubgraph(
  entityName: string,
  workId?: number,
): Promise<EntitySubgraphResponse> {
  const response = await apiClient.get<EntitySubgraphResponse>(
    `/api/v1/entities/${encodeURIComponent(entityName)}/subgraph`,
    {
      params: {
        work_id: workId,
      },
    },
  )
  return response.data
}
