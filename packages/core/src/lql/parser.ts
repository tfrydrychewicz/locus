import {
  type ArrayLiteral,
  type BooleanLiteral,
  type ComparisonExpr,
  type ComparisonOp,
  type LQLExpr,
  LQLParseError,
  type LQLQuery,
  type LQLValue,
  type NullLiteral,
  type NumberLiteral,
  type StringLiteral,
  type Variable,
} from './ast.js'
import { type Token, type TokenType, tokenize } from './lexer.js'

// ── Parser ────────────────────────────────────────────────────────────────────

class Parser {
  private tokens: Token[]
  private pos = 0

  constructor(input: string) {
    this.tokens = tokenize(input)
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? { type: 'EOF', raw: '', pos: -1 }
  }

  private advance(): Token {
    const token = this.tokens[this.pos] ?? { type: 'EOF', raw: '', pos: -1 }
    this.pos++
    return token
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type
  }

  private eat(type: TokenType): Token {
    const token = this.peek()
    if (token.type !== type) {
      throw new LQLParseError(`Expected ${type} but got ${token.type} ('${token.raw}')`, token.pos)
    }
    return this.advance()
  }

  // ── Grammar rules ─────────────────────────────────────────────────────────

  private parseValue(): LQLValue {
    const token = this.peek()

    if (token.type === 'STRING') {
      this.advance()
      return { kind: 'string', value: String(token.value ?? '') } satisfies StringLiteral
    }

    if (token.type === 'NUMBER') {
      this.advance()
      return { kind: 'number', value: Number(token.value) } satisfies NumberLiteral
    }

    if (token.type === 'BOOL') {
      this.advance()
      return { kind: 'boolean', value: Boolean(token.value) } satisfies BooleanLiteral
    }

    if (token.type === 'NULL') {
      this.advance()
      return { kind: 'null' } satisfies NullLiteral
    }

    if (token.type === 'VARIABLE') {
      this.advance()
      return { kind: 'variable', name: String(token.value ?? '') } satisfies Variable
    }

    if (token.type === 'LBRACKET') {
      this.advance() // consume '['
      const elements: LQLValue[] = []
      if (!this.check('RBRACKET')) {
        elements.push(this.parseValue())
        while (this.check('COMMA')) {
          this.advance()
          if (this.check('RBRACKET')) break
          elements.push(this.parseValue())
        }
      }
      this.eat('RBRACKET')
      return { kind: 'array', elements } satisfies ArrayLiteral
    }

    throw new LQLParseError(
      `Expected a value (string, number, boolean, null, variable, or array) but got ${token.type} ('${token.raw}')`,
      token.pos,
    )
  }

  private parseOp(): ComparisonOp {
    const token = this.peek()
    const opMap: Partial<Record<TokenType, ComparisonOp>> = {
      EQ: 'eq',
      NEQ: 'neq',
      LT: 'lt',
      GT: 'gt',
      LTE: 'lte',
      GTE: 'gte',
      CONTAINS: 'contains',
      NOT_CONTAINS: 'not_contains',
      IN: 'in',
    }
    const op = opMap[token.type]
    if (!op) {
      throw new LQLParseError(
        `Expected a comparison operator but got ${token.type} ('${token.raw}')`,
        token.pos,
      )
    }
    this.advance()
    return op
  }

  private parseComparison(): ComparisonExpr {
    const ident = this.eat('IDENT')
    const op = this.parseOp()
    const value = this.parseValue()
    return { kind: 'comparison', field: ident.raw, op, value }
  }

  private parsePrimary(): LQLExpr {
    if (this.check('LPAREN')) {
      this.advance()
      const expr = this.parseExpr()
      this.eat('RPAREN')
      return expr
    }
    if (this.check('IDENT')) {
      return this.parseComparison()
    }
    const token = this.peek()
    throw new LQLParseError(
      `Expected field name or '(' but got ${token.type} ('${token.raw}')`,
      token.pos,
    )
  }

  private parseNot(): LQLExpr {
    if (this.check('NOT')) {
      this.advance()
      const expr = this.parsePrimary()
      return { kind: 'not', expr }
    }
    return this.parsePrimary()
  }

  private parseOrExpr(): LQLExpr {
    let left = this.parseNot()
    while (this.check('OR')) {
      this.advance()
      const right = this.parseNot()
      left = { kind: 'or', left, right }
    }
    return left
  }

  private parseAndExpr(): LQLExpr {
    let left = this.parseOrExpr()
    while (this.check('AND')) {
      this.advance()
      const right = this.parseOrExpr()
      left = { kind: 'and', left, right }
    }
    return left
  }

  private parseExpr(): LQLExpr {
    return this.parseAndExpr()
  }

  parse(): LQLQuery {
    if (this.check('EOF')) {
      throw new LQLParseError('Query must not be empty', 0)
    }
    const expr = this.parseExpr()
    if (!this.check('EOF')) {
      const token = this.peek()
      throw new LQLParseError(
        `Unexpected token ${token.type} ('${token.raw}') after expression`,
        token.pos,
      )
    }
    return { expr }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Parses an LQL string into an AST. Throws `LQLParseError` on syntax errors.
 *
 * @example
 *   parseLQL("entity_type = 'person' AND team = {this}")
 */
export function parseLQL(input: string): LQLQuery {
  return new Parser(input.trim()).parse()
}

/**
 * Returns `null` if the query is valid, or an error message string if invalid.
 * Useful for inline validation in `QueryFieldEditor`.
 */
export function validateLQL(input: string): string | null {
  try {
    parseLQL(input)
    return null
  } catch (e) {
    return e instanceof Error ? e.message : String(e)
  }
}
