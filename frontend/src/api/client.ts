const API_BASE = '/api'

export interface ApiErrorBody {
  code: string
  message: string
  status: number
}

export class ApiError extends Error {
  code: string
  status: number

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.code = body.code
    this.status = body.status
  }
}

let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

interface RequestOptions {
  method?: string
  body?: unknown
  query?: Record<string, string | number | undefined>
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }
  return `${url.pathname}${url.search}`
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 204) return undefined as T

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.error)
  }

  return data as T
}
