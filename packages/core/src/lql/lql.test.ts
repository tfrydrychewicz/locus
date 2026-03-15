import type { Page, PaginationParams } from '@locus/shared'
import { describe, expect, it } from 'vitest'
import type { Entity } from '../domain/entity.js'
import { createEntity } from '../domain/entity.js'
import type { EntityFilter } from '../ports/entity-repository.js'
import { LQLParseError } from './ast.js'
import { evaluateLQL } from './evaluator.js'
import { parseLQL, validateLQL } from './parser.js'

// ── Parser tests ──────────────────────────────────────────────────────────────

describe('parseLQL', () => {
  it('parses a simple equality comparison', () => {
    const q = parseLQL("entity_type = 'person'")
    expect(q.expr.kind).toBe('comparison')
    if (q.expr.kind === 'comparison') {
      expect(q.expr.field).toBe('entity_type')
      expect(q.expr.op).toBe('eq')
      expect(q.expr.value).toEqual({ kind: 'string', value: 'person' })
    }
  })

  it('parses AND expressions', () => {
    const q = parseLQL("entity_type = 'person' AND status = 'active'")
    expect(q.expr.kind).toBe('and')
    if (q.expr.kind === 'and') {
      expect(q.expr.left.kind).toBe('comparison')
      expect(q.expr.right.kind).toBe('comparison')
    }
  })

  it('parses OR expressions', () => {
    const q = parseLQL("role = 'engineer' OR role = 'lead'")
    expect(q.expr.kind).toBe('or')
  })

  it('parses NOT expression', () => {
    const q = parseLQL("NOT status = 'inactive'")
    expect(q.expr.kind).toBe('not')
    if (q.expr.kind === 'not') {
      expect(q.expr.expr.kind).toBe('comparison')
    }
  })

  it('parses parenthesized sub-expressions', () => {
    const q = parseLQL("(role = 'lead' OR role = 'manager') AND active = true")
    expect(q.expr.kind).toBe('and')
  })

  it('parses a variable value {this}', () => {
    const q = parseLQL('team = {this}')
    expect(q.expr.kind).toBe('comparison')
    if (q.expr.kind === 'comparison') {
      expect(q.expr.value).toEqual({ kind: 'variable', name: 'this' })
    }
  })

  it('parses numeric literal', () => {
    const q = parseLQL('score > 90')
    expect(q.expr.kind).toBe('comparison')
    if (q.expr.kind === 'comparison') {
      expect(q.expr.value).toEqual({ kind: 'number', value: 90 })
    }
  })

  it('parses boolean literal', () => {
    const q = parseLQL('is_active = true')
    if (q.expr.kind === 'comparison') {
      expect(q.expr.value).toEqual({ kind: 'boolean', value: true })
    }
  })

  it('parses null literal', () => {
    const q = parseLQL('team = null')
    if (q.expr.kind === 'comparison') {
      expect(q.expr.value).toEqual({ kind: 'null' })
    }
  })

  it('parses array literal with IN operator', () => {
    const q = parseLQL("status IN ['active', 'pending']")
    if (q.expr.kind === 'comparison') {
      expect(q.expr.op).toBe('in')
      expect(q.expr.value.kind).toBe('array')
    }
  })

  it('parses CONTAINS operator', () => {
    const q = parseLQL("name CONTAINS 'alice'")
    if (q.expr.kind === 'comparison') {
      expect(q.expr.op).toBe('contains')
    }
  })

  it('parses != operator', () => {
    const q = parseLQL("status != 'inactive'")
    if (q.expr.kind === 'comparison') {
      expect(q.expr.op).toBe('neq')
    }
  })

  it('throws LQLParseError on empty query', () => {
    expect(() => parseLQL('')).toThrow(LQLParseError)
  })

  it('throws LQLParseError on invalid syntax', () => {
    expect(() => parseLQL('entity_type =')).toThrow(LQLParseError)
  })

  it('throws LQLParseError on unclosed variable', () => {
    expect(() => parseLQL('team = {this')).toThrow(LQLParseError)
  })
})

describe('validateLQL', () => {
  it('returns null for valid query', () => {
    expect(validateLQL("entity_type = 'person'")).toBeNull()
  })

  it('returns an error string for invalid query', () => {
    const result = validateLQL('entity_type =')
    expect(typeof result).toBe('string')
    expect(result).toBeTruthy()
  })
})

// ── Evaluator tests ───────────────────────────────────────────────────────────

function makeEntity(overrides: Parameters<typeof createEntity>[0]) {
  return createEntity({
    entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ01',
    entityTypeSlug: 'person',
    name: 'Test',
    ...overrides,
  })
}

function makeRepo(entities: Entity[]) {
  return {
    findAll: async (_filter?: EntityFilter, _page?: PaginationParams): Promise<Page<Entity>> => ({
      items: entities,
      cursor: null,
    }),
  }
}

describe('evaluateLQL', () => {
  it('filters entities by entity_type field', async () => {
    const alice = makeEntity({ entityTypeSlug: 'person', name: 'Alice' })
    const task = makeEntity({
      entityTypeId: '01ABCDEFGHJKMNPQRSTVWXYZ02',
      entityTypeSlug: 'project',
      name: 'Alpha',
    })
    const repo = makeRepo([alice, task])
    const q = parseLQL("entity_type = 'person'")
    const results = await evaluateLQL(q, repo)
    expect(results).toEqual([alice])
  })

  it('filters by custom field value', async () => {
    const alice = makeEntity({ entityTypeSlug: 'person', name: 'Alice', fields: { role: 'lead' } })
    const bob = makeEntity({ entityTypeSlug: 'person', name: 'Bob', fields: { role: 'engineer' } })
    const repo = makeRepo([alice, bob])
    const q = parseLQL("role = 'lead'")
    const results = await evaluateLQL(q, repo)
    expect(results).toEqual([alice])
  })

  it('resolves {this} variable to context entity id', async () => {
    const contextEntity = makeEntity({ entityTypeSlug: 'team', name: 'Core Team' })
    const alice = makeEntity({
      entityTypeSlug: 'person',
      name: 'Alice',
      fields: { team: contextEntity.id },
    })
    const bob = makeEntity({
      entityTypeSlug: 'person',
      name: 'Bob',
      fields: { team: 'other-id' },
    })
    const repo = makeRepo([alice, bob])
    const q = parseLQL('team = {this}')
    const results = await evaluateLQL(q, repo, { thisEntity: contextEntity })
    expect(results).toEqual([alice])
  })

  it('evaluates AND conjunction', async () => {
    const alice = makeEntity({
      entityTypeSlug: 'person',
      name: 'Alice',
      fields: { role: 'lead', active: true },
    })
    const bob = makeEntity({
      entityTypeSlug: 'person',
      name: 'Bob',
      fields: { role: 'lead', active: false },
    })
    const repo = makeRepo([alice, bob])
    const q = parseLQL("role = 'lead' AND active = true")
    const results = await evaluateLQL(q, repo)
    expect(results).toEqual([alice])
  })

  it('evaluates OR disjunction', async () => {
    const alice = makeEntity({ entityTypeSlug: 'person', name: 'Alice', fields: { role: 'lead' } })
    const bob = makeEntity({
      entityTypeSlug: 'person',
      name: 'Bob',
      fields: { role: 'engineer' },
    })
    const carol = makeEntity({
      entityTypeSlug: 'person',
      name: 'Carol',
      fields: { role: 'intern' },
    })
    const repo = makeRepo([alice, bob, carol])
    const q = parseLQL("role = 'lead' OR role = 'engineer'")
    const results = await evaluateLQL(q, repo)
    expect(results).toHaveLength(2)
    expect(results).toContain(alice)
    expect(results).toContain(bob)
  })

  it('evaluates NOT expression', async () => {
    const alice = makeEntity({
      entityTypeSlug: 'person',
      name: 'Alice',
      fields: { status: 'active' },
    })
    const bob = makeEntity({
      entityTypeSlug: 'person',
      name: 'Bob',
      fields: { status: 'inactive' },
    })
    const repo = makeRepo([alice, bob])
    const q = parseLQL("NOT status = 'inactive'")
    const results = await evaluateLQL(q, repo)
    expect(results).toEqual([alice])
  })

  it('evaluates CONTAINS for partial text match', async () => {
    const alice = makeEntity({ entityTypeSlug: 'person', name: 'Alice Johnson' })
    const bob = makeEntity({ entityTypeSlug: 'person', name: 'Bob Smith' })
    const repo = makeRepo([alice, bob])
    const q = parseLQL("name CONTAINS 'johnson'")
    const results = await evaluateLQL(q, repo)
    expect(results).toEqual([alice])
  })
})
