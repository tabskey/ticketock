import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { listTickets } from '../api/tickets'
import { TicketListPage } from './TicketListPage'
import { withQueryClient } from '../testUtils'
import type { Ticket } from '../types/ticket'

vi.mock('../api/tickets', () => ({ listTickets: vi.fn() }))

function ticket(id: number): Ticket {
  return {
    id,
    title: `Ticket ${id}`,
    description: '',
    category: 'IT',
    priority: 'Low',
    status: 'Open',
    created_by: 1,
    created_at: '2024-03-05T09:05:00.000Z',
    updated_at: '2024-03-05T09:05:00.000Z',
  }
}

function renderPage() {
  const Wrapper = withQueryClient()
  return render(
    <Wrapper>
      <MemoryRouter>
        <TicketListPage />
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('TicketListPage', () => {
  it('renders the ticket list and pagination once loaded', async () => {
    vi.mocked(listTickets).mockResolvedValue({ items: [ticket(1), ticket(2)], total: 2, page: 1, page_size: 20 })

    renderPage()

    await waitFor(() => expect(screen.getByText('Ticket 1')).toBeInTheDocument())
    expect(screen.getByText('Ticket 2')).toBeInTheDocument()
    expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument()
  })

  it('shows an empty state when there are no tickets', async () => {
    vi.mocked(listTickets).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 })

    renderPage()

    await waitFor(() => expect(screen.getByText('Nenhum ticket encontrado com esses filtros.')).toBeInTheDocument())
  })

  it('shows an error message when loading fails', async () => {
    const { ApiError } = await import('../api/client')
    vi.mocked(listTickets).mockRejectedValue(new ApiError({ code: 'UNAUTHORIZED', message: 'Not allowed', status: 403 }))

    renderPage()

    await waitFor(() => expect(screen.getByText('Not allowed')).toBeInTheDocument())
  })
})
