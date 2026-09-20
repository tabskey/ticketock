const STORAGE_KEY = 'tickettock-tickets-last-viewed'

function storageKey(userId: number): string {
  return `${STORAGE_KEY}:${userId}`
}

export function getLastViewedAt(userId: number): Date | null {
  const raw = localStorage.getItem(storageKey(userId))
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

export function setLastViewedAt(userId: number, date: Date): void {
  localStorage.setItem(storageKey(userId), date.toISOString())
}
