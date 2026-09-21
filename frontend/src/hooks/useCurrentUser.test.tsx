import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { getCurrentUser } from '../api/users'
import { useCurrentUser } from './useCurrentUser'
import { withQueryClient } from '../testUtils'

vi.mock('../api/users', () => ({ getCurrentUser: vi.fn() }))

describe('useCurrentUser', () => {
  it('fetches the current user', async () => {
    const user = { id: 1, name: 'Ana', role: 'employee' }
    vi.mocked(getCurrentUser).mockResolvedValue(user as never)

    const { result } = renderHook(() => useCurrentUser(), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(user)
  })
})
