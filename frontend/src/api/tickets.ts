import { apiRequest } from './client'
import type {
  PaginatedTickets,
  Ticket,
  TicketCreateInput,
  TicketDetail,
  TicketListParams,
  TicketStatus,
} from '../types/ticket'

export function listTickets(params: TicketListParams): Promise<PaginatedTickets> {
  return apiRequest<PaginatedTickets>('/tickets', { query: { ...params } })
}

export function getTicket(id: number): Promise<TicketDetail> {
  return apiRequest<TicketDetail>(`/tickets/${id}`)
}

export function createTicket(input: TicketCreateInput): Promise<Ticket> {
  return apiRequest<Ticket>('/tickets', { method: 'POST', body: input })
}

export function updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/status`, { method: 'PATCH', body: { status } })
}
