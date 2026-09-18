import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { useAuth } from './auth/AuthContext'

vi.mock('./auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))
vi.mock('./pages/LoginPage', () => ({ LoginPage: () => <p>login page</p> }))
vi.mock('./pages/TicketListPage', () => ({ TicketListPage: () => <p>ticket list page</p> }))
vi.mock('./pages/TicketDetailPage', () => ({ TicketDetailPage: () => <p>ticket detail page</p> }))
vi.mock('./pages/NewTicketPage', () => ({ NewTicketPage: () => <p>new ticket page</p> }))

function renderApp(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('sends a signed-out visitor to the login page for any unknown route', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    renderApp(['/does-not-exist'])

    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('renders the ticket list behind the layout once signed in', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'support' }, signIn: vi.fn(), signOut: vi.fn() })

    renderApp(['/tickets'])

    expect(screen.getByText('ticket list page')).toBeInTheDocument()
    expect(screen.getByText('Ticketock')).toBeInTheDocument()
  })

  it('redirects an unknown route to /tickets when signed in', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })

    renderApp(['/does-not-exist'])

    expect(screen.getByText('ticket list page')).toBeInTheDocument()
  })

  it('renders the new ticket page route', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })

    renderApp(['/tickets/new'])

    expect(screen.getByText('new ticket page')).toBeInTheDocument()
  })

  it('renders the ticket detail page route', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })

    renderApp(['/tickets/5'])

    expect(screen.getByText('ticket detail page')).toBeInTheDocument()
  })
})
