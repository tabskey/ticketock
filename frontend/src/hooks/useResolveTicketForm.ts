import { useState } from 'react'
import type { FormEvent } from 'react'
import { useUpdateTicketStatus } from './useUpdateTicketStatus'

interface UseResolveTicketFormOptions {
  ticketId: number
  onSuccess: () => void
}

export function useResolveTicketForm({ ticketId, onSuccess }: UseResolveTicketFormOptions) {
  const updateStatus = useUpdateTicketStatus(ticketId)

  const [resolutionNote, setResolutionNote] = useState('')

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    await updateStatus.mutateAsync({ status: 'Resolved', resolutionNote })
    window.setTimeout(onSuccess, 900)
  }

  return {
    resolutionNote,
    setResolutionNote,
    handleSubmit,
    updateStatus,
  }
}
