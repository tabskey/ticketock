import { describe, expect, it, vi } from 'vitest'
import { login } from './auth'
import { apiRequest } from './client'

vi.mock('./client', () => ({
  apiRequest: vi.fn(),
}))

describe('login', () => {
  it('posts credentials to /auth/login', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ access_token: 'token', token_type: 'bearer', role: 'employee' })

    const result = await login({ email: 'employee@company.com', password: 'employee123' })

    expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'employee@company.com', password: 'employee123' },
    })
    expect(result.role).toBe('employee')
  })
})
