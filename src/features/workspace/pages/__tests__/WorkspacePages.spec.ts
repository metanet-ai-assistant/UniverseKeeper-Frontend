import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/stores/authStore'
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
import ConflictReportPage from '../ConflictReportPage.vue'
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

vi.mock('@/features/workspace/api/graphApi', () => graphApiMocks)
vi.mock('@/features/workspace/api/workspaceApi', () => workspaceApiMocks)
vi.mock('@/features/workspace/api/workspaceDetailApi', () => workspaceDetailApiMocks)

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')

  return {
    ...actual,
    useRoute: () => ({
      params: {
        workspaceId: '12',
        reportId: 'mock-episode-19',
      },
    }),
    useRouter: () => ({
      push: vi.fn<() => Promise<void> | void>(),
    }),
  }
})

beforeEach(() => {
  workspaceApiMocks.getKpiSummary.mockReset()
  workspaceApiMocks.getWorkspaces.mockReset()
  graphApiMocks.getEntities.mockReset()
  graphApiMocks.getEntityDetails.mockReset()
  graphApiMocks.getEntitySubgraph.mockReset()
  workspaceDetailApiMocks.getWorkspaceDetail.mockReset()
  workspaceDetailApiMocks.getWorkspaceEpisodes.mockReset()

  workspaceApiMocks.getKpiSummary.mockResolvedValue({
    total_works: 2,
    total_requests: 48,
    conflicted_episodes: 7,
  })
  workspaceApiMocks.getWorkspaces.mockResolvedValue([
    {
      work_id: 11,
      genre: '판타지',
      title: '별이 꺼진 뒤의 기록자',
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
    title: '붉은 달 아래 기억을 되돌리는 소녀의 이야기',
    episode_count: 19,
    total_conflict_count: 2,
    original_text: '# 초기 설정 - 붉은 달의 기억',
  })
  workspaceDetailApiMocks.getWorkspaceEpisodes.mockResolvedValue([
    {
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
})

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

function mountWorkspacePage(component: object) {
  return mount(component, {
    global: {
      plugins: [createPinia()],
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
      user_name: '유저',
      role: 'user',
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
    expect(wrapper.get('h1').text()).toContain('안녕하세요, 유저 작가님')
    expect(wrapper.text()).toContain('현재 2개 작품을 관리 중입니다.')
    expect(wrapper.text()).toContain('user@example.com · user')
    expect(wrapper.text()).toContain('유저님의 워크스페이스')
    expect(wrapper.text()).toContain('별이 꺼진 뒤의 기록자')
    expect(wrapper.text()).toContain('미검토 2건')
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
    expect(wrapper.text()).toContain('붉은 달 아래 기억을 되돌리는 소녀의 이야기')
    expect(wrapper.text()).toContain('침묵하는 왕관')
    expect(wrapper.text()).not.toContain('# 초기 설정 - 붉은 달의 기억')
    expect(wrapper.find('a[href="/workspaces/12/episodes/new"]').exists()).toBe(true)

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

  it('keeps episode upload modes in a single page', async () => {
    const wrapper = mountWorkspacePage(EpisodeUploadPage)

    expect(wrapper.get('h1').text()).toBe('회차 업로드')
    expect(wrapper.find('.episode-upload-page__upload-zone').exists()).toBe(true)
    expect(wrapper.text()).toContain('원고를 업로드하거나 붙여넣으세요')
    expect(wrapper.find('textarea[name="episode-setting"]').exists()).toBe(false)
    expect(wrapper.get('button[type="submit"]').text()).toBe('분석 시작')

    const episodeFile = new File(['abc'], 'episode-20.md', { type: 'text/markdown' })
    const episodeFileInput = wrapper.get<HTMLInputElement>('input[type="file"]')

    Object.defineProperty(episodeFileInput.element, 'files', {
      configurable: true,
      value: [episodeFile],
    })
    await episodeFileInput.trigger('change')

    expect(wrapper.text()).toContain('episode-20.md')
    expect(wrapper.text()).toContain('3B')
    expect(wrapper.get('.episode-upload-page__file-button').text()).toContain('파일 변경')

    await wrapper.get('button[role="radio"]').trigger('click')

    expect(wrapper.find('.episode-upload-page__upload-zone').exists()).toBe(false)
    expect(wrapper.find('textarea[name="episode-setting"]').exists()).toBe(true)
    expect(wrapper.get('textarea[name="episode-setting"]').attributes('placeholder')).toBe(
      '작품 설정을 입력해주세요.',
    )
  })

  it('renders a dummy conflict report page', () => {
    const wrapper = mountWorkspacePage(ConflictReportPage)

    expect(wrapper.get('h1').text()).toBe('충돌 리포트')
    expect(wrapper.text()).toContain('분석 완료')
    expect(wrapper.text()).toContain('유진의 기억 회귀 제한')
  })
})
