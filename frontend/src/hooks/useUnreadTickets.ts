import { useEffect, useRef, useState } from 'react'
import type { Ticket } from '../types/ticket'
import { getLastViewedAt, setLastViewedAt } from '../lib/ticketsLastViewed'

export function useUnreadTickets(userId: number | undefined, tickets: Ticket[] | undefined) {
  const [baseline, setBaseline] = useState<Date | null>(null)
  const capturedForUserId = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (userId !== undefined && capturedForUserId.current !== userId) {
      capturedForUserId.current = userId
      setBaseline(getLastViewedAt(userId))
      setLastViewedAt(userId, new Date())
    }
  }, [userId])

  const unreadTickets = baseline ? (tickets ?? []).filter((ticket) => new Date(ticket.updated_at) > baseline) : []

  return { unreadTickets }
}
