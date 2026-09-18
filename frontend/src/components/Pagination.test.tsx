import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('shows the current page, total pages, and ticket count', () => {
    render(<Pagination page={2} pageSize={20} total={45} onPageChange={vi.fn()} />)
    expect(screen.getByText('Page 2 of 3 (45 tickets)')).toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last page', () => {
    render(<Pagination page={1} pageSize={20} total={20} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('calls onPageChange with the next page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} pageSize={20} total={100} onPageChange={onPageChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('treats zero total as a single, empty page', () => {
    render(<Pagination page={1} pageSize={20} total={0} onPageChange={vi.fn()} />)
    expect(screen.getByText('Page 1 of 1 (0 tickets)')).toBeInTheDocument()
  })
})
