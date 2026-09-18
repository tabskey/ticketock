export type TicketCategory = 'IT' | 'Facilities' | 'HR'

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'

export interface Ticket {
  id: number
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  created_by: number
  created_at: string
  updated_at: string
}

export interface StatusHistoryEntry {
  id: number
  from_status: TicketStatus | null
  to_status: TicketStatus
  changed_by: number
  changed_at: string
}

export interface TicketDetail extends Ticket {
  history: StatusHistoryEntry[]
}

export interface PaginatedTickets {
  items: Ticket[]
  total: number
  page: number
  page_size: number
}

export interface TicketCreateInput {
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
}

export interface TicketListParams {
  status?: TicketStatus
  category?: TicketCategory
  priority?: TicketPriority
  sort_by?: 'created_at' | 'priority'
  order?: 'asc' | 'desc'
  page?: number
  page_size?: number
}

export const TICKET_CATEGORIES: TicketCategory[] = ['IT', 'Facilities', 'HR']

export const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent']

export const TICKET_STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed']

export function nextStatus(current: TicketStatus): TicketStatus | null {
  const index = TICKET_STATUSES.indexOf(current)
  return index >= 0 && index + 1 < TICKET_STATUSES.length ? TICKET_STATUSES[index + 1] : null
}
