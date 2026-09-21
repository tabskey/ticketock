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

interface AuthHandlers {
  refresh: () => Promise<string | null>
  onUnauthorized: () => void
}

let authToken: string | null = null
let authHandlers: AuthHandlers | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function setAuthHandlers(handlers: AuthHandlers | null): void {
  authHandlers = handlers
}

interface RequestOptions {
  method?: string
  body?: unknown
  query?: Record<string, string | number | undefined>
  skipAuthRetry?: boolean
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

async function sendRequest(path: string, options: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  return fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
}

function fallbackError(response: Response): ApiError {
  return new ApiError({
    code: response.status === 401 ? 'UNAUTHORIZED' : 'HTTP_ERROR',
    message: 'The server returned an unexpected response.',
    status: response.status,
  })
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw fallbackError(response)
  }

  if (!response.ok) {
    const body = payload as { error?: ApiErrorBody }
    throw body.error ? new ApiError(body.error) : fallbackError(response)
  }

  return payload as T
}

async function recoverFromUnauthorized(
  path: string,
  options: RequestOptions,
  response: Response,
): Promise<Response> {
  let refreshedToken: string | null = null
  try {
    refreshedToken = await authHandlers!.refresh()
  } catch {
    refreshedToken = null
  }

  if (refreshedToken) {
    setAuthToken(refreshedToken)
    response = await sendRequest(path, options)
  }

  if (response.status === 401) {
    authHandlers!.onUnauthorized()
  }

  return response
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await sendRequest(path, options)

  if (response.status === 401 && authHandlers && !options.skipAuthRetry) {
    response = await recoverFromUnauthorized(path, options, response)
  }

  return parseResponse<T>(response)
}
