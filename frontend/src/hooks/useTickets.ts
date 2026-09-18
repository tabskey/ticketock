import { useQuery } from '@tanstack/react-query'
import { listTickets } from '../api/tickets'
import type { TicketListParams } from '../types/ticket'

export function useTickets(params: TicketListParams) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => listTickets(params),
    placeholderData: (previous) => previous,
  })
}
