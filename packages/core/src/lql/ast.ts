/**
 * LQL — Locus Query Language
 *
 * Syntax:
 *   query      → expr EOF
 *   expr       → andExpr
 *   andExpr    → orExpr ('AND' orExpr)*
 *   orExpr     → notExpr ('OR' notExpr)*
 *   notExpr    → 'NOT'? primary
 *   primary    → '(' expr ')' | comparison
 *   comparison → field op value
 *   field      → IDENT
 *   op         → '=' | '!=' | '<' | '>' | '<=' | '>=' | 'CONTAINS' | 'NOT_CONTAINS' | 'IN'
 *   value      → STRING | NUMBER | BOOL | NULL | variable | '[' (value (',' value)*)? ']'
 *   variable   → '{' IDENT '}'   — {this} refers to the context entity
 *
 * Example:
 *   entity_type = 'person' AND team = {this}
 */

// ── Value nodes ───────────────────────────────────────────────────────────────

export interface StringLiteral {
  readonly kind: 'string'
  readonly value: string
}

export interface NumberLiteral {
  readonly kind: 'number'
  readonly value: number
}

export interface BooleanLiteral {
  readonly kind: 'boolean'
  readonly value: boolean
}

export interface NullLiteral {
  readonly kind: 'null'
}

export interface Variable {
  readonly kind: 'variable'
  readonly name: string // e.g. 'this'
}

export interface ArrayLiteral {
  readonly kind: 'array'
  readonly elements: readonly LQLValue[]
}

export type LQLValue =
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NullLiteral
  | Variable
  | ArrayLiteral

// ── Operators ─────────────────────────────────────────────────────────────────

export type ComparisonOp =
  | 'eq' // =
  | 'neq' // !=
  | 'lt' // <
  | 'gt' // >
  | 'lte' // <=
  | 'gte' // >=
  | 'contains' // CONTAINS
  | 'not_contains' // NOT_CONTAINS
  | 'in' // IN

// ── Expression nodes ──────────────────────────────────────────────────────────

export interface ComparisonExpr {
  readonly kind: 'comparison'
  readonly field: string
  readonly op: ComparisonOp
  readonly value: LQLValue
}

export interface AndExpr {
  readonly kind: 'and'
  readonly left: LQLExpr
  readonly right: LQLExpr
}

export interface OrExpr {
  readonly kind: 'or'
  readonly left: LQLExpr
  readonly right: LQLExpr
}

export interface NotExpr {
  readonly kind: 'not'
  readonly expr: LQLExpr
}

export type LQLExpr = ComparisonExpr | AndExpr | OrExpr | NotExpr

// ── Root ──────────────────────────────────────────────────────────────────────

export interface LQLQuery {
  readonly expr: LQLExpr
}

// ── Parse error ───────────────────────────────────────────────────────────────

export class LQLParseError extends Error {
  constructor(
    message: string,
    public readonly position: number,
  ) {
    super(`LQL parse error at position ${position}: ${message}`)
    this.name = 'LQLParseError'
  }
}

export class LQLEvalError extends Error {
  constructor(message: string) {
    super(`LQL evaluation error: ${message}`)
    this.name = 'LQLEvalError'
  }
}
