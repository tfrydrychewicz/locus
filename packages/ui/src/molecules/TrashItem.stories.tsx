import type { Meta, StoryObj } from '@storybook/react'
import { FileText } from 'lucide-react'
import { TrashItem } from './TrashItem.js'

const meta = {
  title: 'Molecules/TrashItem',
  component: TrashItem,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ul className="max-w-md list-none p-0">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof TrashItem>

export default meta
type Story = StoryObj<typeof meta>

export const Note: Story = {
  args: {
    label: 'Meeting notes from Monday',
    onRestore: () => console.log('Restore'),
    onDeletePermanently: () => console.log('Delete permanently'),
    restoreLabel: 'Restore',
    deleteLabel: 'Delete permanently',
  },
}

export const WithIcon: Story = {
  args: {
    label: 'John Doe',
    icon: <FileText size={14} className="shrink-0" aria-hidden />,
    onRestore: () => console.log('Restore'),
    onDeletePermanently: () => console.log('Delete permanently'),
    restoreLabel: 'Restore',
    deleteLabel: 'Delete permanently',
  },
}
