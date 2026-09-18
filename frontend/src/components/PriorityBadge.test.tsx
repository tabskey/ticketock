import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriorityBadge } from './PriorityBadge'
import { TICKET_PRIORITIES } from '../types/ticket'

describe('PriorityBadge', () => {
  it.each(TICKET_PRIORITIES)('renders the %s priority label', (priority) => {
    render(<PriorityBadge priority={priority} />)
    expect(screen.getByText(priority)).toBeInTheDocument()
  })
})
