import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTicket } from './useTicket'
import { getTicket } from '../api/tickets'

vi.mock('../api/tickets', () => ({
  getTicket: vi.fn(),
}))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useTicket', () => {
  it('fetches the ticket by id', async () => {
    const detail = {
      id: 1,
      title: 'Broken printer',
      description: 'Jammed',
      category: 'Facilities' as const,
      priority: 'High' as const,
      status: 'Open' as const,
      created_by: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      history: [],
    }
    vi.mocked(getTicket).mockResolvedValue(detail)

    const { result } = renderHook(() => useTicket(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getTicket).toHaveBeenCalledWith(1)
    expect(result.current.data).toEqual(detail)
  })
})
