import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from './client'
import { login, refreshSession } from './auth'

vi.mock('./client', () => ({ apiRequest: vi.fn().mockResolvedValue({ token: 't' }) }))

describe('auth api', () => {
  it('login posts credentials to /auth/login', async () => {
    await login({ email: 'employee@company.com', password: 'secret' })
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'employee@company.com', password: 'secret' },
    })
  })

  it('refreshSession posts the refresh token to /auth/refresh', async () => {
    await refreshSession('rtoken')
    expect(apiRequest).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: 'rtoken' },
    })
  })
})
