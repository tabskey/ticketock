import { describe, expect, it } from 'vitest'
import { getTokenExpiryMs } from './jwt'

function makeToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('getTokenExpiryMs', () => {
  it('extracts the exp claim in milliseconds', () => {
    const token = makeToken({ exp: 1700000000 })
    expect(getTokenExpiryMs(token)).toBe(1700000000 * 1000)
  })

  it('handles base64url-encoded payloads', () => {
    const token = makeToken({ exp: 1700000000, sub: 'user>>??' }).replace(/\+/g, '-').replace(/\//g, '_')
    expect(getTokenExpiryMs(token)).toBe(1700000000 * 1000)
  })

  it('returns null when exp is missing', () => {
    const token = makeToken({ sub: 'user' })
    expect(getTokenExpiryMs(token)).toBeNull()
  })

  it('returns null for a malformed token', () => {
    expect(getTokenExpiryMs('not-a-jwt')).toBeNull()
  })
})
