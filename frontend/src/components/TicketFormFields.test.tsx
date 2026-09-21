import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTicket } from '../api/tickets'
import { useTicketForm } from '../hooks/useTicketForm'
import { TicketFormFields } from './TicketFormFields'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ createTicket: vi.fn() }))

function Harness() {
  const form = useTicketForm({ onSuccess: vi.fn() })
  return <TicketFormFields form={form} idPrefix="new-ticket" autoFocusTitle />
}

describe('TicketFormFields', () => {
  it('renders all fields and lets the user fill them out', async () => {
    const user = userEvent.setup()
    const Wrapper = withQueryClient()
    render(<Wrapper><Harness /></Wrapper>)

    await user.type(screen.getByLabelText('Título'), 'Broken monitor')
    await user.type(screen.getByLabelText('Descrição'), 'Flickers on boot')

    expect(screen.getByLabelText('Título')).toHaveValue('Broken monitor')
    expect(screen.getByLabelText('Descrição')).toHaveValue('Flickers on boot')
    expect(screen.getByRole('button', { name: 'Abrir chamado' })).toBeEnabled()
  })

  it('shows a pending state, then a success message on submit', async () => {
    let resolveCreate: (value: unknown) => void = () => {}
    vi.mocked(createTicket).mockReturnValue(new Promise((resolve) => (resolveCreate = resolve)) as never)

    const user = userEvent.setup()
    const Wrapper = withQueryClient()
    render(<Wrapper><Harness /></Wrapper>)

    await user.type(screen.getByLabelText('Título'), 'Broken monitor')
    await user.type(screen.getByLabelText('Descrição'), 'Flickers on boot')
    await user.click(screen.getByRole('button', { name: 'Abrir chamado' }))

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()

    resolveCreate({ id: 1, title: 'Broken monitor' })

    await waitFor(() => expect(screen.getByText('Chamado aberto! Redirecionando…')).toBeInTheDocument())
  })

  it('shows an error message when creation fails', async () => {
    const { ApiError } = await import('../api/client')
    vi.mocked(createTicket).mockRejectedValue(new ApiError({ code: 'VALIDATION_ERROR', message: 'Invalid input', status: 422 }))

    const user = userEvent.setup()
    const Wrapper = withQueryClient()
    render(<Wrapper><Harness /></Wrapper>)

    await user.type(screen.getByLabelText('Título'), 'x')
    await user.type(screen.getByLabelText('Descrição'), 'y')
    await user.click(screen.getByRole('button', { name: 'Abrir chamado' }))

    await waitFor(() => expect(screen.getByText('Invalid input')).toBeInTheDocument())
  })
})
