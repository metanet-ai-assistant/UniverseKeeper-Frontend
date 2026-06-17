export type WorkspaceReviewStatus = 'complete' | 'unchecked'

export type WorkspaceDetailTab = 'episodes' | 'settings'

export type EpisodeConflictStatus = 'conflict' | 'clear'

export interface WorkspaceDashboardStats {
  userName: string
  totalWorks: number
  totalRequests: number
  mergeConflicts: number
}

export interface WorkspaceSummary {
  id: string
  title: string
  genre: string
  episodeCount: number
  approvedSettingCount: number
  totalSettingCount: number
  reviewStatus: WorkspaceReviewStatus
  uncheckedIssueCount: number
}

export interface WorkspaceEpisode {
  id: string
  number: number
  title: string
  conflictStatus: EpisodeConflictStatus
}

export interface WorkspaceDetail {
  id: string
  title: string
  genre: string
  episodeCount: number
  settingCount: number
  conflictCount: number
  episodes: WorkspaceEpisode[]
  initialSetting: string
}
