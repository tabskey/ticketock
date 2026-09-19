import { NavLink } from 'react-router-dom'
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
  const roleLabel = user ? ROLE_LABEL_PT[user.role] : ''

  return (
    <div className="sticky top-0 flex h-screen w-[230px] shrink-0 flex-col bg-brand-purple px-[18px] py-[26px] dark:bg-brand-purple-dark">
      <div className="flex items-center gap-2.5 px-1.5 pb-7 text-[19px] font-extrabold text-brand-text">
        <img
          src="https://placehold.co/32x32/f5a623/1a1730?text=TT"
          alt="TicketTock logo"
          className="h-8 w-8 flex-none rounded-[9px] object-cover"
        />
        TicketTock
      </div>

      <NavLink to="/" end className={({ isActive }) => `${navItemClass(isActive)} mb-1.5`}>
        <img
          src="https://placehold.co/18x18/b7b2d6/211d3f?text=H"
          alt="Início"
          className="h-[18px] w-[18px] flex-none rounded-sm object-cover"
        />
        Início
      </NavLink>
      <NavLink to="/tickets" className={({ isActive }) => navItemClass(isActive)}>
        <img
          src="https://placehold.co/18x18/b7b2d6/211d3f?text=T"
          alt="Meus tickets"
          className="h-[18px] w-[18px] flex-none rounded-sm object-cover"
        />
        Meus tickets
      </NavLink>

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.08] px-1.5 pt-3">
        <img
          src="https://placehold.co/36x36/ff7e9d/f1eff8?text=U"
          alt={user?.name ?? 'User avatar'}
          className="h-9 w-9 flex-none rounded-full object-cover"
        />
        <div className="min-w-0">
          <div className="truncate text-[13.5px] font-extrabold text-brand-text">{user?.name ?? ''}</div>
          <div className="text-xs text-brand-text-soft dark:text-brand-text-muted">{roleLabel}</div>
        </div>
      </div>
    </div>
  )
}
