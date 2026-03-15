import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { BacklinksList } from './BacklinksList.js'

const meta = {
  title: 'Molecules/BacklinksList',
  component: BacklinksList,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-w-[320px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BacklinksList>

export default meta
type Story = StoryObj<typeof meta>

const sampleItems = [
  { fromNoteId: '01', title: 'Meeting notes from Monday' },
  { fromNoteId: '02', title: 'Project roadmap' },
  { fromNoteId: '03', title: 'Ideas backlog' },
]

export const Collapsed: Story = {
  args: {
    items: sampleItems,
    expanded: false,
    loadingLabel: 'Backlinks',
    countLabel: '3 backlinks',
    emptyLabel: 'No backlinks to this note.',
    onToggle: () => {},
    onItemClick: () => {},
  },
}

export const Expanded: Story = {
  render: () => {
    const [expanded, setExpanded] = useState(true)
    return (
      <BacklinksList
        items={sampleItems}
        expanded={expanded}
        loadingLabel="Backlinks"
        countLabel="3 backlinks"
        emptyLabel="No backlinks to this note."
        onToggle={() => setExpanded((e) => !e)}
        onItemClick={(id) => console.log('Open note', id)}
      />
    )
  },
}

export const Empty: Story = {
  args: {
    items: [],
    expanded: true,
    loadingLabel: 'Backlinks',
    countLabel: '0 backlinks',
    emptyLabel: 'No backlinks to this note.',
    onToggle: () => {},
    onItemClick: () => {},
  },
}

export const Loading: Story = {
  args: {
    items: [],
    expanded: false,
    loading: true,
    loadingLabel: 'Backlinks',
    countLabel: '0 backlinks',
    emptyLabel: 'No backlinks to this note.',
    onToggle: () => {},
    onItemClick: () => {},
  },
}
