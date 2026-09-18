import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import { setAuthToken } from '../api/client'

vi.mock('../api/client', () => ({
  setAuthToken: vi.fn(),
}))

const STORAGE_KEY = 'ticketock.auth'

function renderAuth(queryClient = new QueryClient()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
  return { ...renderHook(() => useAuth(), { wrapper }), queryClient }
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts signed out when nothing is stored', () => {
    const { result } = renderAuth()
    expect(result.current.auth).toBeNull()
    expect(setAuthToken).toHaveBeenCalledWith(null)
  })

  it('restores a previously signed-in session from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: 'stored-token', role: 'support' }))

    const { result } = renderAuth()

    expect(result.current.auth).toEqual({ token: 'stored-token', role: 'support' })
    expect(setAuthToken).toHaveBeenCalledWith('stored-token')
  })

  it('signIn persists the session, sets the token, and clears the query cache', () => {
    const queryClient = new QueryClient()
    const clearSpy = vi.spyOn(queryClient, 'clear')
    const { result } = renderAuth(queryClient)

    act(() => {
      result.current.signIn({ token: 'new-token', role: 'employee' })
    })

    expect(result.current.auth).toEqual({ token: 'new-token', role: 'employee' })
    expect(setAuthToken).toHaveBeenCalledWith('new-token')
    expect(clearSpy).toHaveBeenCalled()
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ token: 'new-token', role: 'employee' })
  })

  it('signOut clears the session, the token, and the query cache', () => {
    const queryClient = new QueryClient()
    const clearSpy = vi.spyOn(queryClient, 'clear')
    const { result } = renderAuth(queryClient)

    act(() => {
      result.current.signIn({ token: 'new-token', role: 'employee' })
    })
    act(() => {
      result.current.signOut()
    })

    expect(result.current.auth).toBeNull()
    expect(setAuthToken).toHaveBeenLastCalledWith(null)
    expect(clearSpy).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('throws when used outside of an AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider')
  })
})
