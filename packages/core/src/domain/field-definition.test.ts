import { describe, expect, it } from 'vitest'
import { isComputedField, isRelationField, validateFieldDefinition } from './field-definition.js'

describe('fieldDefinitionSchema', () => {
  it('validates a text field', () => {
    const field = validateFieldDefinition({
      id: 'bio',
      label: 'Bio',
      type: 'text',
      order: 0,
      multiline: true,
    })
    expect(field.type).toBe('text')
    expect(field.id).toBe('bio')
  })

  it('validates a number field', () => {
    const field = validateFieldDefinition({ id: 'age', label: 'Age', type: 'number', order: 1 })
    expect(field.type).toBe('number')
  })

  it('validates a date field', () => {
    const field = validateFieldDefinition({
      id: 'start_date',
      label: 'Start Date',
      type: 'date',
      order: 2,
    })
    expect(field.type).toBe('date')
  })

  it('validates a boolean field', () => {
    const field = validateFieldDefinition({
      id: 'is_active',
      label: 'Active?',
      type: 'boolean',
      order: 3,
    })
    expect(field.type).toBe('boolean')
  })

  it('validates a url field', () => {
    const field = validateFieldDefinition({
      id: 'website',
      label: 'Website',
      type: 'url',
      order: 4,
    })
    expect(field.type).toBe('url')
  })

  it('validates an email field', () => {
    const field = validateFieldDefinition({
      id: 'email',
      label: 'Email',
      type: 'email',
      order: 5,
    })
    expect(field.type).toBe('email')
  })

  it('validates an enum field with options', () => {
    const field = validateFieldDefinition({
      id: 'status',
      label: 'Status',
      type: 'enum',
      order: 6,
      options: [
        { id: 'active', label: 'Active' },
        { id: 'inactive', label: 'Inactive' },
      ],
    })
    expect(field.type).toBe('enum')
    if (field.type === 'enum') expect(field.options).toHaveLength(2)
  })

  it('rejects an enum field with no options', () => {
    expect(() =>
      validateFieldDefinition({
        id: 'status',
        label: 'Status',
        type: 'enum',
        order: 6,
        options: [],
      }),
    ).toThrow()
  })

  it('validates a relation field', () => {
    const field = validateFieldDefinition({
      id: 'team',
      label: 'Team',
      type: 'relation',
      order: 7,
      targetEntityTypeSlug: 'team',
    })
    expect(isRelationField(field)).toBe(true)
  })

  it('validates a computed_query field', () => {
    const field = validateFieldDefinition({
      id: 'members',
      label: 'Members',
      type: 'computed_query',
      order: 8,
      query: "entity_type = 'person' AND team = {this}",
    })
    expect(isComputedField(field)).toBe(true)
    if (field.type === 'computed_query') {
      expect(field.query).toBe("entity_type = 'person' AND team = {this}")
    }
  })

  it('rejects a field id with uppercase or spaces', () => {
    expect(() =>
      validateFieldDefinition({ id: 'My Field', label: 'Test', type: 'text', order: 0 }),
    ).toThrow()
    expect(() =>
      validateFieldDefinition({ id: 'MyField', label: 'Test', type: 'text', order: 0 }),
    ).toThrow()
  })
})
