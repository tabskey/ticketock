import { useQuery } from '@tanstack/react-query'
import { getTicket } from '../api/tickets'

export function useTicket(id: number) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id),
  })
}
