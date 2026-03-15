import { describe, expect, it } from 'vitest'
import {
  err,
  flatMap,
  fromThrowable,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  unwrap,
  unwrapOr,
} from './result.js'

describe('Result', () => {
  describe('ok / err', () => {
    it('creates a success result', () => {
      const result = ok(42)
      expect(result.ok).toBe(true)
      expect(result.value).toBe(42)
    })

    it('creates a failure result', () => {
      const result = err('oops')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('oops')
    })
  })

  describe('isOk / isErr', () => {
    it('narrows to success', () => {
      const result = ok('hello')
      if (isOk(result)) {
        expect(result.value).toBe('hello')
      } else {
        throw new Error('Expected ok')
      }
    })

    it('narrows to failure', () => {
      const result = err(new Error('fail'))
      if (isErr(result)) {
        expect(result.error.message).toBe('fail')
      } else {
        throw new Error('Expected err')
      }
    })

    it('isOk returns false for err', () => {
      expect(isOk(err('x'))).toBe(false)
    })

    it('isErr returns false for ok', () => {
      expect(isErr(ok(1))).toBe(false)
    })
  })

  describe('map', () => {
    it('transforms the value of ok', () => {
      const result = map(ok(5), (n) => n * 2)
      expect(result).toEqual(ok(10))
    })

    it('passes through err unchanged', () => {
      const result = map(err('bad'), (n: number) => n * 2)
      expect(result).toEqual(err('bad'))
    })
  })

  describe('mapErr', () => {
    it('transforms the error of err', () => {
      const result = mapErr(err('bad'), (e) => `Error: ${e}`)
      expect(result).toEqual(err('Error: bad'))
    })

    it('passes through ok unchanged', () => {
      const result = mapErr(ok(42), (e: string) => `Error: ${e}`)
      expect(result).toEqual(ok(42))
    })
  })

  describe('unwrap', () => {
    it('returns the value of ok', () => {
      expect(unwrap(ok('data'))).toBe('data')
    })

    it('throws on err with Error', () => {
      const error = new Error('boom')
      expect(() => unwrap(err(error))).toThrow('boom')
    })

    it('throws on err with string', () => {
      expect(() => unwrap(err('boom'))).toThrow('boom')
    })
  })

  describe('unwrapOr', () => {
    it('returns the value of ok', () => {
      expect(unwrapOr(ok(42), 0)).toBe(42)
    })

    it('returns the fallback for err', () => {
      expect(unwrapOr(err('oops'), 0)).toBe(0)
    })
  })

  describe('flatMap', () => {
    it('chains successful results', () => {
      const parse = (s: string) => {
        const n = Number(s)
        return Number.isNaN(n) ? err('NaN' as const) : ok(n)
      }
      const result = flatMap(ok('42'), parse)
      expect(result).toEqual(ok(42))
    })

    it('short-circuits on first error', () => {
      const parse = (s: string) => {
        const n = Number(s)
        return Number.isNaN(n) ? err('NaN' as const) : ok(n)
      }
      const result = flatMap(err('initial' as const), parse)
      expect(result).toEqual(err('initial'))
    })
  })

  describe('fromThrowable', () => {
    it('wraps a successful function in ok', () => {
      const result = fromThrowable(() => JSON.parse('{"a":1}'))
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual({ a: 1 })
      }
    })

    it('wraps a throwing function in err', () => {
      const result = fromThrowable(() => JSON.parse('invalid'))
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error)
      }
    })

    it('wraps non-Error throws in Error', () => {
      const result = fromThrowable(() => {
        throw 'string error'
      })
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error)
        expect(result.error.message).toBe('string error')
      }
    })
  })
})
