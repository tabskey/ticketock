import { describe, expect, it, vi } from 'vitest'
import { createTicket, getTicket, listTickets, updateTicketStatus } from './tickets'
import { apiRequest } from './client'

vi.mock('./client', () => ({
  apiRequest: vi.fn(),
}))

describe('tickets api', () => {
  it('lists tickets with the given query params', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 })

    await listTickets({ page: 1, page_size: 20, status: 'Open' })

    expect(apiRequest).toHaveBeenCalledWith('/tickets', { query: { page: 1, page_size: 20, status: 'Open' } })
  })

  it('fetches a single ticket by id', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: 1 })

    await getTicket(1)

    expect(apiRequest).toHaveBeenCalledWith('/tickets/1')
  })

  it('creates a ticket', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: 1 })
    const input = { title: 'Broken printer', description: 'Jammed', category: 'Facilities' as const, priority: 'High' as const }

    await createTicket(input)

    expect(apiRequest).toHaveBeenCalledWith('/tickets', { method: 'POST', body: input })
  })

  it('updates a ticket status', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: 1, status: 'In Progress' })

    await updateTicketStatus(1, 'In Progress')

    expect(apiRequest).toHaveBeenCalledWith('/tickets/1/status', { method: 'PATCH', body: { status: 'In Progress' } })
  })
})
