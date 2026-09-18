import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Layout({ children }: { children: ReactNode }) {
  const { auth, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut(): void {
    signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/tickets" className="text-lg font-semibold text-slate-900">
            Ticketock
          </Link>
          {auth && (
            <div className="flex items-center gap-4">
              <span className="text-sm capitalize text-slate-500">{auth.role}</span>
              <Link
                to="/tickets/new"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                New ticket
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
