import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'
import { TICKET_STATUSES } from '../types/ticket'

describe('StatusBadge', () => {
  it.each(TICKET_STATUSES)('renders the %s status label', (status) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })
})
