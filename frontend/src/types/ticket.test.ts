import { describe, expect, it } from 'vitest'
import { nextStatus } from './ticket'

describe('nextStatus', () => {
  it('advances Open to In Progress', () => {
    expect(nextStatus('Open')).toBe('In Progress')
  })

  it('advances In Progress to Resolved', () => {
    expect(nextStatus('In Progress')).toBe('Resolved')
  })

  it('advances Resolved to Closed', () => {
    expect(nextStatus('Resolved')).toBe('Closed')
  })

  it('returns null for Closed, the final status', () => {
    expect(nextStatus('Closed')).toBeNull()
  })
})
