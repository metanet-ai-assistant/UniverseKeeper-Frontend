export type WorkspaceReviewStatus = 'complete' | 'unchecked'

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
