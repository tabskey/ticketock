import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Plus, Sun } from 'lucide-react'
import { HomeSidebar } from './HomeSidebar'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useTheme } from '../hooks/useTheme'

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const { data: user } = useCurrentUser()

  return (
    <div className="flex min-h-screen bg-brand-cream transition-colors dark:bg-brand-surface-dark">
      <HomeSidebar user={user} />

      <div className="mx-auto w-full max-w-[900px] px-10 pb-[60px] pt-[30px]">
        <div className="mb-6 flex items-center justify-end gap-3">
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-amber to-brand-amber-soft px-4 py-2 text-[13.5px] font-bold text-brand-ink shadow-[0_10px_22px_rgba(245,166,35,0.3)] transition hover:brightness-105"
          >
            <Plus className="h-[14px] w-[14px]" />
            Abrir chamado
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-brand-border bg-brand-surface dark:border-brand-border-dark dark:bg-brand-surface-card-dark"
          >
            {theme === 'dark' ? <Sun className="h-[17px] w-[17px] text-brand-text" /> : <Moon className="h-[17px] w-[17px] text-brand-text-dark" />}
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
