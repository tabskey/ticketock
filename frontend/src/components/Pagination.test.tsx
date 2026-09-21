import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('shows the current page, total pages and ticket count', () => {
    render(<Pagination page={2} pageSize={20} total={45} onPageChange={vi.fn()} />)
    expect(screen.getByText('Página 2 de 3 (45 tickets)')).toBeInTheDocument()
  })

  it('disables Anterior on the first page and Próxima on the last page', () => {
    render(<Pagination page={1} pageSize={20} total={10} onPageChange={vi.fn()} />)
    expect(screen.getByText('Anterior')).toBeDisabled()
    expect(screen.getByText('Próxima')).toBeDisabled()
  })

  it('calls onPageChange with the next and previous page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={2} pageSize={10} total={50} onPageChange={onPageChange} />)

    await user.click(screen.getByText('Próxima'))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByText('Anterior'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('always shows at least one page even with zero total', () => {
    render(<Pagination page={1} pageSize={20} total={0} onPageChange={vi.fn()} />)
    expect(screen.getByText('Página 1 de 1 (0 tickets)')).toBeInTheDocument()
  })
})
