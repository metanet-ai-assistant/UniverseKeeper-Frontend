import axios from 'axios'

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface SignupRequest {
  email: string
  password: string
  user_name: string
}

export interface SignupResponse {
  user_id: number
  email: string
  user_name: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: 'bearer' | string
}

export interface PasswordResetRequest {
  email: string
  new_password: string
}

export interface PasswordResetResponse {
  message: string
}

interface ValidationErrorDetail {
  loc: Array<string | number>
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

interface ApiErrorResponse {
  detail?: string | ValidationErrorDetail[]
  message?: string
}

export async function signup(payload: SignupRequest) {
  const { data } = await authClient.post<SignupResponse>('/api/v1/users/signup', payload)

  return data
}

export async function login(payload: LoginRequest) {
  const { data } = await authClient.post<LoginResponse>('/api/v1/auth/login', payload)

  return data
}

export async function resetPassword(payload: PasswordResetRequest) {
  const { data } = await authClient.post<PasswordResetResponse>(
    '/api/v1/auth/password/reset',
    payload,
  )

  return data
}

export function resolveAuthError(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage
  }

  const responseData = error.response?.data

  if (Array.isArray(responseData?.detail)) {
    return responseData.detail.map((detail) => detail.msg).join('\n')
  }

  if (typeof responseData?.detail === 'string') {
    return responseData.detail
  }

  if (typeof responseData?.message === 'string') {
    return responseData.message
  }

  return fallbackMessage
}
