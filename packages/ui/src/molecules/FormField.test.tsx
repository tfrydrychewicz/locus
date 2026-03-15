import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from '../atoms/Input.js'
import { FormField } from './FormField.js'

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Title" htmlFor="title">
        <Input id="title" />
      </FormField>,
    )
    expect(screen.getByText('Title')).toBeDefined()
  })

  it('associates label with control via htmlFor', () => {
    render(
      <FormField label="Title" htmlFor="title">
        <Input id="title" />
      </FormField>,
    )
    const label = screen.getByText('Title')
    expect(label.getAttribute('for')).toBe('title')
  })

  it('displays error message', () => {
    render(
      <FormField label="Email" error="Invalid email">
        <Input id="email" />
      </FormField>,
    )
    expect(screen.getByRole('alert').textContent).toBe('Invalid email')
  })

  it('shows required indicator when required is true', () => {
    render(
      <FormField label="Name" required htmlFor="name">
        <Input id="name" />
      </FormField>,
    )
    expect(screen.getByText('*')).toBeDefined()
  })

  it('renders without label', () => {
    const { container } = render(
      <FormField>
        <Input id="standalone" />
      </FormField>,
    )
    expect(container.querySelector('label')).toBeNull()
  })
})
