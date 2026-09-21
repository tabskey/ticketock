import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TicketRow } from './TicketRow'
import type { Ticket } from '../types/ticket'

const ticket: Ticket = {
  id: 12,
  title: 'Printer is jamming',
  description: 'Paper stuck in tray 2',
  category: 'IT',
  priority: 'High',
  status: 'Open',
  created_by: 1,
  created_at: '2024-03-05T09:05:00.000Z',
  updated_at: '2024-03-05T09:05:00.000Z',
}

describe('TicketRow', () => {
  it('links to the ticket detail page and renders its details', () => {
    render(<TicketRow ticket={ticket} />, { wrapper: MemoryRouter })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/tickets/12')
    expect(screen.getByText('Printer is jamming')).toBeInTheDocument()
    expect(screen.getByText('TI')).toBeInTheDocument()
    expect(screen.getByText('● Alta')).toBeInTheDocument()
    expect(screen.getByText('Aberto')).toBeInTheDocument()
    expect(screen.getByText(/#12/)).toBeInTheDocument()
  })
})
