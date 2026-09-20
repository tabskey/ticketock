import type { TicketStatus } from '../types/ticket'
import { STATUS_STYLE_PT } from '../lib/ticketBadges'

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { label, className } = STATUS_STYLE_PT[status]

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
