import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { EditableText } from './EditableText.js'

const meta = {
  title: 'Atoms/EditableText',
  component: EditableText,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 p-8 bg-[var(--color-bg)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditableText>

export default meta
type Story = StoryObj<typeof meta>

function EditableTextWrapper() {
  const [value, setValue] = useState('Alice Johnson')
  return (
    <EditableText value={value} onChange={setValue} placeholder="Untitled" editLabel="Edit name" />
  )
}

export const Default: Story = {
  render: () => <EditableTextWrapper />,
}

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <EditableText value={value} onChange={setValue} placeholder="Untitled" editLabel="Edit" />
    )
  },
}

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState('Project Alpha')
    return (
      <EditableText
        value={value}
        onChange={setValue}
        placeholder="Untitled"
        size="lg"
        editLabel="Edit"
      />
    )
  },
}
