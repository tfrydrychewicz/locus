import type { Meta, StoryObj } from '@storybook/react'
import { EntityDetail } from './EntityDetail.js'
import type { UiEntity, UiEntityType } from './types.js'

const PERSON_TYPE: UiEntityType = {
  id: '01J00000000000000000000001',
  slug: 'person',
  name: 'Person',
  icon: '👤',
  color: '#3b82f6',
  fields: JSON.stringify([
    { id: 'email', label: 'Email', type: 'email', order: 0 },
    { id: 'role', label: 'Role', type: 'text', order: 1 },
    { id: 'active', label: 'Active', type: 'boolean', order: 2 },
    {
      id: 'status',
      label: 'Status',
      type: 'enum',
      order: 3,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'alumni', label: 'Alumni' },
      ],
    },
  ]),
  isBuiltIn: true,
  createdAt: '2025-01-01T00:00:00',
  updatedAt: '2025-01-01T00:00:00',
  trashedAt: null,
}

const PROJECT_TYPE: UiEntityType = {
  id: '01J00000000000000000000002',
  slug: 'project',
  name: 'Project',
  icon: '📁',
  color: '#8b5cf6',
  fields: JSON.stringify([
    { id: 'description', label: 'Description', type: 'text', order: 0 },
    { id: 'due_date', label: 'Due date', type: 'date', order: 1 },
    {
      id: 'members',
      label: 'Members',
      type: 'computed_query',
      order: 2,
      query: "entity_type = 'person' and team = {this}",
    },
  ]),
  isBuiltIn: false,
  createdAt: '2025-01-01T00:00:00',
  updatedAt: '2025-01-01T00:00:00',
  trashedAt: null,
}

const PERSON: UiEntity = {
  id: 'e1',
  entityTypeId: PERSON_TYPE.id,
  entityTypeSlug: 'person',
  name: 'Alice Johnson',
  fields: JSON.stringify({
    email: 'alice@example.com',
    role: 'Product Designer',
    active: true,
    status: 'active',
  }),
  createdAt: '2025-03-01T10:00:00',
  updatedAt: '2025-03-10T14:30:00',
  trashedAt: null,
}

const PROJECT: UiEntity = {
  id: 'e2',
  entityTypeId: PROJECT_TYPE.id,
  entityTypeSlug: 'project',
  name: 'Locus Redesign',
  fields: JSON.stringify({ description: 'Full redesign of the app', due_date: '2025-06-30' }),
  createdAt: '2025-01-20T11:00:00',
  updatedAt: '2025-03-09T16:00:00',
  trashedAt: null,
}

const meta = {
  title: 'Entities/EntityDetail',
  component: EntityDetail,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[600px] w-[480px] border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntityDetail>

export default meta
type Story = StoryObj<typeof meta>

export const Person: Story = {
  args: {
    entity: PERSON,
    entityType: PERSON_TYPE,
    onSave: (u) => console.log('save', u),
    onTrash: () => console.log('trash'),
  },
}

export const Project: Story = {
  args: {
    entity: PROJECT,
    entityType: PROJECT_TYPE,
    onSave: (u) => console.log('save', u),
    onTrash: () => console.log('trash'),
    renderComputedField: (_fieldId, query) => (
      <div className="rounded border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
        Computed: <code>{query}</code>
      </div>
    ),
  },
}

export const CustomType: Story = {
  args: {
    entity: {
      id: 'e3',
      entityTypeId: 'custom1',
      entityTypeSlug: 'contact',
      name: 'Acme Corp',
      fields: JSON.stringify({ website: 'https://acme.example.com', employees: 50 }),
      createdAt: '2025-02-01T00:00:00',
      updatedAt: '2025-03-01T00:00:00',
      trashedAt: null,
    },
    entityType: {
      id: 'custom1',
      slug: 'contact',
      name: 'Contact',
      icon: '🏢',
      color: '#10b981',
      fields: JSON.stringify([
        { id: 'website', label: 'Website', type: 'url', order: 0 },
        { id: 'employees', label: 'Employees', type: 'number', order: 1 },
      ]),
      isBuiltIn: false,
      createdAt: '2025-01-01T00:00:00',
      updatedAt: '2025-01-01T00:00:00',
      trashedAt: null,
    },
    onSave: (u) => console.log('save', u),
    onTrash: () => console.log('trash'),
  },
}
