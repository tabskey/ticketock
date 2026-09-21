import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { FormEvent } from 'react'
import { createTicket } from '../api/tickets'
import { useTicketForm } from './useTicketForm'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ createTicket: vi.fn() }))

describe('useTicketForm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with default category and priority', () => {
    const { result } = renderHook(() => useTicketForm({ onSuccess: vi.fn() }), { wrapper: withQueryClient() })
    expect(result.current.category).toBe('IT')
    expect(result.current.priority).toBe('Low')
    expect(result.current.title).toBe('')
  })

  it('updates field state via setters', () => {
    const { result } = renderHook(() => useTicketForm({ onSuccess: vi.fn() }), { wrapper: withQueryClient() })
    act(() => result.current.setTitle('Broken monitor'))
    act(() => result.current.setDescription('Flickers on boot'))
    act(() => result.current.setCategory('HR'))
    act(() => result.current.setPriority('Urgent'))

    expect(result.current.title).toBe('Broken monitor')
    expect(result.current.description).toBe('Flickers on boot')
    expect(result.current.category).toBe('HR')
    expect(result.current.priority).toBe('Urgent')
  })

  it('submits the ticket and calls onSuccess after the delay', async () => {
    const created = { id: 1, title: 'Broken monitor' }
    vi.mocked(createTicket).mockResolvedValue(created as never)
    const onSuccess = vi.fn()

    const { result } = renderHook(() => useTicketForm({ onSuccess }), { wrapper: withQueryClient() })
    act(() => result.current.setTitle('Broken monitor'))

    const preventDefault = vi.fn()
    await act(async () => {
      await result.current.handleSubmit({ preventDefault } as unknown as FormEvent)
    })

    expect(preventDefault).toHaveBeenCalled()
    expect(createTicket).toHaveBeenCalledWith(
      { title: 'Broken monitor', description: '', category: 'IT', priority: 'Low' },
      expect.anything(),
    )

    expect(onSuccess).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(900)
    })
    expect(onSuccess).toHaveBeenCalledWith(created)
  })
})
