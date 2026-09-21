import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from './Select'

const options = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'pending', label: 'Pending' },
]

describe('Select', () => {
  it('shows the label of the selected value', () => {
    render(<Select value="closed" options={options} onChange={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('Closed')
  })

  it('opens the listbox on click and selects an option', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select value="open" options={options} onChange={onChange} />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Pending' }))
    expect(onChange).toHaveBeenCalledWith('pending')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Select value="open" options={options} onChange={vi.fn()} />
        <button>outside</button>
      </div>,
    )
    await user.click(screen.getByRole('button', { name: /open/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'outside' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens with ArrowDown and navigates/selects with the keyboard', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select value="open" options={options} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('closed')
  })

  it('opens with ArrowUp when closed and closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Select value="open" options={options} onChange={vi.fn()} />)

    const trigger = screen.getByRole('button')
    trigger.focus()
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens on Space/Enter when closed', async () => {
    const user = userEvent.setup()
    render(<Select value="open" options={options} onChange={vi.fn()} />)
    const trigger = screen.getByRole('button')
    trigger.focus()
    await user.keyboard(' ')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('highlights an option on hover', async () => {
    const user = userEvent.setup()
    render(<Select value="open" options={options} onChange={vi.fn()} variant="brand" />)
    await user.click(screen.getByRole('button'))
    await user.hover(screen.getByRole('option', { name: 'Closed' }))
    expect(screen.getByRole('option', { name: 'Closed' })).toBeInTheDocument()
  })
})
