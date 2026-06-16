import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FindPasswordPage from '../FindPasswordPage.vue'
import JoinPage from '../JoinPage.vue'
import LoginPage from '../LoginPage.vue'

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

describe('Auth pages', () => {
  it('renders login links and controls', () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(wrapper.get('h1').text()).toBe('로그인')
    expect(wrapper.text()).toContain('비밀번호 찾기')
    expect(wrapper.text()).toContain('회원가입')
    expect(wrapper.find('a[href="/join"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/findpw"]').exists()).toBe(true)
  })

  it('renders join form fields', () => {
    const wrapper = mount(JoinPage, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(wrapper.get('h1').text()).toBe('회원가입')
    expect(wrapper.find('input[placeholder="아이디 입력(email)"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="닉네임 입력"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('인증번호 전송')
  })

  it('renders find password form fields', () => {
    const wrapper = mount(FindPasswordPage, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    expect(wrapper.get('h1').text()).toBe('비밀번호 찾기')
    expect(wrapper.find('input[placeholder="이메일(아이디)을 입력해주세요"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="인증번호를 입력해주세요"]').exists()).toBe(true)
  })
})
