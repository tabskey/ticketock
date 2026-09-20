import { useState } from 'react'
import { Moon, Plus, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HomeSidebar } from '../components/HomeSidebar'
import { ErrorMessage } from '../components/ErrorMessage'
import { NewTicketModal } from '../components/NewTicketModal'
import { NotificationsDropdown } from '../components/NotificationsDropdown'
import { TicketRow } from '../components/TicketRow'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useTickets } from '../hooks/useTickets'
import { useTheme } from '../hooks/useTheme'
import { useUnreadTickets } from '../hooks/useUnreadTickets'
import { getInitials } from '../lib/initials'
import { ERROR_CLASSES } from '../lib/brandUi'
import ticketTockHero from '../assets/item3_gato_notebook.png'

export function HomePage() {
  const { theme, toggleTheme } = useTheme()
  const { data: user } = useCurrentUser()
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false)
  const { data: tickets, isLoading, isError, error } = useTickets({
    page: 1,
    page_size: 4,
    sort_by: 'created_at',
    order: 'desc',
  })
  const { unreadTickets } = useUnreadTickets(user?.id, tickets?.items)

  return (
    <div className="flex min-h-screen bg-brand-cream transition-colors dark:bg-brand-surface-dark">
      <HomeSidebar user={user} />

      <div className="mx-auto w-full max-w-[900px] px-10 pb-[60px] pt-[30px]">
        <div className="mb-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-brand-border bg-brand-surface dark:border-brand-border-dark dark:bg-brand-surface-card-dark"
          >
            {theme === 'dark' ? <Sun className="h-[17px] w-[17px] text-brand-text" /> : <Moon className="h-[17px] w-[17px] text-brand-text-dark" />}
          </button>
          <NotificationsDropdown tickets={unreadTickets} />
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-amber to-brand-pink text-xs font-extrabold text-brand-ink">
            {user ? getInitials(user.name) : ''}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 rounded-[22px] border border-brand-border bg-brand-surface px-[34px] py-[30px] shadow-[0_1px_2px_rgba(33,29,63,0.05),0_10px_28px_rgba(33,29,63,0.06)] dark:border-brand-border-dark dark:bg-brand-surface-card-dark dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_28px_rgba(0,0,0,0.4)]">
          <div className="flex-1">
            <h1 className="mb-1.5 text-[26px] font-extrabold text-brand-text-dark dark:text-brand-text">
              {user ? `Oi, ${user.name}! 👋` : 'Oi! 👋'}
            </h1>
            <p className="mb-5 text-[15px] font-medium text-brand-text-secondary dark:text-brand-text-muted">O que aconteceu hoje?</p>
            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-amber to-brand-amber-soft px-5 py-3 text-[14.5px] font-bold text-brand-ink shadow-[0_10px_22px_rgba(245,166,35,0.3)] transition hover:brightness-105"
            >
              <Plus className="h-[15px] w-[15px]" />
              Abrir chamado
            </button>
          </div>

          <img
            src={ticketTockHero}
            alt="TicketTock mascot"
            className="hidden h-36 w-36 object-contain md:block"
          />
        </div>

        <div className="mb-3.5 mt-[30px] flex items-baseline justify-between px-0.5">
          <h2 className="text-[17px] font-extrabold text-brand-text-dark dark:text-brand-text">Seus chamados recentes</h2>
          <Link to="/tickets" className="text-[13.5px] font-bold text-brand-gold dark:text-brand-amber-soft">
            Ver todos →
          </Link>
        </div>

        {(() => {
          if (isLoading) {
            return (
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[70px] animate-pulse rounded-2xl border border-brand-border bg-brand-surface dark:border-brand-border-dark dark:bg-brand-surface-card-dark"
                  />
                ))}
              </div>
            )
          }

          if (isError) {
            return <ErrorMessage error={error} className={ERROR_CLASSES} />
          }

          if (tickets && tickets.items.length > 0) {
            return (
              <div className="flex flex-col gap-2.5">
                {tickets.items.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )
          }

          return (
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center dark:border-brand-border-dark dark:bg-brand-surface-card-dark">
              <p className="mb-4 text-[14.5px] text-brand-text-secondary dark:text-brand-text-muted">
                Você ainda não abriu nenhum chamado.
              </p>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-amber to-brand-amber-soft px-5 py-3 text-[14.5px] font-bold text-brand-ink shadow-[0_10px_22px_rgba(245,166,35,0.3)] transition hover:brightness-105"
              >
                <Plus className="h-[15px] w-[15px]" />
                Abrir chamado
              </button>
            </div>
          )
        })()}
      </div>

      {isNewTicketModalOpen && <NewTicketModal onClose={() => setIsNewTicketModalOpen(false)} />}
    </div>
  )
}
