import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ApiError } from '../api/client'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage', () => {
  it('shows the ApiError message when given one', () => {
    render(<ErrorMessage error={new ApiError({ code: 'TICKET_NOT_FOUND', message: 'Ticket not found', status: 404 })} />)
    expect(screen.getByText('Ticket not found')).toBeInTheDocument()
  })

  it('falls back to a generic message for unknown errors', () => {
    render(<ErrorMessage error={new Error('boom')} />)
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('applies a custom className when provided', () => {
    render(<ErrorMessage error={new Error('boom')} className="custom-class" />)
    expect(screen.getByText('Something went wrong. Please try again.')).toHaveClass('custom-class')
  })
})
