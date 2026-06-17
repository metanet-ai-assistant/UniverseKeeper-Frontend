import type {
  WorkspaceDashboardStats,
  WorkspaceDetail,
  WorkspaceSummary,
} from '@/features/workspace/types'

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

export const mockWorkspaceDetails: WorkspaceDetail[] = [
  {
    id: 'red-moon',
    title: '붉은 달 아래 기억을 되돌리는 소녀의 이야기',
    genre: '판타지',
    episodeCount: 19,
    conflictCount: 2,
    episodes: [
      {
        id: 'episode-19',
        number: 19,
        title: '침묵하는 왕관',
        conflictStatus: 'conflict',
      },
      {
        id: 'episode-18',
        number: 18,
        title: '붉은 달의 경계',
        conflictStatus: 'clear',
      },
      {
        id: 'episode-17',
        number: 17,
        title: '왕의 비밀',
        conflictStatus: 'clear',
      },
      {
        id: 'episode-16',
        number: 16,
        title: '불타는 기억',
        conflictStatus: 'clear',
      },
    ],
    initialSetting: `# 초기 설정 - 붉은 달의 기억

## 작품 개요

- **장르:** 판타지
- **배경:** 붉은 달이 뜨는 밤마다 일부 사람의 기억이 되돌아가는 세계
- **핵심 주제:** 기억, 선택, 대가

## 주인공

### 유진

- 나이: 22세
- 성별: 여성
- 주 사용 손: 왼손
- 특징: 붉은 달이 뜨면 자신의 기억을 최대 10분 전으로 되돌릴 수 있다.
  성격: 신중하지만 타인의 위험 앞에서는 충동적으로 행동한다.
- 약점: 능력을 사용할 때 6시간 동안 심한 두통과 기억 혼란을 겪는다.
- 비밀: 유진은 왕가의 마지막 생존자이지만 본인은 아직 이를 모른다.

## 주요 인물

### 민호

- 나이: 27세
- 직업: 왕실 호위 기사
- 유진과의 관계: 유진을 보호하는 조력자
- 알고 있는 사실:
  - 유진이 왕가의 혈통이라는 사실을 알고 있다.
  - 왕이 독살당했다는 사실을 알고 있다.
- 숨기고 있는 사실:
  - 유진의 기억 일부를 직접 봉인했다.`,
  },
  {
    id: 'after-stars',
    title: '별이 꺼진 후의 기록작',
    genre: '판타지',
    episodeCount: 7,
    conflictCount: 0,
    episodes: [
      {
        id: 'episode-7',
        number: 7,
        title: '마지막 별빛',
        conflictStatus: 'clear',
      },
      {
        id: 'episode-6',
        number: 6,
        title: '기록자의 방',
        conflictStatus: 'clear',
      },
    ],
    initialSetting: `# 초기 설정 - 별이 꺼진 후의 기록작

## 작품 개요

- 장르: 판타지
- 배경: 별빛이 사라진 왕국
- 핵심 주제: 기록, 상실, 회복`,
  },
]
