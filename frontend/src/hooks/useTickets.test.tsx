import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTickets } from './useTickets'
import { listTickets } from '../api/tickets'

vi.mock('../api/tickets', () => ({
  listTickets: vi.fn(),
}))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useTickets', () => {
  it('fetches the list using the given params', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20 }
    vi.mocked(listTickets).mockResolvedValue(page)

    const { result } = renderHook(() => useTickets({ page: 1, page_size: 20 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(listTickets).toHaveBeenCalledWith({ page: 1, page_size: 20 })
    expect(result.current.data).toEqual(page)
  })

  it('surfaces a failed fetch as an error state', async () => {
    vi.mocked(listTickets).mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useTickets({ page: 1, page_size: 20 }), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
