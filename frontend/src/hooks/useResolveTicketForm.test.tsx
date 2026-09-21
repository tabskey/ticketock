import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { FormEvent } from 'react'
import { updateTicketStatus } from '../api/tickets'
import { useResolveTicketForm } from './useResolveTicketForm'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ updateTicketStatus: vi.fn() }))

describe('useResolveTicketForm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates the resolution note field', () => {
    const { result } = renderHook(() => useResolveTicketForm({ ticketId: 1, onSuccess: vi.fn() }), {
      wrapper: withQueryClient(),
    })
    act(() => result.current.setResolutionNote('Replaced the cable'))
    expect(result.current.resolutionNote).toBe('Replaced the cable')
  })

  it('resolves the ticket and calls onSuccess after the delay', async () => {
    vi.mocked(updateTicketStatus).mockResolvedValue({ id: 1, status: 'Resolved' } as never)
    const onSuccess = vi.fn()

    const { result } = renderHook(() => useResolveTicketForm({ ticketId: 1, onSuccess }), {
      wrapper: withQueryClient(),
    })
    act(() => result.current.setResolutionNote('Replaced the cable'))

    const preventDefault = vi.fn()
    await act(async () => {
      await result.current.handleSubmit({ preventDefault } as unknown as FormEvent)
    })

    expect(updateTicketStatus).toHaveBeenCalledWith(1, 'Resolved', 'Replaced the cable')
    expect(onSuccess).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(900)
    })
    expect(onSuccess).toHaveBeenCalled()
  })
})
