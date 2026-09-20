import { Link, useParams } from 'react-router-dom'
import { useTicket } from '../hooks/useTicket'
import { useUpdateTicketStatus } from '../hooks/useUpdateTicketStatus'
import { useAuth } from '../auth/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { ErrorMessage } from '../components/ErrorMessage'
import { CARD_CLASSES, ERROR_CLASSES, PRIMARY_BUTTON_CLASSES } from '../lib/brandUi'
import { CATEGORY_LABEL_PT, STATUS_STYLE_PT, formatTicketMeta } from '../lib/ticketBadges'
import { nextStatus } from '../types/ticket'

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const { auth } = useAuth()

  const { data: ticket, isLoading, isError, error } = useTicket(ticketId)
  const updateStatus = useUpdateTicketStatus(ticketId)

  if (isLoading) return <p className="text-sm text-brand-text-secondary dark:text-brand-text-muted">Carregando ticket…</p>
  if (isError) return <ErrorMessage error={error} className={ERROR_CLASSES} />
  if (!ticket) return null

  const upcoming = nextStatus(ticket.status)
  const canAdvance = auth?.role === 'support' && upcoming !== null

  return (
    <div className="space-y-6">
      <Link
        to="/tickets"
        className="text-sm text-brand-text-secondary hover:text-brand-text-dark dark:text-brand-text-muted dark:hover:text-brand-text"
      >
        ← Voltar aos tickets
      </Link>

      <div className={CARD_CLASSES}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-brand-text-dark dark:text-brand-text">{ticket.title}</h1>
            <p className="mt-1 text-sm font-medium text-brand-text-secondary dark:text-brand-text-muted">
              #{ticket.id} · {CATEGORY_LABEL_PT[ticket.category]} · aberto em {formatTicketMeta(ticket.created_at)}
            </p>
          </div>
          <div className="flex flex-none gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-brand-text-dark dark:text-brand-text-soft">{ticket.description}</p>

        {canAdvance && (
          <div className="mt-6 border-t border-brand-border pt-4 dark:border-brand-border-dark">
            <button onClick={() => updateStatus.mutate(upcoming)} disabled={updateStatus.isPending} className={PRIMARY_BUTTON_CLASSES}>
              {updateStatus.isPending ? 'Atualizando…' : `Mover para ${STATUS_STYLE_PT[upcoming].label}`}
            </button>
            {updateStatus.isError && (
              <div className="mt-3">
                <ErrorMessage error={updateStatus.error} className={ERROR_CLASSES} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className={CARD_CLASSES}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-text-secondary dark:text-brand-text-muted">
          Histórico
        </h2>
        <ol className="space-y-3">
          {ticket.history.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 text-sm">
              <span className="text-brand-text-secondary dark:text-brand-text-muted">{formatTicketMeta(entry.changed_at)}</span>
              <span className="text-brand-text-secondary/70 dark:text-brand-text-muted/70">
                {entry.from_status ? `${STATUS_STYLE_PT[entry.from_status].label} →` : 'Criado como'}
              </span>
              <StatusBadge status={entry.to_status} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
