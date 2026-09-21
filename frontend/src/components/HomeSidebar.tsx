import { Cat } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ticketTockLogoMini from '../assets/item7_rosto_brilho.png'
import ticketTockTicket from '../assets/item8_bilhete.png'
import ticketTockIconHome from '../assets/item5_rosto_piscando.png'
import type { CurrentUser } from '../types/user'

const ROLE_LABEL_PT: Record<CurrentUser['role'], string> = {
  employee: 'Funcionário',
  support: 'Suporte',
}

function navItemClass(isActive: boolean): string {
  const base = 'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-bold transition-colors'
  return isActive
    ? `${base} bg-brand-amber text-brand-ink`
    : `${base} text-brand-text-soft hover:bg-white/[0.06] dark:text-brand-text-muted`
}

export function HomeSidebar({ user }: { user: CurrentUser | undefined }) {
  const navigate = useNavigate()
  
  const { signOut } = useAuth()
  const roleLabel = user ? ROLE_LABEL_PT[user.role] : ''

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex w-full shrink-0 flex-col gap-3 bg-brand-purple px-[18px] py-4 md:sticky md:top-0 md:h-screen md:w-[230px] md:gap-0 md:py-[26px] dark:bg-brand-purple-dark">
      <div className="flex items-center gap-2.5 pb-3 text-[19px] font-extrabold text-brand-text md:px-1.5 md:pb-7">
        <img
          src={ticketTockLogoMini}
          alt="TicketTock logo"
          className="h-18 w-18 flex-none rounded-[9px] object-contain"
        />
        TicketTock
      </div>

      <nav className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch md:gap-0">
        <NavLink to="/" end className={({ isActive }) => `${navItemClass(isActive)} md:mb-1.5`}>
        <img
          src={ticketTockIconHome}
          alt="Início"
          className="h-10 w-10 flex-none rounded-[9px] object-contain"
        />
        Início
      </NavLink>
      <NavLink to="/tickets" className={({ isActive }) => navItemClass(isActive)}>
        <img
          src={ticketTockTicket}
          alt="Meus tickets"
          className="h-10 w-10 flex-none rounded-[9px] object-contain"
        />
        Meus tickets
      </NavLink>

      </nav>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-3 md:mt-auto md:flex-col md:items-stretch md:gap-3 md:px-1.5">
        <div className="flex items-center gap-2.5">
          <div
            aria-label={user?.name ?? 'User avatar'}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#ff7e9d] text-[#f1eff8]"
          >
            <Cat className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-extrabold text-brand-text">{user?.name ?? ''}</div>
            <div className="text-xs text-brand-text-soft dark:text-brand-text-muted">{roleLabel}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] font-bold text-brand-text transition hover:bg-white/10"
        >
          <span aria-label="Logout" className="text-sm leading-none">
            👋
          </span>
          Logout
        </button>
      </div>
    </div>
  )
}
