import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { useAuth } from '../auth/AuthContext'

vi.mock('../auth/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('Layout', () => {
  it('hides the authenticated controls when signed out', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    render(
      <MemoryRouter>
        <Layout>
          <p>content</p>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('shows the role and lets the user sign out', async () => {
    const signOut = vi.fn()
    vi.mocked(useAuth).mockReturnValue({ auth: { token: 't', role: 'support' }, signIn: vi.fn(), signOut })

    render(
      <MemoryRouter>
        <Layout>
          <p>content</p>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getByText('support')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Sign out'))
    expect(signOut).toHaveBeenCalled()
  })
})
