import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/features/auth/stores/authStore'
import NewWorkspacePage from '../NewWorkspacePage.vue'
import WorkspaceListPage from '../WorkspaceListPage.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')

  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn<() => Promise<void> | void>(),
    }),
  }
})

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

describe('Workspace pages', () => {
  it('renders workspace list with auth user and mock data', () => {
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

    expect(wrapper.get('h1').text()).toContain('안녕하세요, 유저 작가님')
    expect(wrapper.text()).toContain('user@example.com · user')
    expect(wrapper.text()).toContain('유저님의 워크스페이스')
    expect(wrapper.text()).toContain('별이 꺼진 후의 기록작')
    expect(wrapper.text()).toContain('미검토 2건')
    expect(wrapper.find('a[href="/workspaces/new"]').exists()).toBe(true)
  })

  it('keeps new workspace creation states in a single page', async () => {
    const wrapper = mount(NewWorkspacePage, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

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
})
