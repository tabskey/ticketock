import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCreateTicket } from './useCreateTicket'
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../types/ticket'
import type { Ticket, TicketCategory, TicketPriority } from '../types/ticket'

interface UseTicketFormOptions {
  onSuccess: (ticket: Ticket) => void
}

export function useTicketForm({ onSuccess }: UseTicketFormOptions) {
  const createTicket = useCreateTicket()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TicketCategory>(TICKET_CATEGORIES[0])
  const [priority, setPriority] = useState<TicketPriority>(TICKET_PRIORITIES[0])

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    const ticket = await createTicket.mutateAsync({ title, description, category, priority })
    window.setTimeout(() => onSuccess(ticket), 900)
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    priority,
    setPriority,
    handleSubmit,
    createTicket,
  }
}
