import { apiClient } from '@/api/client'

export interface IngestWorkspaceFileRequest {
  file: File
  title?: string
  genre?: string
  description?: string
}

export interface IngestWorkspaceFileResponse {
  episode_id: number
  work_id: number
  file_name: string
  chunks_count: number
  entities_count: number
  relationships_count: number
  loaded_success: boolean
}

export interface IngestEpisodeRequest {
  workId: number
  title: string
  content: string
}

export async function ingestWorkspaceFile(
  payload: IngestWorkspaceFileRequest,
): Promise<IngestWorkspaceFileResponse> {
  const formData = new FormData()
  formData.append('file', payload.file)

  if (payload.title) {
    formData.append('title', payload.title)
  }

  if (payload.genre) {
    formData.append('genre', payload.genre)
  }

  if (payload.description) {
    formData.append('description', payload.description)
  }

  const response = await apiClient.post<IngestWorkspaceFileResponse>(
    '/api/v1/workspace/ingest',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data
}

export async function ingestEpisode(payload: IngestEpisodeRequest): Promise<string> {
  const formData = new URLSearchParams()
  formData.set('work_id', String(payload.workId))
  formData.set('title', payload.title)
  formData.set('content', payload.content)

  const response = await apiClient.post<string>('/api/v1/episode/ingest', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.data
}
