import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { updateTicketStatus } from '../api/tickets'
import { useResolveTicketForm } from '../hooks/useResolveTicketForm'
import { ResolveTicketFormFields } from './ResolveTicketFormFields'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ updateTicketStatus: vi.fn() }))

function Harness() {
  const form = useResolveTicketForm({ ticketId: 1, onSuccess: vi.fn() })
  return <ResolveTicketFormFields form={form} idPrefix="resolve" />
}

describe('ResolveTicketFormFields', () => {
  it('disables submit until a resolution note is entered', async () => {
    const user = userEvent.setup()
    const Wrapper = withQueryClient()
    render(<Wrapper><Harness /></Wrapper>)

    const submit = screen.getByRole('button', { name: 'Marcar como resolvido' })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText('Como o chamado foi resolvido?'), 'Replaced the cable')
    expect(submit).toBeEnabled()
  })

  it('shows a success message after resolving', async () => {
    vi.mocked(updateTicketStatus).mockResolvedValue({ id: 1, status: 'Resolved' } as never)

    const user = userEvent.setup()
    const Wrapper = withQueryClient()
    render(<Wrapper><Harness /></Wrapper>)

    await user.type(screen.getByLabelText('Como o chamado foi resolvido?'), 'Replaced the cable')
    await user.click(screen.getByRole('button', { name: 'Marcar como resolvido' }))

    await waitFor(() => expect(screen.getByText('Chamado resolvido! Fechando…')).toBeInTheDocument())
  })

  it('shows an error message when resolving fails', async () => {
    const { ApiError } = await import('../api/client')
    vi.mocked(updateTicketStatus).mockRejectedValue(
      new ApiError({ code: 'INVALID_STATUS_TRANSITION', message: 'Cannot resolve this ticket.', status: 422 }),
    )

    const user = userEvent.setup()
    const Wrapper = withQueryClient()
    render(<Wrapper><Harness /></Wrapper>)

    await user.type(screen.getByLabelText('Como o chamado foi resolvido?'), 'Replaced the cable')
    await user.click(screen.getByRole('button', { name: 'Marcar como resolvido' }))

    await waitFor(() => expect(screen.getByText('Cannot resolve this ticket.')).toBeInTheDocument())
  })
})
