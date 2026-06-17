import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { login, me, refresh } from '@/features/auth/api/authApi'
import { useAuthStore } from '../authStore'

vi.mock('@/features/auth/api/authApi', () => ({
  login: vi.fn<
    (payload: { email: string; password: string }) => Promise<{
      access_token: string
      refresh_token: string
      token_type: string
    }>
  >(),
  me: vi.fn<
    () => Promise<{
      email: string
      role: string
      user_id: number
      user_name: string
    }>
  >(),
  logout: vi.fn<() => Promise<{ message: string }>>(),
  refresh: vi.fn<
    (payload: { refresh_token: string }) => Promise<{
      access_token: string
      token_type: string
    }>
  >(),
}))

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(me).mockResolvedValue({
      user_id: 1,
      email: 'user@example.com',
      user_name: '유저',
      role: 'user',
    })
  })

  it('stores access, refresh tokens, and current user after login', async () => {
    vi.mocked(login).mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
    })

    const authStore = useAuthStore()

    await authStore.loginWithCredentials({
      email: 'user@example.com',
      password: 'Password1!',
    })

    expect(authStore.accessToken).toBe('access-token')
    expect(authStore.refreshToken).toBe('refresh-token')
    expect(authStore.user?.email).toBe('user@example.com')
    expect(authStore.isAuthenticated).toBe(true)
    expect(localStorage.getItem('uvk.refreshToken')).toBe('refresh-token')
  })

  it('refreshes access token using the stored refresh token', async () => {
    vi.mocked(refresh).mockResolvedValue({
      access_token: 'new-access-token',
      token_type: 'bearer',
    })

    const authStore = useAuthStore()
    authStore.setSession({
      accessToken: 'old-access-token',
      refreshToken: 'refresh-token',
      tokenType: 'bearer',
    })

    await authStore.refreshAccessToken()

    expect(refresh).toHaveBeenCalledWith({
      refresh_token: 'refresh-token',
    })
    expect(authStore.accessToken).toBe('new-access-token')
    expect(authStore.refreshToken).toBe('refresh-token')
    expect(localStorage.getItem('uvk.accessToken')).toBe('new-access-token')
    expect(localStorage.getItem('uvk.refreshToken')).toBe('refresh-token')
  })

  it('loads current user when an existing token session is verified', async () => {
    const authStore = useAuthStore()
    authStore.setSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'bearer',
    })

    await authStore.ensureAuthenticated()

    expect(me).toHaveBeenCalled()
    expect(authStore.user?.user_name).toBe('유저')
  })
})
