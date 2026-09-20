import { Select } from './Select'
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '../types/ticket'
import type { TicketCategory, TicketListParams, TicketPriority, TicketStatus } from '../types/ticket'
import { CATEGORY_LABEL_PT, PRIORITY_LABEL_PT, STATUS_STYLE_PT } from '../lib/ticketBadges'

interface TicketFiltersProps {
  params: TicketListParams
  onChange: (params: TicketListParams) => void
}

const selectClasses =
  'rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-[13px] font-semibold text-brand-text-dark dark:border-brand-border-dark dark:bg-brand-surface-card-dark dark:text-brand-text'

export function TicketFilters({ params, onChange }: TicketFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        ariaLabel="Filtrar por status"
        variant="brand"
        className={selectClasses}
        value={params.status ?? ''}
        options={[
          { value: '', label: 'Todos os status' },
          ...TICKET_STATUSES.map((status) => ({ value: status, label: STATUS_STYLE_PT[status].label })),
        ]}
        onChange={(value) => onChange({ ...params, status: (value || undefined) as TicketStatus | undefined, page: 1 })}
      />

      <Select
        ariaLabel="Filtrar por categoria"
        variant="brand"
        className={selectClasses}
        value={params.category ?? ''}
        options={[
          { value: '', label: 'Todas as categorias' },
          ...TICKET_CATEGORIES.map((category) => ({ value: category, label: CATEGORY_LABEL_PT[category] })),
        ]}
        onChange={(value) =>
          onChange({ ...params, category: (value || undefined) as TicketCategory | undefined, page: 1 })
        }
      />

      <Select
        ariaLabel="Filtrar por prioridade"
        variant="brand"
        className={selectClasses}
        value={params.priority ?? ''}
        options={[
          { value: '', label: 'Todas as prioridades' },
          ...TICKET_PRIORITIES.map((priority) => ({ value: priority, label: PRIORITY_LABEL_PT[priority] })),
        ]}
        onChange={(value) =>
          onChange({ ...params, priority: (value || undefined) as TicketPriority | undefined, page: 1 })
        }
      />

      <div className="ml-auto flex items-center gap-2">
        <Select
          ariaLabel="Ordenar por"
          variant="brand"
          className={selectClasses}
          value={params.sort_by ?? 'created_at'}
          options={[
            { value: 'created_at', label: 'Ordenar por data' },
            { value: 'priority', label: 'Ordenar por prioridade' },
          ]}
          onChange={(value) => onChange({ ...params, sort_by: value as TicketListParams['sort_by'] })}
        />

        <Select
          ariaLabel="Direção da ordenação"
          variant="brand"
          className={selectClasses}
          value={params.order ?? 'desc'}
          options={[
            { value: 'desc', label: 'Decrescente' },
            { value: 'asc', label: 'Crescente' },
          ]}
          onChange={(value) => onChange({ ...params, order: value as TicketListParams['order'] })}
        />
      </div>
    </div>
  )
}
