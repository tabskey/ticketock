import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Ticket } from '../types/ticket'
import { CATEGORY_BADGE_CLASS, CATEGORY_LABEL_PT, PRIORITY_STYLE_PT, STATUS_STYLE_PT, formatTicketMeta } from '../lib/ticketBadges'

export function TicketRow({ ticket }: { ticket: Ticket }) {
  const priority = PRIORITY_STYLE_PT[ticket.priority]
  const status = STATUS_STYLE_PT[ticket.status]

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="flex items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-[0_1px_2px_rgba(33,29,63,0.05),0_10px_28px_rgba(33,29,63,0.06)] transition hover:-translate-y-px dark:border-brand-border-dark dark:bg-brand-surface-card-dark dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_28px_rgba(0,0,0,0.4)]"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 truncate text-[14.5px] font-extrabold text-brand-text-dark dark:text-brand-text">
          {ticket.title}
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded-[7px] px-2.5 py-0.5 text-[11.5px] font-semibold ${CATEGORY_BADGE_CLASS}`}>
            {CATEGORY_LABEL_PT[ticket.category]}
          </span>
          <span className={`inline-flex items-center rounded-[7px] px-2.5 py-0.5 text-[11.5px] font-semibold ${priority.className}`}>
            {priority.label}
          </span>
        </div>
        <div className="text-xs text-brand-text-secondary dark:text-brand-text-muted">
          #{ticket.id} · {formatTicketMeta(ticket.created_at)}
        </div>
      </div>
      <span className={`flex-none whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${status.className}`}>
        {status.label}
      </span>
      <ChevronRight className="h-4 w-4 flex-none text-brand-text-secondary dark:text-brand-text-muted" />
    </Link>
  )
}
