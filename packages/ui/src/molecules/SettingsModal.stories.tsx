import type { Meta, StoryObj } from '@storybook/react'
import { Brush, Globe } from 'lucide-react'
import { useState } from 'react'
import { SettingsModal } from './SettingsModal.js'
import { SettingsNav } from './SettingsNav.js'

const meta: Meta<typeof SettingsModal> = {
  title: 'Molecules/SettingsModal',
  component: SettingsModal,
  decorators: [
    (Story) => (
      <div style={{ height: '520px', width: '720px', border: '1px solid var(--color-border)' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof SettingsModal>

const categories = [
  { id: 'appearance', icon: <Brush size={15} />, label: 'Appearance' },
  { id: 'language', icon: <Globe size={15} />, label: 'Language' },
]

const nav = <SettingsNav categories={categories} activeId="appearance" onSelect={() => {}} />

const content = (
  <div className="flex flex-col gap-6 p-6">
    <div>
      <h3 className="mb-1 text-sm font-semibold text-[var(--color-text-primary)]">Theme</h3>
      <p className="text-xs text-[var(--color-text-muted)]">Choose your preferred color theme.</p>
      <div className="mt-3 flex gap-2">
        {['System', 'Light', 'Dark'].map((opt) => (
          <button
            key={opt}
            type="button"
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  </div>
)

export const Clean: Story = {
  args: {
    title: 'Settings',
    nav,
    content,
    saveLabel: 'Save changes',
    cancelLabel: 'Cancel',
    isDirty: false,
    onSave: () => {},
    onCancel: () => {},
  },
}

export const Dirty: Story = {
  args: {
    ...Clean.args,
    isDirty: true,
    dirtyLabel: 'Unsaved changes',
  },
}

export const Interactive: Story = {
  render: () => {
    const [activeId, setActiveId] = useState('appearance')
    const [dirty, setDirty] = useState(false)
    const interactiveNav = (
      <SettingsNav categories={categories} activeId={activeId} onSelect={setActiveId} />
    )
    return (
      <SettingsModal
        title="Settings"
        nav={interactiveNav}
        content={
          <div className="flex flex-col gap-6 p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {categories.find((c) => c.id === activeId)?.label}
            </h3>
            <button
              type="button"
              onClick={() => setDirty(true)}
              className="w-fit rounded border border-[var(--color-border)] px-3 py-1.5 text-xs"
            >
              Make a change
            </button>
          </div>
        }
        saveLabel="Save changes"
        cancelLabel="Cancel"
        isDirty={dirty}
        dirtyLabel="Unsaved changes"
        onSave={() => setDirty(false)}
        onCancel={() => setDirty(false)}
      />
    )
  },
}
