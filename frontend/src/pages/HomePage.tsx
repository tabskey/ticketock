import type { SVGProps } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HomeSidebar } from '../components/HomeSidebar'
import { ErrorMessage } from '../components/ErrorMessage'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useTickets } from '../hooks/useTickets'
import { useTheme } from '../hooks/useTheme'
import { getInitials } from '../lib/initials'
import ticketTockHero from '../assets/item3_gato_notebook.png'
import { CATEGORY_BADGE_CLASS, CATEGORY_LABEL_PT, PRIORITY_STYLE_PT, STATUS_STYLE_PT, formatTicketMeta } from './homeBadges'

function iconProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }
}

function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps({ strokeWidth: 3, ...props })}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function HomePage() {
  const { theme, toggleTheme } = useTheme()
  const { data: user } = useCurrentUser()
  const { data: tickets, isLoading, isError, error } = useTickets({
    page: 1,
    page_size: 4,
    sort_by: 'created_at',
    order: 'desc',
  })

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
          <span className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-brand-border bg-brand-surface dark:border-brand-border-dark dark:bg-brand-surface-card-dark">
            <span className="absolute right-[9px] top-[8px] h-[7px] w-[7px] rounded-full bg-brand-alert" />
            <BellIcon className="h-[17px] w-[17px] text-brand-text-secondary dark:text-brand-text-muted" />
          </span>
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
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-amber to-brand-amber-soft px-5 py-3 text-[14.5px] font-bold text-brand-ink shadow-[0_10px_22px_rgba(245,166,35,0.3)] transition hover:brightness-105"
            >
              <PlusIcon className="h-[15px] w-[15px]" />
              Abrir chamado
            </Link>
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

        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[70px] animate-pulse rounded-2xl border border-brand-border bg-brand-surface dark:border-brand-border-dark dark:bg-brand-surface-card-dark"
              />
            ))}
          </div>
        ) : isError ? (
          <ErrorMessage error={error} />
        ) : tickets && tickets.items.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {tickets.items.map((ticket) => {
              const priority = PRIORITY_STYLE_PT[ticket.priority]
              const status = STATUS_STYLE_PT[ticket.status]
              return (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-[0_1px_2px_rgba(33,29,63,0.05),0_10px_28px_rgba(33,29,63,0.06)] transition hover:-translate-y-px dark:border-brand-border-dark dark:bg-brand-surface-card-dark dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_28px_rgba(0,0,0,0.4)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 truncate text-[14.5px] font-extrabold text-brand-text-dark dark:text-brand-text">
                      {ticket.title}
                    </div>
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center rounded-[7px] px-2.5 py-0.5 text-[11.5px] font-semibold ${CATEGORY_BADGE_CLASS}`}>
                        {CATEGORY_LABEL_PT[ticket.category]}
                      </span>
                      <span className={`inline-flex items-center rounded-[7px] px-2.5 py-0.5 text-[11.5px] font-semibold ${priority.className}`}>
                        {priority.label}
                      </span>
                    </div>
                    <div className="text-xs text-brand-text-secondary dark:text-brand-text-muted">
                      #{ticket.id} · {formatTicketMeta(ticket.created_at)}
                    </div>
                  </div>
                  <span className={`flex-none whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 flex-none text-brand-text-secondary dark:text-brand-text-muted" />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center dark:border-brand-border-dark dark:bg-brand-surface-card-dark">
            <p className="mb-4 text-[14.5px] text-brand-text-secondary dark:text-brand-text-muted">
              Você ainda não abriu nenhum chamado.
            </p>
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-amber to-brand-amber-soft px-5 py-3 text-[14.5px] font-bold text-brand-ink shadow-[0_10px_22px_rgba(245,166,35,0.3)] transition hover:brightness-105"
            >
              <PlusIcon className="h-[15px] w-[15px]" />
              Abrir chamado
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
