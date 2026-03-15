import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { EntityList } from './EntityList.js'
import type { UiEntity, UiEntityType } from './types.js'

const PERSON_TYPE: UiEntityType = {
  id: '01J00000000000000000000001',
  slug: 'person',
  name: 'Person',
  icon: '👤',
  color: '#3b82f6',
  fields: '[]',
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
  fields: '[]',
  isBuiltIn: true,
  createdAt: '2025-01-01T00:00:00',
  updatedAt: '2025-01-01T00:00:00',
  trashedAt: null,
}

const ENTITIES: UiEntity[] = [
  {
    id: 'e1',
    entityTypeId: PERSON_TYPE.id,
    entityTypeSlug: 'person',
    name: 'Alice Johnson',
    fields: '{}',
    createdAt: '2025-03-01T10:00:00',
    updatedAt: '2025-03-10T14:30:00',
    trashedAt: null,
  },
  {
    id: 'e2',
    entityTypeId: PERSON_TYPE.id,
    entityTypeSlug: 'person',
    name: 'Bob Smith',
    fields: '{}',
    createdAt: '2025-02-15T08:00:00',
    updatedAt: '2025-03-08T09:00:00',
    trashedAt: null,
  },
  {
    id: 'e3',
    entityTypeId: PROJECT_TYPE.id,
    entityTypeSlug: 'project',
    name: 'Locus Redesign',
    fields: '{}',
    createdAt: '2025-01-20T11:00:00',
    updatedAt: '2025-03-09T16:00:00',
    trashedAt: null,
  },
]

const meta = {
  title: 'Entities/EntityList',
  component: EntityList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[600px] w-80 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntityList>

export default meta
type Story = StoryObj<typeof meta>

export const WithResults: Story = {
  render: () => {
    const [search, setSearch] = useState('')
    const [typeSlug, setTypeSlug] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const filtered = ENTITIES.filter(
      (e) =>
        (!typeSlug || e.entityTypeSlug === typeSlug) &&
        (!search || e.name.toLowerCase().includes(search.toLowerCase())),
    )
    return (
      <EntityList
        entities={filtered}
        entityTypes={[PERSON_TYPE, PROJECT_TYPE]}
        selectedTypeSlug={typeSlug}
        search={search}
        loading={false}
        selectedEntityId={selectedId}
        onTypeFilter={setTypeSlug}
        onSearch={setSearch}
        onSelectEntity={(e) => setSelectedId(e.id)}
        onCreateEntity={() => {}}
      />
    )
  },
}

export const Loading: Story = {
  args: {
    entities: [],
    entityTypes: [PERSON_TYPE, PROJECT_TYPE],
    selectedTypeSlug: null,
    search: '',
    loading: true,
    onTypeFilter: () => {},
    onSearch: () => {},
    onSelectEntity: () => {},
    onCreateEntity: () => {},
  },
}

export const Empty: Story = {
  args: {
    entities: [],
    entityTypes: [PERSON_TYPE, PROJECT_TYPE],
    selectedTypeSlug: null,
    search: '',
    loading: false,
    onTypeFilter: () => {},
    onSearch: () => {},
    onSelectEntity: () => {},
    onCreateEntity: () => {},
  },
}

export const Filtered: Story = {
  args: {
    entities: ENTITIES.filter((e) => e.entityTypeSlug === 'person'),
    entityTypes: [PERSON_TYPE, PROJECT_TYPE],
    selectedTypeSlug: 'person',
    search: '',
    loading: false,
    onTypeFilter: () => {},
    onSearch: () => {},
    onSelectEntity: () => {},
    onCreateEntity: () => {},
  },
}
