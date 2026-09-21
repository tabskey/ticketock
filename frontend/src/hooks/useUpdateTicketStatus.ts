import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTicketStatus } from '../api/tickets'
import type { TicketStatus } from '../types/ticket'

export function useUpdateTicketStatus(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ status, resolutionNote }: { status: TicketStatus; resolutionNote?: string }) =>
      updateTicketStatus(ticketId, status, resolutionNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
