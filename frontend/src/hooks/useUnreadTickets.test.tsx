import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUnreadTickets } from './useUnreadTickets'
import { setLastViewedAt } from '../lib/ticketsLastViewed'
import type { Ticket } from '../types/ticket'

function ticket(id: number, updatedAt: string): Ticket {
  return {
    id,
    title: `Ticket ${id}`,
    description: '',
    category: 'IT',
    priority: 'Low',
    status: 'Open',
    created_by: 1,
    created_at: updatedAt,
    updated_at: updatedAt,
  }
}

describe('useUnreadTickets', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns no unread tickets when userId is undefined', () => {
    const { result } = renderHook(() => useUnreadTickets(undefined, [ticket(1, '2024-01-01T00:00:00Z')]))
    expect(result.current.unreadTickets).toEqual([])
  })

  it('flags tickets updated after the stored last-viewed baseline as unread', () => {
    setLastViewedAt(9, new Date('2024-01-01T00:00:00Z'))

    const tickets = [ticket(1, '2023-12-31T00:00:00Z'), ticket(2, '2024-06-01T00:00:00Z')]
    const { result } = renderHook(() => useUnreadTickets(9, tickets))

    expect(result.current.unreadTickets.map((t) => t.id)).toEqual([2])
  })

  it('treats a first-time user (no stored baseline) as having nothing unread', () => {
    const tickets = [ticket(1, '2024-06-01T00:00:00Z')]
    const { result } = renderHook(() => useUnreadTickets(11, tickets))
    expect(result.current.unreadTickets).toEqual([])
  })
})
