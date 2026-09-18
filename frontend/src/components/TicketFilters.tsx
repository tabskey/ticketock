import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '../types/ticket'
import type { TicketCategory, TicketListParams, TicketPriority, TicketStatus } from '../types/ticket'

interface TicketFiltersProps {
  params: TicketListParams
  onChange: (params: TicketListParams) => void
}

const selectClasses =
  'rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-slate-500 focus:outline-none'

export function TicketFilters({ params, onChange }: TicketFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className={selectClasses}
        value={params.status ?? ''}
        onChange={(e) =>
          onChange({ ...params, status: (e.target.value || undefined) as TicketStatus | undefined, page: 1 })
        }
      >
        <option value="">All statuses</option>
        {TICKET_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <select
        className={selectClasses}
        value={params.category ?? ''}
        onChange={(e) =>
          onChange({ ...params, category: (e.target.value || undefined) as TicketCategory | undefined, page: 1 })
        }
      >
        <option value="">All categories</option>
        {TICKET_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        className={selectClasses}
        value={params.priority ?? ''}
        onChange={(e) =>
          onChange({ ...params, priority: (e.target.value || undefined) as TicketPriority | undefined, page: 1 })
        }
      >
        <option value="">All priorities</option>
        {TICKET_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-2">
        <select
          className={selectClasses}
          value={params.sort_by ?? 'created_at'}
          onChange={(e) => onChange({ ...params, sort_by: e.target.value as TicketListParams['sort_by'] })}
        >
          <option value="created_at">Sort by date</option>
          <option value="priority">Sort by priority</option>
        </select>

        <select
          className={selectClasses}
          value={params.order ?? 'desc'}
          onChange={(e) => onChange({ ...params, order: e.target.value as TicketListParams['order'] })}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  )
}
