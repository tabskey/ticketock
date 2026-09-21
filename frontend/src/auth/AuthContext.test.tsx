import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './AuthContext'
import { logout, refreshSession } from '../api/auth'

vi.mock('../api/auth', () => ({
  refreshSession: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
}))

function makeToken(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256' }))
  const body = btoa(JSON.stringify({ exp }))
  return `${header}.${body}.sig`
}

function Consumer() {
  const { auth, signIn, signOut } = useAuth()
  return (
    <div>
      <div data-testid="auth-state">{auth ? auth.token : 'signed-out'}</div>
      <button
        onClick={() =>
          signIn({ token: makeToken(Math.floor(Date.now() / 1000) + 3600), refreshToken: 'r1', role: 'employee', rememberMe: true })
        }
      >
        sign in (remember)
      </button>
      <button
        onClick={() =>
          signIn({ token: makeToken(Math.floor(Date.now() / 1000) + 3600), refreshToken: 'r1', role: 'employee' })
        }
      >
        sign in (session)
      </button>
      <button onClick={signOut}>sign out</button>
    </div>
  )
}

function renderWithProvider() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useRealTimers()
  })

  it('starts signed out when nothing is stored', () => {
    renderWithProvider()
    expect(screen.getByTestId('auth-state')).toHaveTextContent('signed-out')
  })

  it('restores a session from localStorage', () => {
    const token = makeToken(Math.floor(Date.now() / 1000) + 3600)
    localStorage.setItem('ticketock.auth', JSON.stringify({ token, refreshToken: 'r', role: 'employee' }))

    renderWithProvider()
    expect(screen.getByTestId('auth-state')).toHaveTextContent(token)
  })

  it('signs in with remember me and persists to localStorage', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByText('sign in (remember)'))

    expect(screen.getByTestId('auth-state')).not.toHaveTextContent('signed-out')
    expect(localStorage.getItem('ticketock.auth')).not.toBeNull()
    expect(sessionStorage.getItem('ticketock.auth')).toBeNull()
  })

  it('signs in without remember me and persists to sessionStorage only', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByText('sign in (session)'))

    expect(sessionStorage.getItem('ticketock.auth')).not.toBeNull()
    expect(localStorage.getItem('ticketock.auth')).toBeNull()
  })

  it('signs out and clears storage', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByText('sign in (remember)'))
    await user.click(screen.getByText('sign out'))

    expect(screen.getByTestId('auth-state')).toHaveTextContent('signed-out')
    expect(localStorage.getItem('ticketock.auth')).toBeNull()
    expect(sessionStorage.getItem('ticketock.auth')).toBeNull()
  })

  it('revokes the refresh token on the server when signing out', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByText('sign in (remember)'))
    await user.click(screen.getByText('sign out'))

    expect(logout).toHaveBeenCalledWith('r1')
  })

  it('silently refreshes the token shortly before it expires', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    const newToken = makeToken(Math.floor(Date.now() / 1000) + 7200)
    vi.mocked(refreshSession).mockResolvedValue({
      access_token: newToken,
      refresh_token: 'r2',
      token_type: 'bearer',
      role: 'employee',
    })

    const shortLivedToken = makeToken(Math.floor(Date.now() / 1000) + 31)
    localStorage.setItem('ticketock.auth', JSON.stringify({ token: shortLivedToken, refreshToken: 'r1', role: 'employee' }))

    renderWithProvider()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(refreshSession).toHaveBeenCalledWith('r1')
    expect(screen.getByTestId('auth-state')).toHaveTextContent(newToken)
  })

  it('signs out when the silent refresh fails', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    vi.mocked(refreshSession).mockRejectedValue(new Error('expired'))

    const shortLivedToken = makeToken(Math.floor(Date.now() / 1000) + 31)
    localStorage.setItem('ticketock.auth', JSON.stringify({ token: shortLivedToken, refreshToken: 'r1', role: 'employee' }))

    renderWithProvider()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(screen.getByTestId('auth-state')).toHaveTextContent('signed-out')
  })
})
