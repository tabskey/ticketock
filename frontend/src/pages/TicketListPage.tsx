import { useState } from 'react'
import { useTickets } from '../hooks/useTickets'
import { TicketFilters } from '../components/TicketFilters'
import { Pagination } from '../components/Pagination'
import { ErrorMessage } from '../components/ErrorMessage'
import { TicketRow } from '../components/TicketRow'
import { ERROR_CLASSES } from '../lib/brandUi'
import type { TicketListParams } from '../types/ticket'

const PAGE_SIZE = 20

export function TicketListPage() {
  const [params, setParams] = useState<TicketListParams>({
    page: 1,
    page_size: PAGE_SIZE,
    sort_by: 'created_at',
    order: 'desc',
  })

  const { data, isLoading, isError, error } = useTickets(params)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold text-brand-text-dark dark:text-brand-text">Meus tickets</h1>

      <TicketFilters params={params} onChange={setParams} />

      {isError && <ErrorMessage error={error} className={ERROR_CLASSES} />}

      {isLoading && !data && (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[70px] animate-pulse rounded-2xl border border-brand-border bg-brand-surface dark:border-brand-border-dark dark:bg-brand-surface-card-dark"
            />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center dark:border-brand-border-dark dark:bg-brand-surface-card-dark">
          <p className="text-[14.5px] text-brand-text-secondary dark:text-brand-text-muted">
            Nenhum ticket encontrado com esses filtros.
          </p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {data.items.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {data && (
        <Pagination
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={(page) => setParams({ ...params, page })}
        />
      )}
    </div>
  )
}
