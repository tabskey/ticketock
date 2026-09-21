import { describe, expect, it } from 'vitest'
import { formatTicketMeta } from './ticketBadges'

describe('formatTicketMeta', () => {
  it('formats an ISO date into day, PT-BR month abbreviation and HH:mm', () => {
    const iso = new Date(2024, 2, 5, 9, 5).toISOString()
    expect(formatTicketMeta(iso)).toBe('5 mar, 09:05')
  })

  it('pads single-digit hours and minutes', () => {
    const iso = new Date(2024, 11, 25, 1, 2).toISOString()
    expect(formatTicketMeta(iso)).toBe('25 dez, 01:02')
  })
})
