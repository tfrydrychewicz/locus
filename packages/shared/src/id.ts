export type ULID = string & { readonly __brand: 'ULID' }

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const ENCODING_LEN = ENCODING.length
const TIME_LEN = 10
const RANDOM_LEN = 16

function encodeTime(now: number, len: number): string {
  let str = ''
  let remaining = now
  for (let i = len; i > 0; i--) {
    const mod = remaining % ENCODING_LEN
    str = ENCODING[mod] + str
    remaining = (remaining - mod) / ENCODING_LEN
  }
  return str
}

function encodeRandom(len: number): string {
  let str = ''
  const randomValues = new Uint8Array(len)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < len; i++) {
    const value = randomValues[i]
    if (value !== undefined) {
      str += ENCODING[value % ENCODING_LEN]
    }
  }
  return str
}

export function generateId(): ULID {
  const time = encodeTime(Date.now(), TIME_LEN)
  const random = encodeRandom(RANDOM_LEN)
  return (time + random) as ULID
}
