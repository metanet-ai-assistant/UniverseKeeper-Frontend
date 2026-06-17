import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { setAuthorizationHeader } from '@/api/client'
import {
  login,
  logout,
  me,
  refresh,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type RefreshResponse,
} from '@/features/auth/api/authApi'
import {
  clearAuthTokens,
  readAuthSession,
  saveAuthSession,
  type AuthSession,
} from '@/features/auth/services/authSession'

function toAuthSession(tokens: LoginResponse): AuthSession {
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenType: tokens.token_type,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const persistedSession = readAuthSession()

  const accessToken = ref(persistedSession?.accessToken ?? '')
  const refreshToken = ref(persistedSession?.refreshToken ?? '')
  const tokenType = ref(persistedSession?.tokenType ?? 'bearer')
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value && refreshToken.value))

  setAuthorizationHeader(accessToken.value || undefined, tokenType.value)

  function setSession(session: AuthSession) {
    accessToken.value = session.accessToken
    refreshToken.value = session.refreshToken
    tokenType.value = session.tokenType

    saveAuthSession(session)
    setAuthorizationHeader(session.accessToken, session.tokenType)
  }

  function clearSession() {
    accessToken.value = ''
    refreshToken.value = ''
    tokenType.value = 'bearer'
    user.value = null

    clearAuthTokens()
    setAuthorizationHeader()
  }

  async function fetchCurrentUser(): Promise<AuthUser> {
    const currentUser = await me()

    user.value = currentUser

    return currentUser
  }

  async function loginWithCredentials(payload: LoginRequest): Promise<LoginResponse> {
    const tokens = await login(payload)

    setSession(toAuthSession(tokens))

    try {
      await fetchCurrentUser()
    } catch (error) {
      clearSession()
      throw error
    }

    return tokens
  }

  async function refreshAccessToken(): Promise<RefreshResponse> {
    if (!refreshToken.value) {
      throw new Error('Refresh token is missing.')
    }

    const tokens = await refresh({
      refresh_token: refreshToken.value,
    })

    setSession({
      accessToken: tokens.access_token,
      refreshToken: refreshToken.value,
      tokenType: tokens.token_type,
    })

    return tokens
  }

  async function ensureAuthenticated(): Promise<AuthUser> {
    if (!isAuthenticated.value) {
      throw new Error('Auth session is missing.')
    }

    if (user.value) {
      return user.value
    }

    try {
      return await fetchCurrentUser()
    } catch (error) {
      try {
        await refreshAccessToken()
        return await fetchCurrentUser()
      } catch {
        clearSession()
        throw error
      }
    }
  }

  async function logoutCurrentSession(): Promise<void> {
    try {
      await logout(accessToken.value || undefined, tokenType.value)
    } finally {
      clearSession()
    }
  }

  return {
    accessToken,
    refreshToken,
    tokenType,
    user,
    isAuthenticated,
    clearSession,
    ensureAuthenticated,
    fetchCurrentUser,
    loginWithCredentials,
    logoutCurrentSession,
    refreshAccessToken,
    setSession,
  }
})
