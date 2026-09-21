import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createTicket } from '../api/tickets'
import { useCreateTicket } from './useCreateTicket'
import { createTestQueryClient, withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ createTicket: vi.fn() }))

describe('useCreateTicket', () => {
  it('creates a ticket and invalidates the tickets query', async () => {
    const created = { id: 1, title: 'New' }
    vi.mocked(createTicket).mockResolvedValue(created as never)

    const client = createTestQueryClient()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useCreateTicket(), { wrapper: withQueryClient(client) })

    result.current.mutate({ title: 'New', description: 'd', category: 'IT', priority: 'Low' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
  })
})
