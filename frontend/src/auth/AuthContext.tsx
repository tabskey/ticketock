import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setAuthToken } from '../api/client'
import { refreshSession } from '../api/auth'
import { getTokenExpiryMs } from './jwt'
import type { UserRole } from '../types/auth'

interface AuthState {
  token: string
  refreshToken: string
  role: UserRole
}

interface SignInInput extends AuthState {
  rememberMe?: boolean
}

interface AuthContextValue {
  auth: AuthState | null
  signIn: (state: SignInInput) => void
  signOut: () => void
}

const STORAGE_KEY = 'ticketock.auth'
const REFRESH_BUFFER_MS = 30_000

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredAuth(): AuthState | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthState
  } catch {
    return null
  }
}

function persistAuth(state: AuthState, rememberMe: boolean): void {
  const raw = JSON.stringify(state)
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, raw)
    sessionStorage.removeItem(STORAGE_KEY)
  } else {
    sessionStorage.setItem(STORAGE_KEY, raw)
    localStorage.removeItem(STORAGE_KEY)
  }
}

function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = readStoredAuth()
    setAuthToken(stored?.token ?? null)
    return stored
  })
  const rememberMeRef = useRef(Boolean(localStorage.getItem(STORAGE_KEY)))

  function signIn(state: SignInInput): void {
    const { rememberMe = false, ...tokens } = state
    rememberMeRef.current = rememberMe
    setAuthToken(tokens.token)
    persistAuth(tokens, rememberMe)
    queryClient.clear()
    setAuth(tokens)
  }

  function signOut(): void {
    setAuthToken(null)
    clearStoredAuth()
    queryClient.clear()
    setAuth(null)
  }

  // Silently refreshes the access token shortly before it expires, so a
  // session survives past the (short) access-token TTL without the user
  // needing to log in again. Persistence (localStorage vs sessionStorage)
  // follows whatever "remember me" was chosen at sign-in.
  useEffect(() => {
    if (!auth) return undefined

    const expiresAt = getTokenExpiryMs(auth.token)
    if (expiresAt === null) return undefined

    const delay = Math.max(expiresAt - Date.now() - REFRESH_BUFFER_MS, 0)
    const timer = setTimeout(async () => {
      try {
        const response = await refreshSession(auth.refreshToken)
        signIn({
          token: response.access_token,
          refreshToken: response.refresh_token,
          role: response.role,
          rememberMe: rememberMeRef.current,
        })
      } catch {
        signOut()
      }
    }, delay)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token])

  return <AuthContext.Provider value={{ auth, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
