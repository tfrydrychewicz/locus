import { fireEvent, render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input.js'

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Type here..." />)
    expect(screen.getByPlaceholderText('Type here...')).toBeDefined()
  })

  it('fires onChange', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('displays error message', () => {
    render(<Input error="Required field" id="name" />)
    expect(screen.getByRole('alert').textContent).toBe('Required field')
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input error="Bad input" id="test" />)
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
  })

  it('renders icon', () => {
    const { container } = render(<Input icon={Search} />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input disabled placeholder="Disabled" />)
    const input = screen.getByPlaceholderText('Disabled') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })
})
