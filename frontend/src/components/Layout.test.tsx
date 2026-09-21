import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useAuth } from '../auth/AuthContext'

vi.mock('../hooks/useCurrentUser', () => ({ useCurrentUser: vi.fn() }))
vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))

describe('Layout', () => {
  it('renders the sidebar, the new-ticket link and children', () => {
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    render(
      <Layout>
        <p>Page content</p>
      </Layout>,
      { wrapper: MemoryRouter },
    )

    expect(screen.getByRole('link', { name: /Abrir chamado/ })).toHaveAttribute('href', '/tickets/new')
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('toggles the theme when the theme button is clicked', async () => {
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as never)
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })

    const user = userEvent.setup()
    render(
      <Layout>
        <p>content</p>
      </Layout>,
      { wrapper: MemoryRouter },
    )

    const toggle = screen.getByRole('button', { name: 'Alternar tema' })
    await user.click(toggle)
    await user.click(toggle)
  })
})
