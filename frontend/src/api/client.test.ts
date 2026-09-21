import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, setAuthToken } from './client'

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status,
      ok: status >= 200 && status < 300,
      json: () => Promise.resolve(body),
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

  it('sends a GET request with JSON headers and returns parsed data', async () => {
    mockFetchOnce(200, { id: 1 })

    const result = await apiRequest('/tickets/1')

    expect(result).toEqual({ id: 1 })
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('/api/tickets/1')
    expect(init.method).toBe('GET')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.headers.Authorization).toBeUndefined()
  })

  it('attaches the bearer token once set', async () => {
    setAuthToken('abc123')
    mockFetchOnce(200, {})

    await apiRequest('/tickets')

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer abc123')
  })

  it('serializes query params, skipping undefined values', async () => {
    mockFetchOnce(200, {})

    await apiRequest('/tickets', { query: { status: 'Open', page: 2, category: undefined } })

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toBe('/api/tickets?status=Open&page=2')
  })

  it('serializes the body for non-GET requests', async () => {
    mockFetchOnce(200, {})

    await apiRequest('/tickets', { method: 'POST', body: { title: 'Broken printer' } })

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.body).toBe(JSON.stringify({ title: 'Broken printer' }))
  })

  it('returns undefined for a 204 response without parsing the body', async () => {
    const json = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 204, ok: true, json }))

    const result = await apiRequest('/tickets/1/status', { method: 'PATCH' })

    expect(result).toBeUndefined()
    expect(json).not.toHaveBeenCalled()
  })

  it('throws an ApiError built from the error envelope on failure', async () => {
    mockFetchOnce(422, {
      error: { code: 'INVALID_STATUS_TRANSITION', message: "Cannot move from 'Open' to 'Closed'.", status: 422 },
    })

    await expect(apiRequest('/tickets/1/status', { method: 'PATCH' })).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION',
      status: 422,
      message: "Cannot move from 'Open' to 'Closed'.",
    })
  })

  it('ApiError is an instance of Error', () => {
    const error = new ApiError({ code: 'TICKET_NOT_FOUND', message: 'Not found', status: 404 })
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Not found')
  })
})
