import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { useAuth } from './AuthContext'

vi.mock('./AuthContext', () => ({ useAuth: vi.fn() }))

describe('RequireAuth', () => {
  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    render(
      <MemoryRouter initialEntries={['/tickets']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/tickets" element={<RequireAuth><div>Tickets page</div></RequireAuth>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      auth: { token: 't', refreshToken: 'r', role: 'employee' },
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/tickets']}>
        <Routes>
          <Route path="/tickets" element={<RequireAuth><div>Tickets page</div></RequireAuth>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Tickets page')).toBeInTheDocument()
  })
})
