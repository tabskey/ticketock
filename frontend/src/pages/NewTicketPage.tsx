import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateTicket } from '../hooks/useCreateTicket'
import { ErrorMessage } from '../components/ErrorMessage'
import { Select } from '../components/Select'
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../types/ticket'
import type { TicketCategory, TicketPriority } from '../types/ticket'

const inputClasses =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none'

export function NewTicketPage() {
  const navigate = useNavigate()
  const createTicket = useCreateTicket()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TicketCategory>(TICKET_CATEGORIES[0])
  const [priority, setPriority] = useState<TicketPriority>(TICKET_PRIORITIES[0])

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    const ticket = await createTicket.mutateAsync({ title, description, category, priority })
    navigate(`/tickets/${ticket.id}`)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Submit a ticket</h1>

      <form className="space-y-4 rounded-lg border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            required
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            <Select
              id="category"
              className={inputClasses}
              value={category}
              options={TICKET_CATEGORIES.map((option) => ({ value: option, label: option }))}
              onChange={(value) => setCategory(value)}
            />
          </div>

          <div>
            <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
              Priority
            </label>
            <Select
              id="priority"
              className={inputClasses}
              value={priority}
              options={TICKET_PRIORITIES.map((option) => ({ value: option, label: option }))}
              onChange={(value) => setPriority(value)}
            />
          </div>
        </div>

        {createTicket.isError && <ErrorMessage error={createTicket.error} />}

        <button
          type="submit"
          disabled={createTicket.isPending}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {createTicket.isPending ? 'Submitting…' : 'Submit ticket'}
        </button>
      </form>
    </div>
  )
}
