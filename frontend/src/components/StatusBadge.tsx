import type { TicketStatus } from '../types/ticket'

const STYLES: Record<TicketStatus, string> = {
  Open: 'bg-[#FCE7D0] text-[#C1650E] dark:bg-[#3A2717] dark:text-[#F0A15C]',
  'In Progress': 'bg-[#DEEAFB] text-[#2A5FC1] dark:bg-[#1B2C4A] dark:text-[#7DA9F5]',
  Resolved: 'bg-[#DFF3E6] text-[#1E8A55] dark:bg-[#173A2A] dark:text-[#5AD196]',
  Closed: 'bg-[#EEEBF3] text-[#7A7690] dark:bg-[#282450] dark:text-[#A8A4C4]',
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {status}
    </span>
  )
}
