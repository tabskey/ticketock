import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TicketDetailPage } from './TicketDetailPage'
import { useTicket } from '../hooks/useTicket'
import { useUpdateTicketStatus } from '../hooks/useUpdateTicketStatus'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import type { TicketDetail } from '../types/ticket'

vi.mock('../hooks/useTicket', () => ({ useTicket: vi.fn() }))
vi.mock('../hooks/useUpdateTicketStatus', () => ({ useUpdateTicketStatus: vi.fn() }))
vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))

const openTicket: TicketDetail = {
  id: 1,
  title: 'Broken printer',
  description: 'Jammed',
  category: 'Facilities',
  priority: 'High',
  status: 'Open',
  created_by: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  history: [{ id: 1, from_status: null, to_status: 'Open', changed_by: 1, changed_at: '2026-01-01T00:00:00Z' }],
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/tickets/1']}>
      <Routes>
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/tickets" element={<p>tickets list</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('TicketDetailPage', () => {
  it('shows a loading indicator while the ticket is in flight', () => {
    vi.mocked(useTicket).mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null } as never)
    vi.mocked(useUpdateTicketStatus).mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    renderDetail()

    expect(screen.getByText('Loading ticket…')).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', () => {
    const error = new ApiError({ code: 'TICKET_NOT_FOUND', message: 'Ticket 1 not found.', status: 404 })
    vi.mocked(useTicket).mockReturnValue({ data: undefined, isLoading: false, isError: true, error } as never)
    vi.mocked(useUpdateTicketStatus).mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    renderDetail()

    expect(screen.getByText('Ticket 1 not found.')).toBeInTheDocument()
  })

  it('lets support advance the status and shows the history', async () => {
    const mutate = vi.fn()
    vi.mocked(useTicket).mockReturnValue({ data: openTicket, isLoading: false, isError: false, error: null } as never)
    vi.mocked(useUpdateTicketStatus).mockReturnValue({ mutate, isPending: false, isError: false } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'support' }, signIn: vi.fn(), signOut: vi.fn() })

    renderDetail()

    const button = screen.getByRole('button', { name: 'Move to In Progress' })
    await userEvent.click(button)
    expect(mutate).toHaveBeenCalledWith('In Progress')
    expect(screen.getByText('Created as')).toBeInTheDocument()
  })

  it('hides the advance control for an employee', () => {
    vi.mocked(useTicket).mockReturnValue({ data: openTicket, isLoading: false, isError: false, error: null } as never)
    vi.mocked(useUpdateTicketStatus).mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })

    renderDetail()

    expect(screen.queryByRole('button', { name: /Move to/ })).not.toBeInTheDocument()
  })

  it('hides the advance control once the ticket is Closed', () => {
    vi.mocked(useTicket).mockReturnValue({
      data: { ...openTicket, status: 'Closed' },
      isLoading: false,
      isError: false,
      error: null,
    } as never)
    vi.mocked(useUpdateTicketStatus).mockReturnValue({ mutate: vi.fn(), isPending: false, isError: false } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'support' }, signIn: vi.fn(), signOut: vi.fn() })

    renderDetail()

    expect(screen.queryByRole('button', { name: /Move to/ })).not.toBeInTheDocument()
  })

  it('disables the button and shows the mutation error while advancing', () => {
    const error = new ApiError({ code: 'INVALID_STATUS_TRANSITION', message: "Cannot move from 'Open' to 'Closed'.", status: 422 })
    vi.mocked(useTicket).mockReturnValue({ data: openTicket, isLoading: false, isError: false, error: null } as never)
    vi.mocked(useUpdateTicketStatus).mockReturnValue({ mutate: vi.fn(), isPending: true, isError: true, error } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'support' }, signIn: vi.fn(), signOut: vi.fn() })

    renderDetail()

    expect(screen.getByRole('button', { name: 'Updating…' })).toBeDisabled()
    expect(screen.getByText("Cannot move from 'Open' to 'Closed'.")).toBeInTheDocument()
  })
})
