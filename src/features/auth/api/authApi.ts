import axios from 'axios'

import { apiClient } from '@/api/client'

export type EmailVerificationPurpose = 'SIGNUP' | 'PASSWORD_RESET'

export interface MessageResponse {
  message: string
}

export interface EmailVerificationRequest {
  email: string
  purpose: EmailVerificationPurpose
}

export interface SignupRequest {
  email: string
  password: string
  user_name: string
  code: string
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

export interface AuthUser {
  user_id: number
  email: string
  user_name: string
  role: string
}

export interface PasswordResetRequest {
  email: string
  code: string
  new_password: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshResponse {
  access_token: string
  token_type: 'bearer' | string
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

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const { data } = await apiClient.post<SignupResponse>('/api/v1/users/signup', payload)

  return data
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/v1/auth/login', payload)

  return data
}

export async function resetPassword(payload: PasswordResetRequest): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>('/api/v1/auth/password/reset', payload)

  return data
}

export async function sendVerificationEmail(
  payload: EmailVerificationRequest,
): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>('/api/v1/auth/email/send', payload)

  return data
}

export async function refresh(payload: RefreshRequest): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh', payload)

  return data
}

export async function logout(
  accessToken?: string,
  tokenType = 'bearer',
): Promise<MessageResponse> {
  const config = accessToken
    ? {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      }
    : undefined

  const { data } = await apiClient.post<MessageResponse>('/api/v1/auth/logout', undefined, config)

  return data
}

export async function me(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/api/v1/auth/me')

  return data
}

export function resolveAuthError(error: unknown, fallbackMessage: string): string {
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
