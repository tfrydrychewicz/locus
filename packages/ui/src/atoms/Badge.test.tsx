import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge.js'

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeDefined()
  })

  it('renders with default variant', () => {
    const { container } = render(<Badge>Default</Badge>)
    expect(container.querySelector('span')?.className).toContain('border')
  })

  it('renders success variant', () => {
    render(<Badge variant="success">Done</Badge>)
    expect(screen.getByText('Done').className).toContain('success')
  })

  it('renders warning variant', () => {
    render(<Badge variant="warning">Pending</Badge>)
    expect(screen.getByText('Pending').className).toContain('warning')
  })

  it('renders danger variant', () => {
    render(<Badge variant="danger">Overdue</Badge>)
    expect(screen.getByText('Overdue').className).toContain('danger')
  })
})
