import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { login, resetPassword, signup } from '@/features/auth/api/authApi'
import FindPasswordPage from '../FindPasswordPage.vue'
import JoinPage from '../JoinPage.vue'
import LoginPage from '../LoginPage.vue'

const pushMock = vi.hoisted(() => vi.fn<() => Promise<void> | void>())

vi.mock('@/features/auth/api/authApi', () => ({
  login: vi.fn<
    (payload: { email: string; password: string }) => Promise<{
      access_token: string
      refresh_token: string
      token_type: string
    }>
  >(),
  resetPassword: vi.fn<
    (payload: { email: string; new_password: string }) => Promise<{
      message: string
    }>
  >(),
  resolveAuthError: vi.fn<(error: unknown, fallbackMessage: string) => string>(
    (_error: unknown, fallbackMessage: string) => fallbackMessage,
  ),
  signup: vi.fn<
    (payload: { email: string; password: string; user_name: string }) => Promise<{
      email: string
      role: string
      user_id: number
      user_name: string
    }>
  >(),
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()

  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
  }
})

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
}

describe('Auth pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockReset()
    localStorage.clear()
  })

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

  it('submits login and stores tokens', async () => {
    vi.mocked(login).mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
    })

    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await wrapper.find('input[placeholder="아이디를 입력해주세요"]').setValue('user@example.com')
    await wrapper.find('input[placeholder="비밀번호를 입력해주세요"]').setValue('Password1!')
    await wrapper.get('.auth-primary-button').trigger('click')
    await flushPromises()

    expect(login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password1!',
    })
    expect(localStorage.getItem('uvk.accessToken')).toBe('access-token')
    expect(localStorage.getItem('uvk.refreshToken')).toBe('refresh-token')
    expect(wrapper.text()).toContain('로그인되었습니다.')
    expect(pushMock).toHaveBeenCalledWith('/workspaces')
  })

  it('renders join form fields and error messages', async () => {
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

    await wrapper.get('.auth-primary-button').trigger('click')

    expect(wrapper.text()).toContain('*이메일 형식이 아닙니다.')
    expect(wrapper.text()).toContain('*영어, 숫자, 특수문자 사용, 8자리 이상')
    expect(wrapper.text()).toContain('*비밀번호가 일치하지 않습니다.')
    expect(wrapper.text()).toContain('*닉네임을 입력해주세요.')
    expect(signup).not.toHaveBeenCalled()
  })

  it('submits signup without email verification code', async () => {
    vi.mocked(signup).mockResolvedValue({
      user_id: 1,
      email: 'user@example.com',
      user_name: '유저',
      role: 'user',
    })

    const wrapper = mount(JoinPage, {
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    })

    await wrapper.find('input[placeholder="아이디 입력(email)"]').setValue('user@example.com')
    await wrapper.find('input[placeholder="비밀번호를 입력"]').setValue('Password1!')
    await wrapper.find('input[placeholder="비밀번호를 재확인"]').setValue('Password1!')
    await wrapper.find('input[placeholder="닉네임 입력"]').setValue('유저')
    await wrapper.get('.auth-primary-button').trigger('click')
    await flushPromises()

    expect(signup).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password1!',
      user_name: '유저',
    })
    expect(wrapper.text()).toContain('회원가입이 완료되었습니다.')
  })

  it('renders find password form fields and submits password reset', async () => {
    vi.mocked(resetPassword).mockResolvedValue({
      message: 'ok',
    })

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
    expect(wrapper.find('button.find-password-page__code-button').exists()).toBe(true)

    await wrapper
      .find('input[placeholder="이메일(아이디)을 입력해주세요"]')
      .setValue('user@example.com')
    await wrapper.get('button.find-password-page__code-button').trigger('submit')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('h1').text()).toBe('비밀번호 재설정')
    expect(wrapper.find('input[placeholder="새로운 비밀번호를 입력"]').exists()).toBe(true)

    await wrapper.find('input[placeholder="새로운 비밀번호를 입력"]').setValue('Password1!')
    await wrapper.find('input[placeholder="비밀번호를 재확인"]').setValue('Password1!')
    await wrapper.get('.auth-primary-button').trigger('click')
    await flushPromises()

    expect(resetPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      new_password: 'Password1!',
    })
    expect(wrapper.find('dialog[open]').exists()).toBe(true)
  })
})
