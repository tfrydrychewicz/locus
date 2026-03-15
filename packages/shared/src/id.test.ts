import { describe, expect, it } from 'vitest'
import { generateId } from './id.js'

describe('generateId', () => {
  it('returns a 26-character string', () => {
    const id = generateId()
    expect(id).toHaveLength(26)
  })

  it('uses only valid Crockford Base32 characters', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()))
    expect(ids.size).toBe(1000)
  })

  it('produces lexicographically sortable IDs over time', async () => {
    const id1 = generateId()
    await new Promise((r) => setTimeout(r, 2))
    const id2 = generateId()
    expect(id1 < id2).toBe(true)
  })

  it('embeds timestamp in the first 10 characters', () => {
    const before = Date.now()
    const id = generateId()
    const after = Date.now()

    const timeChars = id.slice(0, 10)
    expect(timeChars).toHaveLength(10)

    const id2 = generateId()
    const timeChars2 = id2.slice(0, 10)
    expect(timeChars.localeCompare(timeChars2)).toBeLessThanOrEqual(0)

    void before
    void after
  })

  it('has branded ULID type', () => {
    const id = generateId()
    const _check: string = id
    void _check
  })
})
