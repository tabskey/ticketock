import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useUpdateTicketStatus } from './useUpdateTicketStatus'
import { updateTicketStatus } from '../api/tickets'

vi.mock('../api/tickets', () => ({
  updateTicketStatus: vi.fn(),
}))

describe('useUpdateTicketStatus', () => {
  it('advances the status and invalidates both the ticket and the list', async () => {
    vi.mocked(updateTicketStatus).mockResolvedValue({
      id: 1,
      title: 'Broken printer',
      description: 'Jammed',
      category: 'Facilities',
      priority: 'High',
      status: 'In Progress',
      created_by: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    })

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useUpdateTicketStatus(1), { wrapper })

    result.current.mutate('In Progress')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updateTicketStatus).toHaveBeenCalledWith(1, 'In Progress')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ticket', 1] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
  })
})
