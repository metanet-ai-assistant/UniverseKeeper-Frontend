import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SplashPage from '../SplashPage.vue'

describe('SplashPage', () => {
  it('renders the UniverseKeeper splash content', () => {
    const wrapper = mount(SplashPage)

    expect(wrapper.get('img').attributes('alt')).toBe('UniverseKeeper UVK')
    expect(wrapper.text()).toContain('작가님의 세계가 무너지지 않도록')
    expect(wrapper.text()).toContain('화면을 터치해주세요.')
  })
})
