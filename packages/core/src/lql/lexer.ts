import { LQLParseError } from './ast.js'

// ── Token types ───────────────────────────────────────────────────────────────

export type TokenType =
  | 'IDENT' // field name or keyword
  | 'STRING' // 'hello' or "hello"
  | 'NUMBER' // 42 or 3.14
  | 'BOOL' // true / false
  | 'NULL' // null
  | 'VARIABLE' // {this}
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'IN'
  | 'EQ' // =
  | 'NEQ' // !=
  | 'LT' // <
  | 'GT' // >
  | 'LTE' // <=
  | 'GTE' // >=
  | 'LPAREN' // (
  | 'RPAREN' // )
  | 'LBRACKET' // [
  | 'RBRACKET' // ]
  | 'COMMA' // ,
  | 'LBRACE' // {
  | 'RBRACE' // }
  | 'EOF'

export interface Token {
  readonly type: TokenType
  readonly raw: string
  readonly pos: number
  readonly value?: string | number | boolean
}

// ── Keyword map ───────────────────────────────────────────────────────────────

const KEYWORDS: Record<string, TokenType> = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  CONTAINS: 'CONTAINS',
  NOT_CONTAINS: 'NOT_CONTAINS',
  IN: 'IN',
  true: 'BOOL',
  false: 'BOOL',
  null: 'NULL',
}

// ── Lexer ─────────────────────────────────────────────────────────────────────

export function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let pos = 0

  function peek(offset = 0): string {
    return input[pos + offset] ?? ''
  }

  function advance(): string {
    return input[pos++] ?? ''
  }

  function skipWhitespace(): void {
    while (pos < input.length && /\s/.test(input[pos] ?? '')) pos++
  }

  function readString(quote: string): Token {
    const start = pos - 1 // opening quote already consumed
    let value = ''
    while (pos < input.length) {
      const ch = advance()
      if (ch === quote) break
      if (ch === '\\') {
        // simple escape sequences
        const esc = advance()
        value += esc === 'n' ? '\n' : esc === 't' ? '\t' : esc
      } else {
        value += ch
      }
    }
    return { type: 'STRING', raw: input.slice(start, pos), pos: start, value }
  }

  function readNumber(): Token {
    const start = pos - 1
    while (pos < input.length && /[0-9.]/.test(input[pos] ?? '')) pos++
    const raw = input.slice(start, pos)
    return { type: 'NUMBER', raw, pos: start, value: Number(raw) }
  }

  function readIdentOrKeyword(): Token {
    const start = pos - 1
    while (pos < input.length && /[a-zA-Z0-9_]/.test(input[pos] ?? '')) pos++
    const raw = input.slice(start, pos)
    const upper = raw.toUpperCase()
    const kwType = KEYWORDS[raw] ?? KEYWORDS[upper]
    if (kwType === 'BOOL') {
      return { type: 'BOOL', raw, pos: start, value: raw === 'true' }
    }
    if (kwType === 'NULL') {
      return { type: 'NULL', raw, pos: start }
    }
    if (kwType) {
      return { type: kwType as TokenType, raw, pos: start }
    }
    return { type: 'IDENT', raw, pos: start }
  }

  function readVariable(): Token {
    // '{' already consumed
    const start = pos - 1
    let name = ''
    while (pos < input.length && input[pos] !== undefined && input[pos] !== '}') {
      name += advance()
    }
    if (pos >= input.length) throw new LQLParseError("Unterminated variable '{...}'", start)
    advance() // consume '}'
    return { type: 'VARIABLE', raw: input.slice(start, pos), pos: start, value: name.trim() }
  }

  while (pos < input.length) {
    skipWhitespace()
    if (pos >= input.length) break

    const start = pos
    const ch = advance()

    if (ch === "'" || ch === '"') {
      tokens.push(readString(ch))
    } else if (ch >= '0' && ch <= '9') {
      tokens.push(readNumber())
    } else if (/[a-zA-Z_]/.test(ch)) {
      tokens.push(readIdentOrKeyword())
    } else if (ch === '{') {
      tokens.push(readVariable())
    } else if (ch === '=') {
      tokens.push({ type: 'EQ', raw: '=', pos: start })
    } else if (ch === '!' && peek() === '=') {
      advance()
      tokens.push({ type: 'NEQ', raw: '!=', pos: start })
    } else if (ch === '<' && peek() === '=') {
      advance()
      tokens.push({ type: 'LTE', raw: '<=', pos: start })
    } else if (ch === '<') {
      tokens.push({ type: 'LT', raw: '<', pos: start })
    } else if (ch === '>' && peek() === '=') {
      advance()
      tokens.push({ type: 'GTE', raw: '>=', pos: start })
    } else if (ch === '>') {
      tokens.push({ type: 'GT', raw: '>', pos: start })
    } else if (ch === '(') {
      tokens.push({ type: 'LPAREN', raw: '(', pos: start })
    } else if (ch === ')') {
      tokens.push({ type: 'RPAREN', raw: ')', pos: start })
    } else if (ch === '[') {
      tokens.push({ type: 'LBRACKET', raw: '[', pos: start })
    } else if (ch === ']') {
      tokens.push({ type: 'RBRACKET', raw: ']', pos: start })
    } else if (ch === ',') {
      tokens.push({ type: 'COMMA', raw: ',', pos: start })
    } else {
      throw new LQLParseError(`Unexpected character '${ch}'`, start)
    }
  }

  tokens.push({ type: 'EOF', raw: '', pos: input.length })
  return tokens
}
