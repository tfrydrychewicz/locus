import type { Meta, StoryObj } from '@storybook/react'
import { Briefcase, Folder, Target, User, Users } from 'lucide-react'
import { useState } from 'react'
import { Select } from './Select.js'

const meta = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-72 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const SIMPLE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'enum', label: 'Select' },
  { value: 'relation', label: 'Relation' },
]

const ICON_OPTIONS = [
  { value: 'person', label: 'Person', icon: User },
  { value: 'project', label: 'Project', icon: Folder },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'okr', label: 'OKR', icon: Target },
  { value: 'company', label: 'Company', icon: Briefcase },
]

export const Default: Story = {
  render: () => {
    const [val, setVal] = useState('text')
    return <Select options={SIMPLE_OPTIONS} value={val} onChange={setVal} />
  },
}

export const WithIcons: Story = {
  render: () => {
    const [val, setVal] = useState('person')
    return <Select options={ICON_OPTIONS} value={val} onChange={setVal} />
  },
}

export const Searchable: Story = {
  render: () => {
    const [val, setVal] = useState('')
    return (
      <Select
        options={ICON_OPTIONS}
        value={val}
        onChange={setVal}
        searchable
        placeholder="Search entity type…"
      />
    )
  },
}

export const Small: Story = {
  render: () => {
    const [val, setVal] = useState('text')
    return <Select options={SIMPLE_OPTIONS} value={val} onChange={setVal} selectSize="sm" />
  },
}

export const WithPlaceholder: Story = {
  render: () => {
    const [val, setVal] = useState('')
    return (
      <Select options={SIMPLE_OPTIONS} value={val} onChange={setVal} placeholder="Choose a type…" />
    )
  },
}

export const WithError: Story = {
  render: () => {
    const [val, setVal] = useState('')
    return (
      <Select
        options={SIMPLE_OPTIONS}
        value={val}
        onChange={setVal}
        error="Please select a type"
        id="field-type"
      />
    )
  },
}

export const Disabled: Story = {
  render: () => <Select options={SIMPLE_OPTIONS} value="text" onChange={() => {}} disabled />,
}
