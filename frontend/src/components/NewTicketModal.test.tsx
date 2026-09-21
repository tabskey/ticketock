import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { NewTicketModal } from './NewTicketModal'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ createTicket: vi.fn() }))

describe('NewTicketModal', () => {
  it('renders the form and closes via the close button', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const Wrapper = withQueryClient()
    render(
      <Wrapper>
        <MemoryRouter>
          <NewTicketModal onClose={onClose} />
        </MemoryRouter>
      </Wrapper>,
    )

    expect(screen.getByRole('heading', { name: 'Abrir chamado' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
