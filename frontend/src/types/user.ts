import type { UserRole } from './auth'

export interface CurrentUser {
  id: number
  email: string
  name: string
  role: UserRole
}
