import type { TicketCategory, TicketPriority, TicketStatus } from '../types/ticket'

// Portuguese labels + colors matching design-reference/home.html's mockup palette.
// Intentionally local to the home page and independent from components/StatusBadge.tsx
// and components/PriorityBadge.tsx (which use English labels/generic colors for the
// ticket list/detail pages) — do not merge without a deliberate decision.

export const CATEGORY_BADGE_CLASS =
  'bg-status-neutral-bg text-status-neutral-text dark:bg-status-neutral-bg-dark dark:text-status-neutral-text-dark'

export const CATEGORY_LABEL_PT: Record<TicketCategory, string> = {
  IT: 'TI',
  Facilities: 'Instalações',
  HR: 'RH',
}

export const PRIORITY_STYLE_PT: Record<TicketPriority, { label: string; className: string }> = {
  Low: {
    label: '● Baixa',
    className: 'bg-status-success-bg text-status-success-text dark:bg-status-success-bg-dark dark:text-status-success-text-dark',
  },
  Medium: {
    label: '● Média',
    className: 'bg-status-warning-bg text-status-warning-text dark:bg-status-warning-bg-dark dark:text-status-warning-text-dark',
  },
  High: {
    label: '● Alta',
    className: 'bg-status-danger-bg text-status-danger-text dark:bg-status-danger-bg-dark dark:text-status-danger-text-dark',
  },
  // Not present in the mockup (no Urgent example) — a distinct rose/dark-red tone
  // chosen to read as more severe than High rather than reusing the same red.
  Urgent: {
    label: '● Urgente',
    className: 'bg-status-urgent-bg text-status-urgent-text dark:bg-status-urgent-bg-dark dark:text-status-urgent-text-dark',
  },
}

export const STATUS_STYLE_PT: Record<TicketStatus, { label: string; className: string }> = {
  Open: {
    label: 'Aberto',
    className: 'bg-status-warning-soft-bg text-status-warning-soft-text dark:bg-status-warning-soft-bg-dark dark:text-status-warning-soft-text-dark',
  },
  'In Progress': {
    label: 'Em andamento',
    className: 'bg-status-info-bg text-status-info-text dark:bg-status-info-bg-dark dark:text-status-info-text-dark',
  },
  Resolved: {
    label: 'Resolvido',
    className: 'bg-status-success-bg text-status-success-text dark:bg-status-success-bg-dark dark:text-status-success-text-dark',
  },
  Closed: {
    label: 'Fechado',
    className: 'bg-status-neutral-bg text-status-neutral-text dark:bg-status-neutral-bg-dark dark:text-status-neutral-text-dark',
  },
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
