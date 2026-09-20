import { ApiError } from '../api/client'

export function ErrorMessage({ error, className }: { error: unknown; className?: string }) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'

  return <div className={className ?? 'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'}>{message}</div>
}
