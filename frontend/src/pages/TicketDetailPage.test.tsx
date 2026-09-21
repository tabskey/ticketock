import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { getTicket, updateTicketStatus } from '../api/tickets'
import { useAuth } from '../auth/AuthContext'
import { TicketDetailPage } from './TicketDetailPage'
import { withQueryClient } from '../testUtils'
import type { TicketDetail } from '../types/ticket'

vi.mock('../api/tickets', () => ({ getTicket: vi.fn(), updateTicketStatus: vi.fn() }))
vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))

const baseTicket: TicketDetail = {
  id: 5,
  title: 'Printer is jamming',
  description: 'Paper stuck in tray 2',
  category: 'IT',
  priority: 'High',
  status: 'Open',
  created_by: 1,
  created_at: '2024-03-05T09:05:00.000Z',
  updated_at: '2024-03-05T09:05:00.000Z',
  history: [
    { id: 1, from_status: null, to_status: 'Open', changed_by: 1, changed_at: '2024-03-05T09:05:00.000Z', resolution_note: null },
  ],
}

function renderPage() {
  const Wrapper = withQueryClient()
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={['/tickets/5']}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('TicketDetailPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows an error message when loading fails', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', refreshToken: 'r', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })
    const { ApiError } = await import('../api/client')
    vi.mocked(getTicket).mockRejectedValue(new ApiError({ code: 'TICKET_NOT_FOUND', message: 'Ticket not found', status: 404 }))

    renderPage()

    await waitFor(() => expect(screen.getByText('Ticket not found')).toBeInTheDocument())
  })

  it('renders ticket details and history, with no advance button for an employee', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', refreshToken: 'r', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getTicket).mockResolvedValue(baseTicket)

    renderPage()

    await waitFor(() => expect(screen.getByText('Printer is jamming')).toBeInTheDocument())
    expect(screen.getByText(/Paper stuck in tray 2/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Mover para/ })).not.toBeInTheDocument()
  })

  it('lets support advance a non-terminal status directly', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', refreshToken: 'r', role: 'support' }, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getTicket).mockResolvedValue(baseTicket)
    vi.mocked(updateTicketStatus).mockResolvedValue({ ...baseTicket, status: 'In Progress' })

    const user = userEvent.setup()
    renderPage()

    const advanceButton = await screen.findByRole('button', { name: 'Mover para Em andamento' })
    await user.click(advanceButton)

    expect(updateTicketStatus).toHaveBeenCalledWith(5, 'In Progress', undefined)
  })

  it('opens the resolve modal when the next status is Resolved', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', refreshToken: 'r', role: 'support' }, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getTicket).mockResolvedValue({ ...baseTicket, status: 'In Progress' })

    const user = userEvent.setup()
    renderPage()

    const advanceButton = await screen.findByRole('button', { name: 'Mover para Resolvido' })
    await user.click(advanceButton)

    expect(screen.getByRole('heading', { name: 'Resolver chamado' })).toBeInTheDocument()
    expect(updateTicketStatus).not.toHaveBeenCalled()
  })

  it('shows no advance button once the ticket is Closed', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', refreshToken: 'r', role: 'support' }, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getTicket).mockResolvedValue({ ...baseTicket, status: 'Closed' })

    renderPage()

    await waitFor(() => expect(screen.getByText('Printer is jamming')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /Mover para/ })).not.toBeInTheDocument()
  })
})
