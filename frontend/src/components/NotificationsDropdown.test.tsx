import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { NotificationsDropdown } from './NotificationsDropdown'
import type { Ticket } from '../types/ticket'

function ticket(id: number): Ticket {
  return {
    id,
    title: `Ticket ${id}`,
    description: '',
    category: 'IT',
    priority: 'Low',
    status: 'Open',
    created_by: 1,
    created_at: '2024-03-05T09:05:00.000Z',
    updated_at: '2024-03-05T09:05:00.000Z',
  }
}

describe('NotificationsDropdown', () => {
  it('shows no alert indicator when there are no unread tickets', () => {
    render(<NotificationsDropdown tickets={[]} />, { wrapper: MemoryRouter })
    expect(screen.getByRole('button', { name: 'Notificações' })).toBeInTheDocument()
  })

  it('opens to show an empty state when there are no tickets', async () => {
    const user = userEvent.setup()
    render(<NotificationsDropdown tickets={[]} />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: 'Notificações' }))
    expect(screen.getByText('Nenhuma novidade por aqui.')).toBeInTheDocument()
  })

  it('lists unread tickets and closes when one is clicked', async () => {
    const user = userEvent.setup()
    render(<NotificationsDropdown tickets={[ticket(1), ticket(2)]} />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: 'Notificações' }))
    expect(screen.getByText('Ticket 1')).toBeInTheDocument()
    expect(screen.getByText('Ticket 2')).toBeInTheDocument()

    await user.click(screen.getByText('Ticket 1'))
    expect(screen.queryByText('Ticket 2')).not.toBeInTheDocument()
  })

  it('closes when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <NotificationsDropdown tickets={[ticket(1)]} />
        <button>outside</button>
      </div>,
      { wrapper: MemoryRouter },
    )

    await user.click(screen.getByRole('button', { name: 'Notificações' }))
    expect(screen.getByText('Ticket 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByText('Ticket 1')).not.toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<NotificationsDropdown tickets={[ticket(1)]} />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: 'Notificações' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByText('Ticket 1')).not.toBeInTheDocument()
  })
})
