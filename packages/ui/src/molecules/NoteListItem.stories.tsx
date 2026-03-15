import type { Meta, StoryObj } from '@storybook/react'
import { NoteListItem } from './NoteListItem.js'

const meta = {
  title: 'Molecules/NoteListItem',
  component: NoteListItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-4 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoteListItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Meeting notes',
    excerpt: 'Discussed Q1 goals and roadmap. Follow up on design review.',
    updatedAt: '2 hours ago',
    onClick: () => {},
  },
}

export const Selected: Story = {
  args: {
    title: 'Selected note',
    excerpt: 'This item is currently selected.',
    updatedAt: 'Yesterday',
    onClick: () => {},
    selected: true,
  },
}

export const Archived: Story = {
  args: {
    title: 'Old archive',
    excerpt: 'Archived note with reduced emphasis.',
    updatedAt: 'Last week',
    archived: true,
  },
}

export const Untitled: Story = {
  args: {
    title: '',
    excerpt: 'Note with no title shows "Untitled".',
    updatedAt: '1 min ago',
  },
}
