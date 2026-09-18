import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketFilters } from './TicketFilters'

describe('TicketFilters', () => {
  it('resets to page 1 and reports the new status', async () => {
    const onChange = vi.fn()
    render(<TicketFilters params={{ page: 3 }} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByDisplayValue('All statuses'), 'Open')

    expect(onChange).toHaveBeenCalledWith({ page: 1, status: 'Open' })
  })

  it('resets to page 1 and reports the new category', async () => {
    const onChange = vi.fn()
    render(<TicketFilters params={{ page: 2 }} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByDisplayValue('All categories'), 'IT')

    expect(onChange).toHaveBeenCalledWith({ page: 1, category: 'IT' })
  })

  it('resets to page 1 and reports the new priority', async () => {
    const onChange = vi.fn()
    render(<TicketFilters params={{ page: 2 }} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByDisplayValue('All priorities'), 'Urgent')

    expect(onChange).toHaveBeenCalledWith({ page: 1, priority: 'Urgent' })
  })

  it('does not reset the page when changing sort field or order', async () => {
    const onChange = vi.fn()
    render(<TicketFilters params={{ page: 2 }} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByDisplayValue('Sort by date'), 'priority')
    expect(onChange).toHaveBeenLastCalledWith({ page: 2, sort_by: 'priority' })

    await userEvent.selectOptions(screen.getByDisplayValue('Descending'), 'asc')
    expect(onChange).toHaveBeenLastCalledWith({ page: 2, order: 'asc' })
  })

  it('clears a filter back to "all" when the blank option is chosen', async () => {
    const onChange = vi.fn()
    render(<TicketFilters params={{ page: 1, status: 'Open' }} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByDisplayValue('Open'), '')

    expect(onChange).toHaveBeenCalledWith({ page: 1, status: undefined })
  })
})
