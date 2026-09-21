import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { getTicket } from '../api/tickets'
import { useTicket } from './useTicket'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ getTicket: vi.fn() }))

describe('useTicket', () => {
  it('fetches a single ticket by id', async () => {
    const ticket = { id: 3, title: 'Printer', history: [] }
    vi.mocked(getTicket).mockResolvedValue(ticket as never)

    const { result } = renderHook(() => useTicket(3), { wrapper: withQueryClient() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(ticket)
    expect(getTicket).toHaveBeenCalledWith(3)
  })
})
