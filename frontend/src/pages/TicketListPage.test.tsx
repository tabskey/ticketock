import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TicketListPage } from './TicketListPage'
import { useTickets } from '../hooks/useTickets'
import { ApiError } from '../api/client'
import type { Ticket } from '../types/ticket'

vi.mock('../hooks/useTickets', () => ({
  useTickets: vi.fn(),
}))

const sampleTicket: Ticket = {
  id: 1,
  title: 'Broken printer',
  description: 'Jammed',
  category: 'Facilities',
  priority: 'High',
  status: 'Open',
  created_by: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TicketListPage />
    </MemoryRouter>,
  )
}

describe('TicketListPage', () => {
  it('shows a loading indicator while the first page is in flight', () => {
    vi.mocked(useTickets).mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null } as never)

    renderPage()

    expect(screen.getByText('Loading tickets…')).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', () => {
    const error = new ApiError({ code: 'UNAUTHORIZED', message: 'Invalid or expired token.', status: 401 })
    vi.mocked(useTickets).mockReturnValue({ data: undefined, isLoading: false, isError: true, error } as never)

    renderPage()

    expect(screen.getByText('Invalid or expired token.')).toBeInTheDocument()
  })

  it('shows an empty state when no tickets match the filters', () => {
    vi.mocked(useTickets).mockReturnValue({
      data: { items: [], total: 0, page: 1, page_size: 20 },
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderPage()

    expect(screen.getByText('No tickets match these filters.')).toBeInTheDocument()
  })

  it('renders a row per ticket with its category, priority, and status', () => {
    vi.mocked(useTickets).mockReturnValue({
      data: { items: [sampleTicket], total: 1, page: 1, page_size: 20 },
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderPage()

    expect(screen.getByRole('link', { name: 'Broken printer' })).toHaveAttribute('href', '/tickets/1')
    expect(screen.getByText('Facilities', { selector: 'td' })).toBeInTheDocument()
    expect(screen.getByText('High', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Open', { selector: 'span' })).toBeInTheDocument()
  })

  it('resets to page 1 when a filter changes', async () => {
    vi.mocked(useTickets).mockReturnValue({
      data: { items: [sampleTicket], total: 1, page: 1, page_size: 20 },
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderPage()

    await userEvent.selectOptions(screen.getByDisplayValue('All statuses'), 'Open')

    expect(useTickets).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'Open', page: 1, page_size: 20 }),
    )
  })

  it('advances the page when Next is clicked', async () => {
    vi.mocked(useTickets).mockReturnValue({
      data: { items: [sampleTicket], total: 40, page: 1, page_size: 20 },
      isLoading: false,
      isError: false,
      error: null,
    } as never)

    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(useTickets).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
  })
})
