import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { getCurrentUser } from '../api/users'
import { listTickets } from '../api/tickets'
import { useAuth } from '../auth/AuthContext'
import { HomePage } from './HomePage'
import { withQueryClient } from '../testUtils'
import type { Ticket } from '../types/ticket'

vi.mock('../api/users', () => ({ getCurrentUser: vi.fn() }))
vi.mock('../api/tickets', () => ({ listTickets: vi.fn(), createTicket: vi.fn() }))
vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))

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
        <HomePage />
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('HomePage', () => {
  it('greets the user by name and shows recent tickets', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, email: 'ana@company.com', name: 'Ana Silva', role: 'employee' })
    vi.mocked(listTickets).mockResolvedValue({ items: [ticket(1)], total: 1, page: 1, page_size: 4 })

    renderPage()

    await waitFor(() => expect(screen.getByText('Oi, Ana Silva! 👋')).toBeInTheDocument())
    expect(screen.getByText('Ticket 1')).toBeInTheDocument()
  })

  it('shows an empty state with a call to open a ticket', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, email: 'ana@company.com', name: 'Ana Silva', role: 'employee' })
    vi.mocked(listTickets).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 4 })

    renderPage()

    await waitFor(() => expect(screen.getByText('Você ainda não abriu nenhum chamado.')).toBeInTheDocument())
  })

  it('shows an error message when tickets fail to load', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, email: 'ana@company.com', name: 'Ana Silva', role: 'employee' })
    const { ApiError } = await import('../api/client')
    vi.mocked(listTickets).mockRejectedValue(new ApiError({ code: 'UNAUTHORIZED', message: 'Not allowed', status: 403 }))

    renderPage()

    await waitFor(() => expect(screen.getByText('Not allowed')).toBeInTheDocument())
  })

  it('opens the new-ticket modal from the header button', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1, email: 'ana@company.com', name: 'Ana Silva', role: 'employee' })
    vi.mocked(listTickets).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 4 })

    const user = userEvent.setup()
    renderPage()

    await waitFor(() => expect(screen.getByText('Você ainda não abriu nenhum chamado.')).toBeInTheDocument())
    await user.click(screen.getAllByRole('button', { name: /Abrir chamado/ })[0])

    expect(screen.getByRole('heading', { name: 'Abrir chamado' })).toBeInTheDocument()
  })
})
