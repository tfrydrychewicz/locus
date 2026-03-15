import type { Entity } from '../domain/entity.js'
import type { FieldValue } from '../domain/field-definition.js'
import type { EntityRepository } from '../ports/entity-repository.js'
import {
  type AndExpr,
  type ArrayLiteral,
  type BooleanLiteral,
  type ComparisonExpr,
  type ComparisonOp,
  LQLEvalError,
  type LQLExpr,
  type LQLQuery,
  type LQLValue,
  type NotExpr,
  type NumberLiteral,
  type OrExpr,
  type StringLiteral,
  type Variable,
} from './ast.js'
import { parseLQL } from './parser.js'

// ── Evaluation context ────────────────────────────────────────────────────────

export interface LQLContext {
  /** The entity that owns the computed field (used to resolve `{this}`). */
  readonly thisEntity?: Entity
}

// ── Value resolution ──────────────────────────────────────────────────────────

function resolveValue(value: LQLValue, ctx: LQLContext): FieldValue | FieldValue[] {
  switch (value.kind) {
    case 'string':
      return (value as StringLiteral).value
    case 'number':
      return (value as NumberLiteral).value
    case 'boolean':
      return (value as BooleanLiteral).value
    case 'null':
      return null
    case 'variable': {
      const name = (value as Variable).name
      if (name === 'this') {
        if (!ctx.thisEntity) throw new LQLEvalError("Variable '{this}' requires a context entity")
        return ctx.thisEntity.id
      }
      throw new LQLEvalError(`Unknown variable '{${name}}'`)
    }
    case 'array': {
      const arr = value as ArrayLiteral
      return arr.elements.map((el) => resolveValue(el, ctx) as FieldValue)
    }
  }
}

// ── Entity field lookup ───────────────────────────────────────────────────────

function getEntityField(entity: Entity, field: string): FieldValue {
  // Special synthetic fields
  if (field === 'entity_type') return entity.entityTypeSlug
  if (field === 'id') return entity.id
  if (field === 'name') return entity.name
  return entity.fields[field] ?? null
}

// ── Comparison logic ──────────────────────────────────────────────────────────

function coerce(v: FieldValue): string | number | boolean | null {
  if (Array.isArray(v)) return null
  return v
}

function compareValues(
  entityVal: FieldValue,
  op: ComparisonOp,
  rhs: FieldValue | FieldValue[],
): boolean {
  const rhsScalar = Array.isArray(rhs) ? null : rhs
  const rhsArray = Array.isArray(rhs) ? rhs : null

  switch (op) {
    case 'eq':
      if (Array.isArray(entityVal)) return entityVal.includes(String(rhsScalar))
      return coerce(entityVal) === rhsScalar

    case 'neq':
      if (Array.isArray(entityVal)) return !entityVal.includes(String(rhsScalar))
      return coerce(entityVal) !== rhsScalar

    case 'lt':
      return Number(coerce(entityVal)) < Number(rhsScalar)

    case 'gt':
      return Number(coerce(entityVal)) > Number(rhsScalar)

    case 'lte':
      return Number(coerce(entityVal)) <= Number(rhsScalar)

    case 'gte':
      return Number(coerce(entityVal)) >= Number(rhsScalar)

    case 'contains': {
      const s = String(coerce(entityVal) ?? '')
      return s.toLowerCase().includes(String(rhsScalar ?? '').toLowerCase())
    }

    case 'not_contains': {
      const s = String(coerce(entityVal) ?? '')
      return !s.toLowerCase().includes(String(rhsScalar ?? '').toLowerCase())
    }

    case 'in': {
      const arr = rhsArray ?? (rhsScalar !== null ? [String(rhsScalar)] : [])
      const scalar = coerce(entityVal)
      return arr.map(String).includes(String(scalar))
    }
  }
}

// ── Expression evaluation ─────────────────────────────────────────────────────

function evalExpr(expr: LQLExpr, entity: Entity, ctx: LQLContext): boolean {
  switch (expr.kind) {
    case 'comparison': {
      const cmp = expr as ComparisonExpr
      const entityVal = getEntityField(entity, cmp.field)
      const rhs = resolveValue(cmp.value, ctx)
      return compareValues(entityVal, cmp.op, rhs as FieldValue | FieldValue[])
    }

    case 'and': {
      const and = expr as AndExpr
      return evalExpr(and.left, entity, ctx) && evalExpr(and.right, entity, ctx)
    }

    case 'or': {
      const or = expr as OrExpr
      return evalExpr(or.left, entity, ctx) || evalExpr(or.right, entity, ctx)
    }

    case 'not': {
      const not = expr as NotExpr
      return !evalExpr(not.expr, entity, ctx)
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Evaluates a parsed LQL query against an entity repository.
 * Returns all entities matching the query expression.
 *
 * @example
 *   const results = await evaluateLQL(query, repo, { thisEntity: currentEntity })
 */
export async function evaluateLQL(
  query: LQLQuery,
  repo: Pick<EntityRepository, 'findAll'>,
  ctx: LQLContext = {},
): Promise<Entity[]> {
  // Fetch all non-trashed entities (the repo layer applies pagination/indexes)
  const page = await repo.findAll({ includeTrashed: false })
  return page.items.filter((entity) => evalExpr(query.expr, entity, ctx))
}

/**
 * Convenience: parses and evaluates an LQL string in one call.
 * Throws `LQLParseError` on syntax errors, `LQLEvalError` on runtime errors.
 */
export async function runLQL(
  queryString: string,
  repo: Pick<EntityRepository, 'findAll'>,
  ctx: LQLContext = {},
): Promise<Entity[]> {
  const query = parseLQL(queryString)
  return evaluateLQL(query, repo, ctx)
}
