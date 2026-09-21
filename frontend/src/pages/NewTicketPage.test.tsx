import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NewTicketPage } from './NewTicketPage'
import { withQueryClient } from '../testUtils'

vi.mock('../api/tickets', () => ({ createTicket: vi.fn() }))

describe('NewTicketPage', () => {
  it('renders the back link, heading and form', () => {
    const Wrapper = withQueryClient()
    render(
      <Wrapper>
        <MemoryRouter>
          <NewTicketPage />
        </MemoryRouter>
      </Wrapper>,
    )

    expect(screen.getByRole('link', { name: /Voltar aos tickets/ })).toHaveAttribute('href', '/tickets')
    expect(screen.getByRole('heading', { name: 'Abrir chamado' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toBeInTheDocument()
  })
})
