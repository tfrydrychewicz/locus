import type { Meta, StoryObj } from '@storybook/react'
import {
  Bell,
  Calendar,
  FileText,
  Home,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  Zap,
} from 'lucide-react'
import { Icon } from './Icon.js'

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { icon: Home, size: 24 },
}

export const CommonIcons: Story = {
  render: () => (
    <div className="flex items-center gap-5 text-[var(--color-text-secondary)]">
      <Icon icon={Home} />
      <Icon icon={Search} />
      <Icon icon={Plus} />
      <Icon icon={FileText} />
      <Icon icon={User} />
      <Icon icon={Calendar} />
      <Icon icon={Bell} />
      <Icon icon={Settings} />
      <Icon icon={Trash2} />
      <Icon icon={Zap} />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4 text-[var(--color-accent)]">
      <Icon icon={Zap} size={12} />
      <Icon icon={Zap} size={16} />
      <Icon icon={Zap} size={20} />
      <Icon icon={Zap} size={24} />
      <Icon icon={Zap} size={32} />
    </div>
  ),
}

export const Colored: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon icon={Zap} className="text-[var(--color-success)]" />
      <Icon icon={Zap} className="text-[var(--color-warning)]" />
      <Icon icon={Zap} className="text-[var(--color-danger)]" />
      <Icon icon={Zap} className="text-[var(--color-accent)]" />
    </div>
  ),
}
