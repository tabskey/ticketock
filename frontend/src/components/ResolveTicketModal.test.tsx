import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResolveTicketModal } from './ResolveTicketModal'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ updateTicketStatus: vi.fn() }))

describe('ResolveTicketModal', () => {
  it('renders the form and closes via the close button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const Wrapper = withQueryClient()
    render(
      <Wrapper>
        <ResolveTicketModal ticketId={9} onClose={onClose} />
      </Wrapper>,
    )

    expect(screen.getByRole('heading', { name: 'Resolver chamado' })).toBeInTheDocument()
    expect(screen.getByLabelText('Como o chamado foi resolvido?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
