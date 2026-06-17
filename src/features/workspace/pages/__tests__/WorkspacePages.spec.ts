import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/stores/authStore'
import type {
  KpiSummaryResponse,
  WorkspaceListItemResponse,
} from '@/features/workspace/api/workspaceApi'
import ConflictReportPage from '../ConflictReportPage.vue'
import EpisodeUploadPage from '../EpisodeUploadPage.vue'
import NewWorkspacePage from '../NewWorkspacePage.vue'
import WorkspaceDetailPage from '../WorkspaceDetailPage.vue'
import WorkspaceListPage from '../WorkspaceListPage.vue'

const workspaceApiMocks = vi.hoisted(() => ({
  getKpiSummary: vi.fn<() => Promise<KpiSummaryResponse>>(),
  getWorkspaces: vi.fn<() => Promise<WorkspaceListItemResponse[]>>(),
}))

vi.mock('@/features/workspace/api/workspaceApi', () => workspaceApiMocks)

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')

  return {
    ...actual,
    useRoute: () => ({
      params: {
        workspaceId: 'red-moon',
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
  it('renders workspace list with auth user and API data', async () => {
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

    expect(workspaceApiMocks.getKpiSummary).toHaveBeenCalledOnce()
    expect(workspaceApiMocks.getWorkspaces).toHaveBeenCalledOnce()
    expect(wrapper.get('h1').text()).toContain('유저')
    expect(wrapper.text()).toContain('user@example.com · user')
    expect(wrapper.text()).toContain('현재 2개 작품을 관리 중입니다.')
    expect(wrapper.text()).toContain('유저님의 워크스페이스')
    expect(wrapper.text()).toContain('별이 꺼진 뒤의 기록자')
    expect(wrapper.text()).toContain('미검토 2건')
    expect(wrapper.text()).toContain('총 회차 수 19회')
    expect(wrapper.find('a[href="/workspaces/new"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/workspaces/12"]').exists()).toBe(true)
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

    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('h1').text()).toBe('새 작품 만들기')
  })

  it('keeps workspace detail tabs and graph modal in a single page', async () => {
    const wrapper = mountWorkspacePage(WorkspaceDetailPage)

    expect(wrapper.get('h1').text()).toBe('상세 보기')
    expect(wrapper.text()).toContain('붉은 달 아래 기억을 되돌리는 소녀의 이야기')
    expect(wrapper.text()).toContain('침묵하는 왕관')
    expect(wrapper.text()).not.toContain('# 초기 설정 - 붉은 달의 기억')
    expect(wrapper.find('a[href="/workspaces/red-moon/episodes/new"]').exists()).toBe(true)

    await wrapper.get('button[role="tab"]:nth-of-type(2)').trigger('click')

    expect(wrapper.text()).toContain('설정 보기')
    expect(wrapper.text()).toContain('# 초기 설정 - 붉은 달의 기억')

    await wrapper.get('.settings-panel__action--graph').trigger('click')

    expect(wrapper.get('[role="dialog"]').text()).toContain('Graph')

    await wrapper.get('.graph-modal__close').trigger('click')

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('keeps episode upload modes in a single page', async () => {
    const wrapper = mountWorkspacePage(EpisodeUploadPage)

    expect(wrapper.get('h1').text()).toBe('회차 업로드')
    expect(wrapper.find('.episode-upload-page__upload-zone').exists()).toBe(true)
    expect(wrapper.text()).toContain('원고를 업로드하거나 붙여넣으세요')
    expect(wrapper.find('textarea[name="episode-setting"]').exists()).toBe(false)
    expect(wrapper.find('a[href="/workspaces/red-moon/episodes/analyzing"]').exists()).toBe(true)

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
