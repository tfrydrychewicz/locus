import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner.js'

describe('Spinner', () => {
  it('renders with status role', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('has loading aria-label', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Loading')).toBeDefined()
  })

  it('renders an SVG', () => {
    const { container } = render(<Spinner />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('renders with spin animation', () => {
    const { container } = render(<Spinner size="lg" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('animate-spin')
  })
})
