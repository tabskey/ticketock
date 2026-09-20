import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import type { Ticket } from '../types/ticket'
import { formatTicketMeta } from '../lib/ticketBadges'

export function NotificationsDropdown({ tickets }: { tickets: Ticket[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasUnread = tickets.length > 0

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Notificações"
        onClick={() => setIsOpen((open) => !open)}
        className={`relative flex h-[38px] w-[38px] items-center justify-center rounded-full border bg-brand-surface transition dark:bg-brand-surface-card-dark ${
          hasUnread ? 'border-brand-alert/50 ring-2 ring-brand-alert/40' : 'border-brand-border dark:border-brand-border-dark'
        }`}
      >
        {hasUnread && <span className="absolute right-[9px] top-[8px] h-[7px] w-[7px] rounded-full bg-brand-alert" />}
        <Bell className={`h-[17px] w-[17px] ${hasUnread ? 'text-brand-alert' : 'text-brand-text-secondary dark:text-brand-text-muted'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-2xl border border-brand-border bg-brand-surface p-2 shadow-[0_1px_2px_rgba(33,29,63,0.05),0_10px_28px_rgba(33,29,63,0.06)] dark:border-brand-border-dark dark:bg-brand-surface-card-dark dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_28px_rgba(0,0,0,0.4)]">
          <p className="px-2 py-1.5 text-[13px] font-extrabold text-brand-text-dark dark:text-brand-text">Notificações</p>

          {tickets.length === 0 ? (
            <p className="px-2 py-3 text-[13.5px] text-brand-text-secondary dark:text-brand-text-muted">Nenhuma novidade por aqui.</p>
          ) : (
            <ul className="flex flex-col">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-xl px-2 py-2 hover:bg-brand-surface-alt dark:hover:bg-brand-surface-input-dark"
                  >
                    <p className="truncate text-[13.5px] font-bold text-brand-text-dark dark:text-brand-text">{ticket.title}</p>
                    <p className="text-xs text-brand-text-secondary dark:text-brand-text-muted">
                      #{ticket.id} · {formatTicketMeta(ticket.updated_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
