import type { Meta, StoryObj } from '@storybook/react'
import { NoteLinkPopup } from './NoteLinkPopup.js'
import type { UiNote } from './types.js'

const NOTE: UiNote = {
  id: 'n1',
  title: 'Q1 Planning Meeting',
  body: '',
  bodyPlain:
    'Discussed quarterly goals with the team. Key priorities include shipping the entity graph, improving onboarding, and refining the AI pipeline for better NER accuracy.',
  createdAt: '2025-03-01T10:00:00',
  updatedAt: '2025-03-10T14:30:00',
  archivedAt: null,
}

const ARCHIVED_NOTE: UiNote = {
  ...NOTE,
  id: 'n2',
  title: 'Old roadmap notes',
  archivedAt: '2025-02-01T00:00:00',
}

const meta = {
  title: 'Entities/NoteLinkPopup',
  component: NoteLinkPopup,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoteLinkPopup>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
  args: {
    note: NOTE,
    loading: false,
    onOpen: (n) => console.log('open', n.title),
    onClose: () => console.log('close'),
  },
}

export const Archived: Story = {
  args: {
    note: ARCHIVED_NOTE,
    loading: false,
    onClose: () => console.log('close'),
  },
}

export const Loading: Story = {
  args: {
    note: null,
    loading: true,
  },
}
