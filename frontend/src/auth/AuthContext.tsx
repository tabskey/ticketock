import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setAuthHandlers, setAuthToken } from '../api/client'
import { logout, refreshSession } from '../api/auth'
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
  const authRef = useRef<AuthState | null>(auth)
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null)

  useEffect(() => {
    authRef.current = auth
  }, [auth])

  // Applies a freshly issued token pair without touching the query cache.
  // Used both by real sign-in and by the silent/reactive refresh paths, so a
  // routine token rotation must never invalidate the whole React Query cache.
  const applyTokens = useCallback((state: AuthState): void => {
    setAuthToken(state.token)
    persistAuth(state, rememberMeRef.current)
    setAuth(state)
  }, [])

  const signIn = useCallback(
    (state: SignInInput): void => {
      const { rememberMe = false, ...tokens } = state
      rememberMeRef.current = rememberMe
      queryClient.clear()
      applyTokens(tokens)
    },
    [applyTokens, queryClient],
  )

  const signOut = useCallback((): void => {
    const refreshToken = authRef.current?.refreshToken
    if (refreshToken) {
      void logout(refreshToken).catch(() => undefined)
    }
    setAuthToken(null)
    clearStoredAuth()
    queryClient.clear()
    setAuth(null)
  }, [queryClient])

  // Single-flight refresh: the proactive expiry timer and the reactive 401
  // handler can both want a new token at the same time. Because the refresh
  // token is single-use (rotated and revoked server-side), two concurrent
  // refreshes with the same token would make one of them fail and log the
  // user out. Sharing one in-flight promise prevents that race.
  const refreshTokens = useCallback((): Promise<string | null> => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current

    const inFlight = (async () => {
      const current = authRef.current
      if (!current) return null
      try {
        const response = await refreshSession(current.refreshToken)
        applyTokens({
          token: response.access_token,
          refreshToken: response.refresh_token,
          role: response.role,
        })
        return response.access_token
      } catch {
        return null
      }
    })()

    refreshInFlightRef.current = inFlight
    void inFlight.finally(() => {
      refreshInFlightRef.current = null
    })
    return inFlight
  }, [applyTokens])

  useEffect(() => {
    setAuthHandlers({
      refresh: refreshTokens,
      onUnauthorized: signOut,
    })

    return () => setAuthHandlers(null)
  }, [refreshTokens, signOut])

  // Silently refreshes the access token shortly before it expires, so a
  // session survives past the (short) access-token TTL without the user
  // needing to log in again. Persistence (localStorage vs sessionStorage)
  // follows whatever "remember me" was chosen at sign-in.
  useEffect(() => {
    if (!auth) return undefined

    const expiresAt = getTokenExpiryMs(auth.token)
    if (expiresAt === null) return undefined

    const delay = Math.max(expiresAt - Date.now() - REFRESH_BUFFER_MS, 0)
    const timer = setTimeout(() => {
      void refreshTokens().then((token) => {
        if (!token) signOut()
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [auth, refreshTokens, signOut])

  return <AuthContext.Provider value={{ auth, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
