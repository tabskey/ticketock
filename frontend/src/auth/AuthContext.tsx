import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setAuthToken } from '../api/client'
import type { UserRole } from '../types/auth'

interface AuthState {
  token: string
  role: UserRole
}

interface AuthContextValue {
  auth: AuthState | null
  signIn: (state: AuthState) => void
  signOut: () => void
}

const STORAGE_KEY = 'ticketock.auth'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredAuth(): AuthState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthState
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = readStoredAuth()
    setAuthToken(stored?.token ?? null)
    return stored
  })

  function signIn(state: AuthState): void {
    setAuthToken(state.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    queryClient.clear()
    setAuth(state)
  }

  function signOut(): void {
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
    queryClient.clear()
    setAuth(null)
  }

  return <AuthContext.Provider value={{ auth, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
