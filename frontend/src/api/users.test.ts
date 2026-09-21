import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from './client'
import { getCurrentUser } from './users'

vi.mock('./client', () => ({ apiRequest: vi.fn().mockResolvedValue({ id: 1 }) }))

describe('users api', () => {
  it('getCurrentUser fetches /users/me', async () => {
    await getCurrentUser()
    expect(apiRequest).toHaveBeenCalledWith('/users/me')
  })
})
