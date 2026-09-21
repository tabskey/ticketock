import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { HomeSidebar } from './HomeSidebar'
import { useAuth } from '../auth/AuthContext'
import type { CurrentUser } from '../types/user'

vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))

const user: CurrentUser = { id: 1, email: 'ana@company.com', name: 'Ana Silva', role: 'employee' }

describe('HomeSidebar', () => {
  it('shows the user name and role label', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    render(<HomeSidebar user={user} />, { wrapper: MemoryRouter })

    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('Funcionário')).toBeInTheDocument()
  })

  it('shows the support role label', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    render(<HomeSidebar user={{ ...user, role: 'support' }} />, { wrapper: MemoryRouter })
    expect(screen.getByText('Suporte')).toBeInTheDocument()
  })

  it('renders without a user', () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    render(<HomeSidebar user={undefined} />, { wrapper: MemoryRouter })
    expect(screen.getByLabelText('User avatar')).toBeInTheDocument()
  })

  it('signs out and navigates to /login on logout', async () => {
    const signOut = vi.fn()
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut })
    const usr = userEvent.setup()

    render(<HomeSidebar user={user} />, { wrapper: MemoryRouter })
    await usr.click(screen.getByText('Logout'))

    expect(signOut).toHaveBeenCalled()
  })
})
