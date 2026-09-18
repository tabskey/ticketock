import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorMessage } from './ErrorMessage'
import { ApiError } from '../api/client'

describe('ErrorMessage', () => {
  it('shows the message from an ApiError', () => {
    const error = new ApiError({ code: 'TICKET_NOT_FOUND', message: 'Ticket 1 not found.', status: 404 })
    render(<ErrorMessage error={error} />)
    expect(screen.getByText('Ticket 1 not found.')).toBeInTheDocument()
  })

  it('falls back to a generic message for a non-ApiError value', () => {
    render(<ErrorMessage error={new Error('network down')} />)
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })
})
