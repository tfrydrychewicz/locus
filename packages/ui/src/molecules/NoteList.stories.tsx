import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { NoteListNote } from './NoteList.js'
import { NoteList } from './NoteList.js'

const NOTES: NoteListNote[] = [
  {
    id: 'n1',
    title: 'Meeting notes',
    bodyPlain: 'Discussed the Q1 roadmap and priorities for the team.',
    updatedAt: '2025-03-10T14:30:00',
  },
  {
    id: 'n2',
    title: 'Project ideas',
    bodyPlain: 'Brainstorming session for new features and improvements.',
    updatedAt: '2025-03-09T11:00:00',
  },
  {
    id: 'n3',
    title: 'Untitled',
    bodyPlain: '',
    updatedAt: '2025-03-08T09:15:00',
  },
]

const meta = {
  title: 'Molecules/NoteList',
  component: NoteList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[600px] w-80 border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-bg-surface)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoteList>

export default meta
type Story = StoryObj<typeof meta>

export const WithResults: Story = {
  render: () => {
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const filtered = NOTES.filter(
      (n) =>
        !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.bodyPlain ?? '').toLowerCase().includes(search.toLowerCase()),
    )
    return (
      <NoteList
        notes={filtered}
        search={search}
        loading={false}
        selectedNoteId={selectedId}
        onSearch={setSearch}
        onSelectNote={(n) => setSelectedId(n.id)}
        onCreateNote={() => {}}
      />
    )
  },
}

export const Loading: Story = {
  args: {
    notes: [],
    search: '',
    loading: true,
    onSearch: () => {},
    onSelectNote: () => {},
    onCreateNote: () => {},
  },
}

export const Empty: Story = {
  args: {
    notes: [],
    search: '',
    loading: false,
    onSearch: () => {},
    onSelectNote: () => {},
    onCreateNote: () => {},
  },
}

export const EmptySearch: Story = {
  args: {
    notes: [],
    search: 'nonexistent',
    loading: false,
    onSearch: () => {},
    onSelectNote: () => {},
    onCreateNote: () => {},
  },
}
