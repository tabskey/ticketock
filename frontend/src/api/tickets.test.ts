import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from './client'
import { createTicket, getTicket, listTickets, updateTicketStatus } from './tickets'

vi.mock('./client', () => ({ apiRequest: vi.fn().mockResolvedValue({}) }))

describe('tickets api', () => {
  it('listTickets forwards filters as query params', async () => {
    await listTickets({ status: 'Open', page: 1 })
    expect(apiRequest).toHaveBeenCalledWith('/tickets', { query: { status: 'Open', page: 1 } })
  })

  it('getTicket fetches a single ticket by id', async () => {
    await getTicket(42)
    expect(apiRequest).toHaveBeenCalledWith('/tickets/42')
  })

  it('createTicket posts the new ticket payload', async () => {
    const input = { title: 'Broken chair', description: 'Wobbly leg', category: 'Facilities' as const, priority: 'Low' as const }
    await createTicket(input)
    expect(apiRequest).toHaveBeenCalledWith('/tickets', { method: 'POST', body: input })
  })

  it('updateTicketStatus patches status and resolution note', async () => {
    await updateTicketStatus(5, 'Resolved', 'Fixed the printer')
    expect(apiRequest).toHaveBeenCalledWith('/tickets/5/status', {
      method: 'PATCH',
      body: { status: 'Resolved', resolution_note: 'Fixed the printer' },
    })
  })

  it('updateTicketStatus omits the resolution note when absent', async () => {
    await updateTicketStatus(5, 'In Progress')
    expect(apiRequest).toHaveBeenCalledWith('/tickets/5/status', {
      method: 'PATCH',
      body: { status: 'In Progress', resolution_note: undefined },
    })
  })
})
