import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCreateTicket } from './useCreateTicket'
import { createTicket } from '../api/tickets'

vi.mock('../api/tickets', () => ({
  createTicket: vi.fn(),
}))

describe('useCreateTicket', () => {
  it('creates a ticket and invalidates the tickets list', async () => {
    const created = {
      id: 1,
      title: 'Broken printer',
      description: 'Jammed',
      category: 'Facilities' as const,
      priority: 'High' as const,
      status: 'Open' as const,
      created_by: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    vi.mocked(createTicket).mockResolvedValue(created)

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateTicket(), { wrapper })

    result.current.mutate({ title: 'Broken printer', description: 'Jammed', category: 'Facilities', priority: 'High' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(createTicket).mock.calls[0][0]).toEqual({
      title: 'Broken printer',
      description: 'Jammed',
      category: 'Facilities',
      priority: 'High',
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tickets'] })
  })
})
