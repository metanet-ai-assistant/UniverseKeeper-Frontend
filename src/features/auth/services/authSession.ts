import type { LoginResponse } from '@/features/auth/api/authApi'

const ACCESS_TOKEN_KEY = 'uvk.accessToken'
const REFRESH_TOKEN_KEY = 'uvk.refreshToken'
const TOKEN_TYPE_KEY = 'uvk.tokenType'

export interface AuthSession {
  accessToken: string
  refreshToken: string
  tokenType: string
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || 'bearer'

  if (!accessToken || !refreshToken) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    tokenType,
  }
}

export function saveAuthSession(session: AuthSession): void {
  if (!canUseStorage()) {
    return
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  localStorage.setItem(TOKEN_TYPE_KEY, session.tokenType)
}

export function saveAuthTokens(tokens: LoginResponse): void {
  saveAuthSession({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenType: tokens.token_type,
  })
}

export function clearAuthTokens(): void {
  if (!canUseStorage()) {
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
}
