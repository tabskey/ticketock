export type UserRole = 'employee' | 'support'

export interface LoginInput {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  role: UserRole
}
