import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import WorkspaceListPage from '../WorkspaceListPage.vue'

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

describe('Workspace pages', () => {
  it('renders workspace list with mock data and new workspace link', () => {
    const wrapper = mount(WorkspaceListPage, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(wrapper.get('h1').text()).toContain('안녕하세요, 전찬혁 작가님')
    expect(wrapper.text()).toContain('찬혁님의 워크스페이스')
    expect(wrapper.text()).toContain('별이 꺼진 후의 기록작')
    expect(wrapper.text()).toContain('미검토 2건')
    expect(wrapper.find('a[href="/workspaces/new"]').exists()).toBe(true)
  })
})
