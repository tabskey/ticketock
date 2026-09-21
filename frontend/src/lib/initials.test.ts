import { describe, expect, it } from 'vitest'
import { getInitials } from './initials'

describe('getInitials', () => {
  it('returns first and last initials for a full name', () => {
    expect(getInitials('Ana Silva')).toBe('AS')
  })

  it('uppercases initials', () => {
    expect(getInitials('ana silva')).toBe('AS')
  })

  it('returns a single initial for a one-word name', () => {
    expect(getInitials('Ana')).toBe('A')
  })

  it('collapses extra whitespace between names', () => {
    expect(getInitials('  Ana   Maria   Silva  ')).toBe('AS')
  })

  it('returns an empty string for blank input', () => {
    expect(getInitials('   ')).toBe('')
    expect(getInitials('')).toBe('')
  })
})
