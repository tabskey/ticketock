import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../hooks/useTickets'
import { TicketFilters } from '../components/TicketFilters'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { PriorityBadge } from '../components/PriorityBadge'
import { ErrorMessage } from '../components/ErrorMessage'
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Tickets</h1>
      </div>

      <TicketFilters params={params} onChange={setParams} />

      {isError && <ErrorMessage error={error} />}

      {isLoading && !data && <p className="text-sm text-slate-500">Loading tickets…</p>}

      {data && data.items.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
          No tickets match these filters.
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${ticket.id}`} className="font-bold text-slate-900 hover:underline">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ticket.category}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
