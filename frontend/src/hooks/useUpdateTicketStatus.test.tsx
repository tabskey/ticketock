import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { updateTicketStatus } from '../api/tickets'
import { useUpdateTicketStatus } from './useUpdateTicketStatus'
import { createTestQueryClient, withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ updateTicketStatus: vi.fn() }))

describe('useUpdateTicketStatus', () => {
  it('updates status and invalidates both the ticket and list queries', async () => {
    vi.mocked(updateTicketStatus).mockResolvedValue({ id: 7, status: 'Resolved' } as never)

    const client = createTestQueryClient()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateTicketStatus(7), { wrapper: withQueryClient(client) })

    result.current.mutate({ status: 'Resolved', resolutionNote: 'Fixed' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updateTicketStatus).toHaveBeenCalledWith(7, 'Resolved', 'Fixed')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ticket', 7] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
  })
})
