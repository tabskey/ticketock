import { SECONDARY_BUTTON_CLASSES } from '../lib/brandUi'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-brand-text-secondary dark:text-brand-text-muted">
      <span>
        Página {page} de {totalPages} ({total} tickets)
      </span>
      <div className="flex gap-2">
        <button className={SECONDARY_BUTTON_CLASSES} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </button>
        <button className={SECONDARY_BUTTON_CLASSES} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Próxima
        </button>
      </div>
    </div>
  )
}
