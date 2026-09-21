import { apiRequest } from './client'
import type { LoginInput, TokenResponse } from '../types/auth'

export function login(input: LoginInput): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/login', { method: 'POST', body: input })
}

export function refreshSession(refreshToken: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
    skipAuthRetry: true,
  })
}

export function logout(refreshToken: string): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    body: { refresh_token: refreshToken },
    skipAuthRetry: true,
  })
}
