import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketFilters } from './TicketFilters'

describe('TicketFilters', () => {
  it('resets the page and sets the status filter when changed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TicketFilters params={{ page: 3 }} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Filtrar por status' }))
    await user.click(screen.getByRole('option', { name: 'Aberto' }))

    expect(onChange).toHaveBeenCalledWith({ page: 1, status: 'Open' })
  })

  it('sets the category filter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TicketFilters params={{}} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Filtrar por categoria' }))
    await user.click(screen.getByRole('option', { name: 'RH' }))

    expect(onChange).toHaveBeenCalledWith({ page: 1, category: 'HR' })
  })

  it('sets the priority filter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TicketFilters params={{}} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Filtrar por prioridade' }))
    await user.click(screen.getByRole('option', { name: 'Urgente' }))

    expect(onChange).toHaveBeenCalledWith({ page: 1, priority: 'Urgent' })
  })

  it('changes sort field and direction without resetting the page', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TicketFilters params={{ page: 2 }} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Ordenar por' }))
    await user.click(screen.getByRole('option', { name: 'Ordenar por prioridade' }))
    expect(onChange).toHaveBeenCalledWith({ page: 2, sort_by: 'priority' })

    await user.click(screen.getByRole('button', { name: 'Direção da ordenação' }))
    await user.click(screen.getByRole('option', { name: 'Crescente' }))
    expect(onChange).toHaveBeenCalledWith({ page: 2, order: 'asc' })
  })
})
