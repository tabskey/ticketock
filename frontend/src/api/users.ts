import { apiRequest } from './client'
import type { CurrentUser } from '../types/user'

export function getCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/users/me')
}
