import type { Meta, StoryObj } from '@storybook/react'
import {
  Calendar,
  FileText,
  Folder,
  MessageSquare,
  Scale,
  Search,
  Settings,
  Target,
  Trash2,
  User,
  Users,
  Zap,
} from 'lucide-react'
import { type NavItemConfig, Sidebar } from './Sidebar.js'

const mainSections: NavItemConfig[][] = [
  [
    { id: 'today', icon: <Zap size={16} />, label: 'Today', active: true },
    { id: 'notes', icon: <FileText size={16} />, label: 'Notes' },
  ],
  [
    { id: 'people', icon: <User size={16} />, label: 'People', disabled: true },
    { id: 'projects', icon: <Folder size={16} />, label: 'Projects', disabled: true },
    { id: 'team', icon: <Users size={16} />, label: 'Team', disabled: true },
    { id: 'decisions', icon: <Scale size={16} />, label: 'Decisions', disabled: true },
    { id: 'okrs', icon: <Target size={16} />, label: 'OKRs', disabled: true },
  ],
  [
    { id: 'calendar', icon: <Calendar size={16} />, label: 'Calendar', disabled: true },
    { id: 'search', icon: <Search size={16} />, label: 'Search', badge: 0 },
    { id: 'trash', icon: <Trash2 size={16} />, label: 'Trash', disabled: true },
  ],
]

const bottomSection: NavItemConfig[] = [
  { id: 'askAi', icon: <MessageSquare size={16} />, label: 'Ask AI', disabled: true },
  { id: 'settings', icon: <Settings size={16} />, label: 'Settings' },
]

const meta = {
  title: 'Molecules/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-[600px] flex bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    sections: mainSections,
    bottomSection,
  },
}

export const NotesActive: Story = {
  args: {
    sections: mainSections.map((group) =>
      group.map((item) => ({ ...item, active: item.id === 'notes' })),
    ),
    bottomSection,
  },
}

export const WithBadges: Story = {
  args: {
    sections: [
      [
        { id: 'today', icon: <Zap size={16} />, label: 'Today', active: true },
        { id: 'notes', icon: <FileText size={16} />, label: 'Notes', badge: 12 },
        { id: 'search', icon: <Search size={16} />, label: 'Search' },
      ],
    ],
    bottomSection,
  },
}

export const Minimal: Story = {
  args: {
    sections: [
      [
        { id: 'today', icon: <Zap size={16} />, label: 'Today', active: true },
        { id: 'notes', icon: <FileText size={16} />, label: 'Notes' },
      ],
    ],
    bottomSection: [{ id: 'settings', icon: <Settings size={16} />, label: 'Settings' }],
  },
}

export const Collapsed: Story = {
  args: {
    sections: mainSections,
    bottomSection,
    collapsed: true,
  },
}
