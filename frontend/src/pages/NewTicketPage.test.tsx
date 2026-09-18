import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NewTicketPage } from './NewTicketPage'
import { useCreateTicket } from '../hooks/useCreateTicket'
import { ApiError } from '../api/client'

vi.mock('../hooks/useCreateTicket', () => ({
  useCreateTicket: vi.fn(),
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/tickets/new']}>
      <Routes>
        <Route path="/tickets/new" element={<NewTicketPage />} />
        <Route path="/tickets/:id" element={<p>ticket detail page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NewTicketPage', () => {
  it('submits the form and navigates to the created ticket', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 42 })
    vi.mocked(useCreateTicket).mockReturnValue({ mutateAsync, isPending: false, isError: false } as never)

    renderPage()

    await userEvent.type(screen.getByLabelText('Title'), 'VPN drops constantly')
    await userEvent.type(screen.getByLabelText('Description'), 'Disconnects every few minutes.')
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'IT')
    await userEvent.selectOptions(screen.getByLabelText('Priority'), 'Urgent')
    await userEvent.click(screen.getByRole('button', { name: 'Submit ticket' }))

    expect(mutateAsync).toHaveBeenCalledWith({
      title: 'VPN drops constantly',
      description: 'Disconnects every few minutes.',
      category: 'IT',
      priority: 'Urgent',
    })
    expect(await screen.findByText('ticket detail page')).toBeInTheDocument()
  })

  it('shows the mutation error without navigating', () => {
    const error = new ApiError({ code: 'VALIDATION_ERROR', message: 'Invalid request payload.', status: 422 })
    vi.mocked(useCreateTicket).mockReturnValue({ mutateAsync: vi.fn(), isPending: false, isError: true, error } as never)

    renderPage()

    expect(screen.getByText('Invalid request payload.')).toBeInTheDocument()
  })

  it('disables the submit button while pending', () => {
    vi.mocked(useCreateTicket).mockReturnValue({ mutateAsync: vi.fn(), isPending: true, isError: false } as never)

    renderPage()

    expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled()
  })
})
