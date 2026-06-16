import type { WorkspaceDashboardStats, WorkspaceSummary } from '@/features/workspace/types'

export const mockWorkspaceStats: WorkspaceDashboardStats = {
  userName: '전찬혁',
  totalWorks: 2,
  totalRequests: 48,
  mergeConflicts: 7,
}

export const mockWorkspaces: WorkspaceSummary[] = [
  {
    id: 'after-stars',
    title: '별이 꺼진 후의 기록작',
    genre: '판타지',
    episodeCount: 7,
    approvedSettingCount: 16,
    totalSettingCount: 16,
    reviewStatus: 'complete',
    uncheckedIssueCount: 0,
  },
  {
    id: 'red-moon',
    title: '붉은 달의 기억',
    genre: '판타지',
    episodeCount: 19,
    approvedSettingCount: 32,
    totalSettingCount: 40,
    reviewStatus: 'unchecked',
    uncheckedIssueCount: 2,
  },
]
