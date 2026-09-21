import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { LoginPage } from './LoginPage'

vi.mock('../api/auth', () => ({ login: vi.fn() }))
vi.mock('../auth/AuthContext', () => ({ useAuth: vi.fn() }))

describe('LoginPage', () => {
  it('logs in and signs the user in on submit', async () => {
    const signIn = vi.fn()
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn, signOut: vi.fn() })
    vi.mocked(login).mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
      token_type: 'bearer',
      role: 'employee',
    })

    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: MemoryRouter })

    await user.type(screen.getByLabelText('Usuário ou e-mail'), 'employee@company.com')
    await user.type(screen.getByLabelText('Senha'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() =>
      expect(signIn).toHaveBeenCalledWith({ token: 'at', refreshToken: 'rt', role: 'employee', rememberMe: false }),
    )
    expect(login).toHaveBeenCalledWith({ email: 'employee@company.com', password: 'secret' })
  })

  it('respects the "remember me" checkbox', async () => {
    const signIn = vi.fn()
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn, signOut: vi.fn() })
    vi.mocked(login).mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
      token_type: 'bearer',
      role: 'employee',
    })

    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: MemoryRouter })

    await user.type(screen.getByLabelText('Usuário ou e-mail'), 'employee@company.com')
    await user.type(screen.getByLabelText('Senha'), 'secret')
    await user.click(screen.getByText('Lembrar de mim'))
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(signIn).toHaveBeenCalledWith(expect.objectContaining({ rememberMe: true })))
  })

  it('toggles password visibility', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: MemoryRouter })

    const passwordInput = screen.getByLabelText('Senha')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('shows an error message when login fails', async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, signIn: vi.fn(), signOut: vi.fn() })
    const { ApiError } = await import('../api/client')
    vi.mocked(login).mockRejectedValue(new ApiError({ code: 'UNAUTHORIZED', message: 'Invalid credentials', status: 401 }))

    const user = userEvent.setup()
    render(<LoginPage />, { wrapper: MemoryRouter })

    await user.type(screen.getByLabelText('Usuário ou e-mail'), 'wrong@company.com')
    await user.type(screen.getByLabelText('Senha'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
  })
})
