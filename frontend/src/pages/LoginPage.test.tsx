import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

function renderLoginPage(initialEntries: Parameters<typeof MemoryRouter>[0]['initialEntries'] = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tickets" element={<p>tickets page</p>} />
        <Route path="/tickets/5" element={<p>ticket 5 page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('signs in and redirects to /tickets by default', async () => {
    const signIn = vi.fn()
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn, signOut: vi.fn() })
    vi.mocked(login).mockResolvedValue({ access_token: 'token-123', token_type: 'bearer', role: 'support' })

    renderLoginPage()

    await userEvent.type(screen.getByLabelText('Email'), 'support@company.com')
    await userEvent.type(screen.getByLabelText('Password'), 'support123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(login).toHaveBeenCalledWith({ email: 'support@company.com', password: 'support123' })
    expect(signIn).toHaveBeenCalledWith({ token: 'token-123', role: 'support' })
    expect(await screen.findByText('tickets page')).toBeInTheDocument()
  })

  it('redirects back to the page the user was sent from', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    vi.mocked(login).mockResolvedValue({ access_token: 'token-123', token_type: 'bearer', role: 'employee' })

    renderLoginPage([{ pathname: '/login', state: { from: { pathname: '/tickets/5' } } }])

    await userEvent.type(screen.getByLabelText('Email'), 'employee@company.com')
    await userEvent.type(screen.getByLabelText('Password'), 'employee123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('ticket 5 page')).toBeInTheDocument()
  })

  it('shows an error and stays on the page when login fails', async () => {
    const signIn = vi.fn()
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn, signOut: vi.fn() })
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials.'))

    renderLoginPage()

    await userEvent.type(screen.getByLabelText('Email'), 'nobody@company.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })
})
