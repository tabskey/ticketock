import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { useAuth } from './auth/AuthContext'
import { useCurrentUser } from './hooks/useCurrentUser'
import { listTickets } from './api/tickets'
import { withQueryClient } from './testUtils'

vi.mock('./auth/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('./hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }))
vi.mock('./api/tickets', () => ({ listTickets: vi.fn(), getTicket: vi.fn(), createTicket: vi.fn(), updateTicketStatus: vi.fn() }))

function renderAt(path: string) {
  const Wrapper = withQueryClient()
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Wrapper>,
  )
}

describe('App routing', () => {
  it('redirects an unauthenticated visitor to /login', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    renderAt('/')

    await waitFor(() => expect(screen.getByText('Bem-vindo(a)!')).toBeInTheDocument())
  })

  it('renders the home page for an authenticated user', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', refreshToken: 'r', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as never)
    vi.mocked(listTickets).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 4 })

    renderAt('/')

    await waitFor(() => expect(screen.getByText('O que aconteceu hoje?')).toBeInTheDocument())
  })

  it('redirects an unknown route to /', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', refreshToken: 'r', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as never)
    vi.mocked(listTickets).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 4 })

    renderAt('/somewhere-unknown')

    await waitFor(() => expect(screen.getByText('O que aconteceu hoje?')).toBeInTheDocument())
  })
})
