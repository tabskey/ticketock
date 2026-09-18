import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { useAuth } from './AuthContext'

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}))

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/tickets']}>
      <Routes>
        <Route path="/login" element={<p>login screen</p>} />
        <Route
          path="/tickets"
          element={
            <RequireAuth>
              <p>protected content</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  it('redirects to /login when signed out', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    renderProtected()

    expect(screen.getByText('login screen')).toBeInTheDocument()
    expect(screen.queryByText('protected content')).not.toBeInTheDocument()
  })

  it('renders the protected content when signed in', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'employee' }, signIn: vi.fn(), signOut: vi.fn() })

    renderProtected()

    expect(screen.getByText('protected content')).toBeInTheDocument()
  })
})
