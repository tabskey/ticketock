import { Link, useParams } from 'react-router-dom'
import { useTicket } from '../hooks/useTicket'
import { useUpdateTicketStatus } from '../hooks/useUpdateTicketStatus'
import { useAuth } from '../auth/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { ErrorMessage } from '../components/ErrorMessage'
import { nextStatus } from '../types/ticket'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const { auth } = useAuth()

  const { data: ticket, isLoading, isError, error } = useTicket(ticketId)
  const updateStatus = useUpdateTicketStatus(ticketId)

  if (isLoading) return <p className="text-sm text-slate-500">Loading ticket…</p>
  if (isError) return <ErrorMessage error={error} />
  if (!ticket) return null

  const upcoming = nextStatus(ticket.status)
  const canAdvance = auth?.role === 'support' && upcoming !== null

  return (
    <div className="space-y-6">
      <Link to="/tickets" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to tickets
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{ticket.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              #{ticket.id} · {ticket.category} · opened {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>

        {canAdvance && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <button
              onClick={() => updateStatus.mutate(upcoming)}
              disabled={updateStatus.isPending}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {updateStatus.isPending ? 'Updating…' : `Move to ${upcoming}`}
            </button>
            {updateStatus.isError && (
              <div className="mt-3">
                <ErrorMessage error={updateStatus.error} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">History</h2>
        <ol className="space-y-3">
          {ticket.history.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">{new Date(entry.changed_at).toLocaleString()}</span>
              <span className="text-slate-400">
                {entry.from_status ? `${entry.from_status} →` : 'Created as'}
              </span>
              <StatusBadge status={entry.to_status} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
