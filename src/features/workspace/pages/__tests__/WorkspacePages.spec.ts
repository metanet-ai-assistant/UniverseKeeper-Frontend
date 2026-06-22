import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/stores/authStore'
import type {
  ConflictCheckRequest,
  ConflictCheckResponse,
  ConflictReportResponse,
} from '@/features/workspace/api/conflictApi'
import type {
  EntityDetailResponse,
  EntitySubgraphResponse,
} from '@/features/workspace/api/graphApi'
import type {
  KpiSummaryResponse,
  WorkspaceListItemResponse,
} from '@/features/workspace/api/workspaceApi'
import type {
  WorkspaceDetailResponse,
  WorkspaceEpisodeResponse,
} from '@/features/workspace/api/workspaceDetailApi'
import { useEpisodeAnalysisStore } from '@/features/workspace/stores/episodeAnalysisStore'
import ConflictReportPage from '../ConflictReportPage.vue'
import EpisodeAnalysisPage from '../EpisodeAnalysisPage.vue'
import EpisodeUploadPage from '../EpisodeUploadPage.vue'
import NewWorkspacePage from '../NewWorkspacePage.vue'
import WorkspaceDetailPage from '../WorkspaceDetailPage.vue'
import WorkspaceListPage from '../WorkspaceListPage.vue'

const workspaceApiMocks = vi.hoisted(() => ({
  getKpiSummary: vi.fn<() => Promise<KpiSummaryResponse>>(),
  getWorkspaces: vi.fn<() => Promise<WorkspaceListItemResponse[]>>(),
}))

const graphApiMocks = vi.hoisted(() => ({
  getEntities: vi.fn<() => Promise<string[]>>(),
  getEntityDetails: vi.fn<() => Promise<EntityDetailResponse>>(),
  getEntitySubgraph: vi.fn<() => Promise<EntitySubgraphResponse>>(),
}))

const workspaceDetailApiMocks = vi.hoisted(() => ({
  getWorkspaceDetail: vi.fn<() => Promise<WorkspaceDetailResponse>>(),
  getWorkspaceEpisodes: vi.fn<() => Promise<WorkspaceEpisodeResponse[]>>(),
}))

const conflictApiMocks = vi.hoisted(() => ({
  checkUploadedFileConflict: vi.fn<
    (payload: ConflictCheckRequest) => Promise<ConflictCheckResponse>
  >(),
  getConflictReports: vi.fn<(episodeId: number | string) => Promise<ConflictReportResponse[]>>(),
}))

const routerMocks = vi.hoisted(() => ({
  push: vi.fn<(path: string) => Promise<void> | void>(),
  routeParams: {
    workspaceId: '12',
    episodeId: '19',
  },
}))

vi.mock('@/features/workspace/api/conflictApi', () => conflictApiMocks)
vi.mock('@/features/workspace/api/graphApi', () => graphApiMocks)
vi.mock('@/features/workspace/api/workspaceApi', () => workspaceApiMocks)
vi.mock('@/features/workspace/api/workspaceDetailApi', () => workspaceDetailApiMocks)

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')

  return {
    ...actual,
    useRoute: () => ({
      params: routerMocks.routeParams,
    }),
    useRouter: () => ({
      push: routerMocks.push,
    }),
  }
})

beforeEach(() => {
  vi.useRealTimers()
  routerMocks.push.mockReset()
  routerMocks.routeParams.workspaceId = '12'
  routerMocks.routeParams.episodeId = '19'

  workspaceApiMocks.getKpiSummary.mockReset()
  workspaceApiMocks.getWorkspaces.mockReset()
  graphApiMocks.getEntities.mockReset()
  graphApiMocks.getEntityDetails.mockReset()
  graphApiMocks.getEntitySubgraph.mockReset()
  workspaceDetailApiMocks.getWorkspaceDetail.mockReset()
  workspaceDetailApiMocks.getWorkspaceEpisodes.mockReset()
  conflictApiMocks.checkUploadedFileConflict.mockReset()
  conflictApiMocks.getConflictReports.mockReset()

  workspaceApiMocks.getKpiSummary.mockResolvedValue({
    total_works: 2,
    total_requests: 48,
    conflicted_episodes: 7,
  })
  workspaceApiMocks.getWorkspaces.mockResolvedValue([
    {
      work_id: 11,
      genre: '판타지',
      title: '별이 꺼진 후의 기록작',
      episode_count: 7,
      latest_version_conflict_count: 0,
    },
    {
      work_id: 12,
      genre: '판타지',
      title: '붉은 달의 기억',
      episode_count: 19,
      latest_version_conflict_count: 2,
    },
  ])
  workspaceDetailApiMocks.getWorkspaceDetail.mockResolvedValue({
    work_id: 12,
    genre: '판타지',
    title: '붉은 달의 기억',
    episode_count: 19,
    total_conflict_count: 2,
    original_text: '# 초기 설정 - 붉은 달의 기억',
  })
  workspaceDetailApiMocks.getWorkspaceEpisodes.mockResolvedValue([
    {
      episode_id: 191,
      episode_no: 19,
      title: '침묵하는 왕관',
      is_conflict: true,
    },
    {
      episode_no: 18,
      title: '붉은 달의 경계',
      is_conflict: false,
    },
  ])
  graphApiMocks.getEntities.mockResolvedValue(['유진'])
  graphApiMocks.getEntityDetails.mockResolvedValue({
    entity: {
      name: '유진',
      type: 'CHARACTER',
      description: '기억을 되돌리는 주인공',
      work_id: 12,
      episode_id: 1,
      episode_ids: [1],
    },
    relationships: [],
  })
  graphApiMocks.getEntitySubgraph.mockResolvedValue({
    nodes: [
      { id: '유진', label: '유진', properties: {} },
      { id: '민호', label: '민호', properties: {} },
    ],
    edges: [{ source: '유진', target: '민호', label: 'RELATED', properties: {} }],
  })
  conflictApiMocks.checkUploadedFileConflict.mockResolvedValue({
    episode_id: 201,
    file_name: 'episode-20.docx',
    checked_chunks: 2,
    is_conflict: true,
    conflicts: [
      {
        chunk_index: 0,
        chunk_text: '민호가 왕관을 들고 등장한다.',
        is_conflict: true,
        conflicting_sentence: '왕관 소유 충돌',
        evidence_text: '왕관은 왕실 금고에 봉인되어 있다.',
        evidence_location: '초기 설정',
        reason: '왕관의 위치가 초기 설정과 다릅니다.',
        recommended_sentence: '민호는 왕관이 봉인된 금고를 발견한다.',
        confidence_score: 0.91,
        hallucination_rate: 0.12,
        graph_visualization: {},
      },
    ],
  })
  conflictApiMocks.getConflictReports.mockResolvedValue([
    {
      id: 1,
      work_id: 12,
      episode_id: 191,
      title: '왕관 소유 충돌',
      current_sentence: '민호가 왕관을 들고 등장한다.',
      suggested_sentence: '민호는 왕관이 봉인된 금고를 발견한다.',
      reason: '왕관의 위치가 초기 설정과 다릅니다.',
      confidence_score: 0.91,
      hallucination_score: 0.12,
      created_at: '2026-06-17T05:38:48.948Z',
    },
  ])
})

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountWorkspacePage(component: object, pinia = createPinia()) {
  return mount(component, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: routerLinkStub,
      },
    },
  })
}

describe('Workspace pages', () => {
  it('renders workspace list from API data', async () => {
    const pinia = createPinia()
    const authStore = useAuthStore(pinia)
    authStore.user = {
      user_id: 1,
      email: 'user@example.com',
      user_name: '네이버메일',
      role: 'USER',
    }

    const wrapper = mount(WorkspaceListPage, {
      global: {
        plugins: [pinia],
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(wrapper.text()).toContain('작품 목록을 불러오는 중입니다.')

    await flushPromises()

    expect(workspaceApiMocks.getKpiSummary).toHaveBeenCalledTimes(1)
    expect(workspaceApiMocks.getWorkspaces).toHaveBeenCalledTimes(1)
    expect(wrapper.get('h1').text()).toContain('안녕하세요, 네이버메일 작가님')
    expect(wrapper.text()).toContain('현재 2개 작품을 관리 중입니다.')
    expect(wrapper.text()).toContain('user@example.com · USER')
    expect(wrapper.text()).toContain('네이버메일님의 워크스페이스')
    expect(wrapper.text()).toContain('별이 꺼진 후의 기록작')
    expect(wrapper.text()).toContain('미검토 2건')
    expect(wrapper.text()).toContain('총 회차 수 19회')
    expect(wrapper.find('.workspace-list-page__logo-link[href="/workspaces"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/workspaces/new"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/workspaces/12"]').exists()).toBe(true)
  })

  it('shows an empty state when there are no workspaces', async () => {
    workspaceApiMocks.getKpiSummary.mockResolvedValueOnce({
      total_works: 0,
      total_requests: 0,
      conflicted_episodes: 0,
    })
    workspaceApiMocks.getWorkspaces.mockResolvedValueOnce([])

    const wrapper = mountWorkspacePage(WorkspaceListPage)

    await flushPromises()

    expect(wrapper.text()).toContain('아직 등록된 작품이 없습니다.')
    expect(wrapper.find('.workspace-card').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('별이 꺼진 후의 기록작')
    expect(wrapper.text()).not.toContain('붉은 달의 기억')
  })

  it('keeps new workspace creation states in a single page', async () => {
    const wrapper = mountWorkspacePage(NewWorkspacePage)

    const submitButton = wrapper.get<HTMLButtonElement>('button[type="submit"]')

    expect(wrapper.get('h1').text()).toBe('새 작품 만들기')
    expect(submitButton.text()).toBe('작품 생성')
    expect(submitButton.element.disabled).toBe(false)
    expect(wrapper.find('.new-workspace-page__logo-link[href="/workspaces"]').exists()).toBe(true)
    expect(wrapper.find('textarea[name="workspace-settings"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('원고를 업로드하거나 붙여넣으세요')

    const uploadModeButton = wrapper.findAll('.new-workspace-page__mode-button')[1]

    if (!uploadModeButton) {
      throw new Error('Upload mode button was not rendered.')
    }

    await uploadModeButton.trigger('click')

    expect(uploadModeButton.attributes('aria-pressed')).toBe('true')
    expect(wrapper.text()).toContain('원고를 업로드하거나 붙여넣으세요')
    expect(wrapper.find('textarea[name="workspace-settings"]').exists()).toBe(false)

    const workspaceFile = new File(['abc'], 'workspace-setting.txt', { type: 'text/plain' })
    const workspaceFileInput = wrapper.get<HTMLInputElement>('input[type="file"]')

    Object.defineProperty(workspaceFileInput.element, 'files', {
      configurable: true,
      value: [workspaceFile],
    })
    await workspaceFileInput.trigger('change')

    expect(wrapper.text()).toContain('workspace-setting.txt')
    expect(wrapper.text()).toContain('3B')
    expect(wrapper.get('.new-workspace-page__file-button').text()).toContain('파일 변경')

    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('h1').text()).toBe('새 작품 만들기')
    expect(wrapper.text()).toContain('작품명을 입력해주세요.')
  })

  it('keeps workspace detail tabs and graph modal in a single page', async () => {
    const wrapper = mountWorkspacePage(WorkspaceDetailPage)

    expect(wrapper.get('h1').text()).toBe('상세 보기')
    expect(wrapper.text()).toContain('작품 상세 정보를 불러오는 중입니다.')

    await flushPromises()

    expect(workspaceDetailApiMocks.getWorkspaceDetail).toHaveBeenCalledWith(12)
    expect(workspaceDetailApiMocks.getWorkspaceEpisodes).toHaveBeenCalledWith(12)
    expect(wrapper.text()).toContain('붉은 달의 기억')
    expect(wrapper.text()).toContain('침묵하는 왕관')
    expect(wrapper.text()).not.toContain('# 초기 설정 - 붉은 달의 기억')
    expect(wrapper.find('.workspace-detail-page__logo-link[href="/workspaces"]').exists()).toBe(
      true,
    )
    expect(wrapper.find('a[href="/workspaces/12/episodes/new"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/workspaces/12/reports/191"]').exists()).toBe(true)
    expect(wrapper.find('.episode-card__chevron').exists()).toBe(false)

    await wrapper.get('button[role="tab"]:nth-of-type(2)').trigger('click')

    expect(wrapper.text()).toContain('설정 보기')
    expect(wrapper.text()).toContain('# 초기 설정 - 붉은 달의 기억')

    await wrapper.get('.settings-panel__action--graph').trigger('click')

    expect(wrapper.get('[role="dialog"]').text()).toContain('Graph')
    await flushPromises()
    expect(graphApiMocks.getEntities).toHaveBeenCalledWith(12)
    expect(graphApiMocks.getEntityDetails).toHaveBeenCalledWith('유진', 12)
    expect(graphApiMocks.getEntitySubgraph).toHaveBeenCalledWith('유진', 12)
    expect(wrapper.findAll('.graph-modal__node')).toHaveLength(2)
    expect(wrapper.findAll('.graph-modal__edge')).toHaveLength(1)

    await wrapper.get('.graph-modal__close').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('shows an empty state when workspace has no episodes', async () => {
    workspaceDetailApiMocks.getWorkspaceEpisodes.mockResolvedValueOnce([])

    const wrapper = mountWorkspacePage(WorkspaceDetailPage)

    await flushPromises()

    expect(wrapper.text()).toContain('등록된 회차가 없습니다.')
    expect(wrapper.find('.workspace-detail-page__episode-list').exists()).toBe(false)
  })

  it('does not build a conflict report link from episode number', async () => {
    workspaceDetailApiMocks.getWorkspaceEpisodes.mockResolvedValueOnce([
      {
        episode_no: 19,
        title: '침묵하는 왕관',
        is_conflict: true,
      },
    ])

    const wrapper = mountWorkspacePage(WorkspaceDetailPage)

    await flushPromises()

    expect(wrapper.text()).toContain('침묵하는 왕관')
    expect(wrapper.find('a[href="/workspaces/12/reports/19"]').exists()).toBe(false)
  })

  it('queues a docx file before moving to episode analysis', async () => {
    const pinia = createPinia()
    const wrapper = mountWorkspacePage(EpisodeUploadPage, pinia)
    const analysisStore = useEpisodeAnalysisStore(pinia)

    expect(wrapper.get('h1').text()).toBe('회차 업로드')
    expect(wrapper.find('.episode-upload-page__logo-link[href="/workspaces/12"]').exists()).toBe(
      true,
    )
    expect(wrapper.get<HTMLInputElement>('input[name="episode-number"]').element.value).toBe('')
    expect(wrapper.get('input[name="episode-number"]').attributes('placeholder')).toBe('회차')
    expect(wrapper.get<HTMLInputElement>('input[name="episode-title"]').element.value).toBe('')
    expect(wrapper.get('input[name="episode-title"]').attributes('placeholder')).toBe('제목')
    expect(wrapper.find('.episode-upload-page__upload-zone').exists()).toBe(true)
    expect(wrapper.text()).toContain('TXT · MD · DOC · DOCX 파일, 최대 10MB')
    expect(wrapper.get('input[type="file"]').attributes('accept')).toBe('.txt,.md,.doc,.docx')
    expect(wrapper.get('button[type="submit"]').text()).toBe('분석 시작')

    await wrapper.get('input[name="episode-number"]').setValue('20')
    await wrapper.get('input[name="episode-title"]').setValue('왕관의 균열')

    const episodeFile = new File(['abc'], 'episode-20.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const episodeFileInput = wrapper.get<HTMLInputElement>('input[type="file"]')

    Object.defineProperty(episodeFileInput.element, 'files', {
      configurable: true,
      value: [episodeFile],
    })
    await episodeFileInput.trigger('change')

    expect(wrapper.text()).toContain('episode-20.docx')
    expect(wrapper.text()).toContain('3B')
    expect(wrapper.get('.episode-upload-page__file-button').text()).toContain('파일 변경')

    await wrapper.get('form').trigger('submit')

    expect(analysisStore.pendingRequest?.workId).toBe(12)
    expect(analysisStore.pendingRequest?.episodeNumber).toBe('20')
    expect(analysisStore.pendingRequest?.title).toBe('왕관의 균열')
    expect(analysisStore.pendingRequest?.file.name).toBe('episode-20.docx')
    expect(routerMocks.push).toHaveBeenCalledWith('/workspaces/12/episodes/analyzing')
  })

  it('runs pending episode conflict analysis before moving to the report endpoint route', async () => {
    vi.useFakeTimers()

    const pinia = createPinia()
    const analysisStore = useEpisodeAnalysisStore(pinia)
    const episodeFile = new File(['abc'], 'episode-20.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    analysisStore.queueAnalysis({
      workId: 12,
      episodeNumber: '20',
      title: '왕관의 균열',
      file: episodeFile,
    })

    const wrapper = mountWorkspacePage(EpisodeAnalysisPage, pinia)

    await flushPromises()

    expect(conflictApiMocks.checkUploadedFileConflict).toHaveBeenCalledWith({
      file: episodeFile,
      workId: 12,
      title: '왕관의 균열',
    })
    expect(analysisStore.latestResult?.file_name).toBe('episode-20.docx')
    expect(analysisStore.latestEpisodeId).toBe(201)

    vi.advanceTimersByTime(250)
    await flushPromises()

    expect(routerMocks.push).toHaveBeenCalledWith('/workspaces/12/reports/201')

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('stays on the analysis page when conflict check has no conflict', async () => {
    const pinia = createPinia()
    const analysisStore = useEpisodeAnalysisStore(pinia)
    const episodeFile = new File(['abc'], 'episode-21.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    analysisStore.queueAnalysis({
      workId: 12,
      episodeNumber: '21',
      title: '고요한 복도',
      file: episodeFile,
    })
    conflictApiMocks.checkUploadedFileConflict.mockResolvedValueOnce({
      file_name: 'episode-21.docx',
      work_id: 12,
      checked_chunks: 2,
      is_conflict: false,
      conflict_report_count: 0,
      conflicts: [],
    })

    const wrapper = mountWorkspacePage(EpisodeAnalysisPage, pinia)

    await flushPromises()

    expect(analysisStore.latestEpisodeId).toBeNull()
    expect(routerMocks.push).not.toHaveBeenCalledWith('/workspaces/12/reports/21')
    expect(wrapper.text()).toContain('21화 분석 완료')
    expect(wrapper.text()).toContain('충돌이 없습니다.')
    expect(wrapper.find('.episode-analysis-page__back').exists()).toBe(false)
    expect(wrapper.find('.episode-analysis-page__logo-link[href="/workspaces/12"]').exists()).toBe(
      true,
    )
    expect(wrapper.find('.episode-analysis-page__workspace-link[href="/workspaces/12"]').exists()).toBe(
      true,
    )
    expect(wrapper.text()).toContain('워크스페이스로 이동')
  })

  it('does not allow leaving while episode conflict analysis is loading', async () => {
    const pinia = createPinia()
    const analysisStore = useEpisodeAnalysisStore(pinia)
    const episodeFile = new File(['abc'], 'episode-22.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    analysisStore.queueAnalysis({
      workId: 12,
      episodeNumber: '22',
      title: '기다리는 방',
      file: episodeFile,
    })
    conflictApiMocks.checkUploadedFileConflict.mockReturnValueOnce(
      new Promise<ConflictCheckResponse>(() => undefined),
    )

    const wrapper = mountWorkspacePage(EpisodeAnalysisPage, pinia)

    await flushPromises()

    expect(wrapper.text()).toContain('22화 분석 중')
    expect(wrapper.find('.episode-analysis-page__spinner').exists()).toBe(true)
    expect(wrapper.find('a[href="/workspaces/12"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('loads saved conflict reports from API', async () => {
    const wrapper = mountWorkspacePage(ConflictReportPage)

    await flushPromises()

    expect(conflictApiMocks.getConflictReports).toHaveBeenCalledWith('19')
    expect(wrapper.get('h1').text()).toBe('충돌 리포트')
    expect(wrapper.find('.conflict-report-page__logo-link[href="/workspaces/12"]').exists()).toBe(
      true,
    )
    expect(wrapper.text()).toContain('분석 완료')
    expect(wrapper.text()).toContain('왕관 소유 충돌')
    expect(wrapper.text()).toContain('신뢰도 91%')
  })

  it('shows no conflict state from the conflict reports API', async () => {
    conflictApiMocks.getConflictReports.mockResolvedValueOnce([])

    const wrapper = mountWorkspacePage(ConflictReportPage)

    await flushPromises()

    expect(conflictApiMocks.getConflictReports).toHaveBeenCalledWith('19')
    expect(wrapper.text()).toContain('충돌이 없습니다.')
    expect(wrapper.find('.conflict-report-card').exists()).toBe(false)
  })

  it('renders conflict reports even when optional fields are omitted', async () => {
    conflictApiMocks.getConflictReports.mockResolvedValueOnce([
      {
        id: 2,
        work_id: 12,
        episode_id: 19,
        title: null,
        current_sentence: '유진은 왕관을 착용했다.',
        suggested_sentence: '유진은 봉인된 왕관을 바라봤다.',
        reason: '왕관은 봉인되어 있어 착용할 수 없습니다.',
        confidence_score: 0.88,
        hallucination_score: 0.05,
        created_at: '2026-06-17T05:38:48.948Z',
      },
    ])

    const wrapper = mountWorkspacePage(ConflictReportPage)

    await flushPromises()

    expect(wrapper.text()).toContain('설정과 원문 사이에서 충돌 1건을 발견했습니다.')
    expect(wrapper.text()).toContain('왕관은 봉인되어 있어 착용할 수 없습니다.')
    expect(wrapper.text()).toContain('신뢰도 88%')
    expect(wrapper.text()).toContain('환각률 5%')
  })

  it('shows an analysis error when conflict check does not return an episode id', async () => {
    vi.useFakeTimers()
    const pinia = createPinia()
    const analysisStore = useEpisodeAnalysisStore(pinia)
    const episodeFile = new File(['abc'], 'episode-20.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    analysisStore.queueAnalysis({
      workId: 12,
      episodeNumber: '20',
      title: '왕관의 균열',
      file: episodeFile,
    })
    conflictApiMocks.checkUploadedFileConflict.mockResolvedValueOnce({
      file_name: 'episode-20.docx',
      checked_chunks: 1,
      is_conflict: true,
      conflicts: [
        {
          chunk_index: 0,
          chunk_text: '유진은 왕관을 착용했다.',
        },
      ],
    })

    const wrapper = mountWorkspacePage(EpisodeAnalysisPage, pinia)

    await flushPromises()

    expect(wrapper.text()).toContain('분석 결과에서 회차 ID를 확인할 수 없습니다.')
    expect(routerMocks.push).not.toHaveBeenCalledWith('/workspaces/12/reports/latest')

    wrapper.unmount()
    vi.useRealTimers()
  })
})
