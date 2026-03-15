import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IconPicker } from './IconPicker.js'

const meta = {
  title: 'Molecules/IconPicker',
  component: IconPicker,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-56 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IconPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [icon, setIcon] = useState('user')
    return <IconPicker value={icon} onChange={setIcon} />
  },
}

export const NoSelection: Story = {
  render: () => {
    const [icon, setIcon] = useState('')
    return <IconPicker value={icon} onChange={setIcon} />
  },
}

export const MediumSize: Story = {
  render: () => {
    const [icon, setIcon] = useState('folder')
    return <IconPicker value={icon} onChange={setIcon} selectSize="md" />
  },
}

export const Disabled: Story = {
  render: () => <IconPicker value="star" onChange={() => {}} disabled />,
}
