import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, setAuthToken } from './client'

function mockFetchOnce(response: { status: number; body: unknown }): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
      json: () => Promise.resolve(response.body),
    }),
  )
}

describe('apiRequest', () => {
  beforeEach(() => {
    setAuthToken(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends a GET request without an Authorization header when no token is set', async () => {
    mockFetchOnce({ status: 200, body: { ok: true } })

    const result = await apiRequest<{ ok: boolean }>('/health')

    expect(result).toEqual({ ok: true })
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.headers.Authorization).toBeUndefined()
    expect(init.method).toBe('GET')
  })

  it('attaches a Bearer token once one is set', async () => {
    setAuthToken('secret-token')
    mockFetchOnce({ status: 200, body: { ok: true } })

    await apiRequest('/tickets')

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer secret-token')
  })

  it('serializes query params, skipping undefined values', async () => {
    mockFetchOnce({ status: 200, body: { ok: true } })

    await apiRequest('/tickets', { query: { status: 'Open', category: undefined, page: 2 } })

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('/api/tickets?status=Open&page=2')
  })

  it('sends a JSON body for mutating requests', async () => {
    mockFetchOnce({ status: 201, body: { id: 1 } })

    await apiRequest('/tickets', { method: 'POST', body: { title: 'Broken printer' } })

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ title: 'Broken printer' }))
  })

  it('returns undefined for a 204 No Content response', async () => {
    mockFetchOnce({ status: 204, body: null })

    const result = await apiRequest('/tickets/1')

    expect(result).toBeUndefined()
  })

  it('throws an ApiError built from the error envelope on failure', async () => {
    mockFetchOnce({
      status: 422,
      body: { error: { code: 'INVALID_STATUS_TRANSITION', message: "Cannot move from 'Open' to 'Closed'.", status: 422 } },
    })

    await expect(apiRequest('/tickets/1/status', { method: 'PATCH' })).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
      status: 422,
      message: "Cannot move from 'Open' to 'Closed'.",
    })
  })

  it('produces an instance of ApiError, not a generic Error', async () => {
    mockFetchOnce({
      status: 404,
      body: { error: { code: 'TICKET_NOT_FOUND', message: 'Ticket 1 not found.', status: 404 } },
    })

    await expect(apiRequest('/tickets/1')).rejects.toBeInstanceOf(ApiError)
  })
})
