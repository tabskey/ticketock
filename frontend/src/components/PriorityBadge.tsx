import type { TicketPriority } from '../types/ticket'

const STYLES: Record<TicketPriority, string> = {
  Low: 'bg-[#DFF3E6] text-[#1E8A55] dark:bg-[#173A2A] dark:text-[#5AD196]',
  Medium: 'bg-[#FDF0D8] text-[#B4740E] dark:bg-[#3A2E17] dark:text-[#F0B74A]',
  High: 'bg-[#FCE4E4] text-[#C0392B] dark:bg-[#3A2030] dark:text-[#F17E7E]',
  Urgent: 'bg-[#F7D6E4] text-[#9C1750] dark:bg-[#3A1A2A] dark:text-[#F17EB0]',
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[priority]}`}>
      {priority}
    </span>
  )
}
