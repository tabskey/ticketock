import type { TicketCategory, TicketPriority, TicketStatus } from '../types/ticket'

// Portuguese labels + colors matching design-reference/home.html's mockup palette.
// Intentionally local to the home page and independent from components/StatusBadge.tsx
// and components/PriorityBadge.tsx (which use English labels/generic colors for the
// ticket list/detail pages) — do not merge without a deliberate decision.

export const CATEGORY_BADGE_CLASS = 'bg-[#EEEBF3] text-[#7A7690] dark:bg-[#282450] dark:text-[#A8A4C4]'

export const CATEGORY_LABEL_PT: Record<TicketCategory, string> = {
  IT: 'TI',
  Facilities: 'Instalações',
  HR: 'RH',
}

export const PRIORITY_STYLE_PT: Record<TicketPriority, { label: string; className: string }> = {
  Low: { label: '● Baixa', className: 'bg-[#DFF3E6] text-[#1E8A55] dark:bg-[#173A2A] dark:text-[#5AD196]' },
  Medium: { label: '● Média', className: 'bg-[#FDF0D8] text-[#B4740E] dark:bg-[#3A2E17] dark:text-[#F0B74A]' },
  High: { label: '● Alta', className: 'bg-[#FCE4E4] text-[#C0392B] dark:bg-[#3A2030] dark:text-[#F17E7E]' },
  // Not present in the mockup (no Urgent example) — a distinct rose/dark-red tone
  // chosen to read as more severe than High rather than reusing the same red.
  Urgent: { label: '● Urgente', className: 'bg-[#F7D6E4] text-[#9C1750] dark:bg-[#3A1A2A] dark:text-[#F17EB0]' },
}

export const STATUS_STYLE_PT: Record<TicketStatus, { label: string; className: string }> = {
  Open: { label: 'Aberto', className: 'bg-[#FCE7D0] text-[#C1650E] dark:bg-[#3A2717] dark:text-[#F0A15C]' },
  'In Progress': { label: 'Em andamento', className: 'bg-[#DEEAFB] text-[#2A5FC1] dark:bg-[#1B2C4A] dark:text-[#7DA9F5]' },
  Resolved: { label: 'Resolvido', className: 'bg-[#DFF3E6] text-[#1E8A55] dark:bg-[#173A2A] dark:text-[#5AD196]' },
  Closed: { label: 'Fechado', className: 'bg-[#EEEBF3] text-[#7A7690] dark:bg-[#282450] dark:text-[#A8A4C4]' },
}

const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatTicketMeta(isoDate: string): string {
  const date = new Date(isoDate)
  const day = date.getDate()
  const month = MONTHS_PT[date.getMonth()]
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month}, ${hh}:${mm}`
}
