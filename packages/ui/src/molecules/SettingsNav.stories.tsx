import type { Meta, StoryObj } from '@storybook/react'
import { Bell, Brush, Cpu, Database, Globe, Lock, Settings } from 'lucide-react'
import { useState } from 'react'
import { SettingsNav } from './SettingsNav.js'

const meta: Meta<typeof SettingsNav> = {
  title: 'Molecules/SettingsNav',
  component: SettingsNav,
  decorators: [
    (Story) => (
      <div style={{ width: 200, padding: 8, background: 'var(--color-bg-sidebar)' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof SettingsNav>

const allCategories = [
  { id: 'appearance', icon: <Brush size={15} />, label: 'Appearance' },
  {
    id: 'editor',
    icon: <Settings size={15} />,
    label: 'Editor',
    subcategories: [
      { id: 'editor.format', label: 'Formatting' },
      { id: 'editor.autosave', label: 'Auto-save' },
    ],
  },
  { id: 'ai', icon: <Cpu size={15} />, label: 'AI & Models' },
  { id: 'notifications', icon: <Bell size={15} />, label: 'Notifications' },
  { id: 'language', icon: <Globe size={15} />, label: 'Language' },
  { id: 'data', icon: <Database size={15} />, label: 'Data & Storage' },
  { id: 'privacy', icon: <Lock size={15} />, label: 'Privacy' },
]

export const Default: Story = {
  args: {
    categories: allCategories,
    activeId: 'appearance',
    onSelect: () => {},
  },
}

export const ActiveSubcategory: Story = {
  args: {
    categories: allCategories,
    activeId: 'editor.format',
    onSelect: () => {},
  },
}

export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState('appearance')
    return <SettingsNav categories={allCategories} activeId={active} onSelect={setActive} />
  },
}
