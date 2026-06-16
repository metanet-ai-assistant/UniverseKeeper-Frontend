import type { LoginResponse } from '@/features/auth/api/authApi'

const ACCESS_TOKEN_KEY = 'uvk.accessToken'
const REFRESH_TOKEN_KEY = 'uvk.refreshToken'
const TOKEN_TYPE_KEY = 'uvk.tokenType'

export function saveAuthTokens(tokens: LoginResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  localStorage.setItem(TOKEN_TYPE_KEY, tokens.token_type)
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
}
