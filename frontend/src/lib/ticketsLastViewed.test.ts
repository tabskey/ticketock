import { beforeEach, describe, expect, it } from 'vitest'
import { getLastViewedAt, setLastViewedAt } from './ticketsLastViewed'

describe('ticketsLastViewed', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing was stored', () => {
    expect(getLastViewedAt(1)).toBeNull()
  })

  it('stores and retrieves a per-user last-viewed date', () => {
    const date = new Date('2024-05-01T10:00:00.000Z')
    setLastViewedAt(7, date)
    expect(getLastViewedAt(7)).toEqual(date)
  })

  it('keeps different users independent', () => {
    setLastViewedAt(1, new Date('2024-01-01T00:00:00.000Z'))
    expect(getLastViewedAt(2)).toBeNull()
  })

  it('returns null for corrupted stored values', () => {
    localStorage.setItem('tickettock-tickets-last-viewed:3', 'not-a-date')
    expect(getLastViewedAt(3)).toBeNull()
  })
})
