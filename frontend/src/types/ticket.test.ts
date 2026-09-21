import { describe, expect, it } from 'vitest'
import { nextStatus } from './ticket'

describe('nextStatus', () => {
  it('advances through the workflow one step at a time', () => {
    expect(nextStatus('Open')).toBe('In Progress')
    expect(nextStatus('In Progress')).toBe('Resolved')
    expect(nextStatus('Resolved')).toBe('Closed')
  })

  it('returns null once the ticket is Closed', () => {
    expect(nextStatus('Closed')).toBeNull()
  })
})
