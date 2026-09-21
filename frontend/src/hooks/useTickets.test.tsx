import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { listTickets } from '../api/tickets'
import { useTickets } from './useTickets'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ listTickets: vi.fn() }))

describe('useTickets', () => {
  it('fetches tickets for the given filters', async () => {
    const page = { items: [], total: 0, page: 1, page_size: 20 }
    vi.mocked(listTickets).mockResolvedValue(page)

    const { result } = renderHook(() => useTickets({ status: 'Open' }), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(page)
    expect(listTickets).toHaveBeenCalledWith({ status: 'Open' })
  })
})
