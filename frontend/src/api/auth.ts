import { apiRequest } from './client'
import type { LoginInput, TokenResponse } from '../types/auth'

export function login(input: LoginInput): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/login', { method: 'POST', body: input })
}
