import { Select } from './Select'
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
      <Select
        ariaLabel="Filter by status"
        className={selectClasses}
        value={params.status ?? ''}
        options={[
          { value: '', label: 'All statuses' },
          ...TICKET_STATUSES.map((status) => ({ value: status, label: status })),
        ]}
        onChange={(value) => onChange({ ...params, status: (value || undefined) as TicketStatus | undefined, page: 1 })}
      />

      <Select
        ariaLabel="Filter by category"
        className={selectClasses}
        value={params.category ?? ''}
        options={[
          { value: '', label: 'All categories' },
          ...TICKET_CATEGORIES.map((category) => ({ value: category, label: category })),
        ]}
        onChange={(value) =>
          onChange({ ...params, category: (value || undefined) as TicketCategory | undefined, page: 1 })
        }
      />

      <Select
        ariaLabel="Filter by priority"
        className={selectClasses}
        value={params.priority ?? ''}
        options={[
          { value: '', label: 'All priorities' },
          ...TICKET_PRIORITIES.map((priority) => ({ value: priority, label: priority })),
        ]}
        onChange={(value) =>
          onChange({ ...params, priority: (value || undefined) as TicketPriority | undefined, page: 1 })
        }
      />

      <div className="ml-auto flex items-center gap-2">
        <Select
          ariaLabel="Sort by"
          className={selectClasses}
          value={params.sort_by ?? 'created_at'}
          options={[
            { value: 'created_at', label: 'Sort by date' },
            { value: 'priority', label: 'Sort by priority' },
          ]}
          onChange={(value) => onChange({ ...params, sort_by: value as TicketListParams['sort_by'] })}
        />

        <Select
          ariaLabel="Sort order"
          className={selectClasses}
          value={params.order ?? 'desc'}
          options={[
            { value: 'desc', label: 'Descending' },
            { value: 'asc', label: 'Ascending' },
          ]}
          onChange={(value) => onChange({ ...params, order: value as TicketListParams['order'] })}
        />
      </div>
    </div>
  )
}
