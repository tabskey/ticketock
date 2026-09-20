import type { TicketPriority } from '../types/ticket'
import { PRIORITY_STYLE_PT } from '../lib/ticketBadges'

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { label, className } = PRIORITY_STYLE_PT[priority]

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
