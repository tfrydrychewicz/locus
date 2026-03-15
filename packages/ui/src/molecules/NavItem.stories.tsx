import type { Meta, StoryObj } from '@storybook/react'
import { FileText, Settings, Zap } from 'lucide-react'
import { NavItem } from './NavItem.js'

const meta = {
  title: 'Molecules/NavItem',
  component: NavItem,
  tags: ['autodocs'],
  args: {
    icon: <FileText size={16} />,
    label: 'Notes',
  },
  decorators: [
    (Story) => (
      <div className="w-48 bg-[var(--color-bg-sidebar)] p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = {
  args: { active: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithBadge: Story = {
  args: { badge: 7 },
}

export const WithBadgeActive: Story = {
  args: { active: true, badge: 3 },
}

export const LargeBadge: Story = {
  args: { badge: 142 },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-1 w-48 bg-[var(--color-bg-sidebar)] p-2">
      <NavItem icon={<Zap size={16} />} label="Today" active />
      <NavItem icon={<FileText size={16} />} label="Notes" badge={4} />
      <NavItem icon={<Settings size={16} />} label="Settings" />
      <NavItem icon={<FileText size={16} />} label="Tasks" disabled />
    </div>
  ),
}
