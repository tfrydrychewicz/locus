import { render } from '@testing-library/react'
import { Home, Zap } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon.js'

describe('Icon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Icon icon={Home} />)
    expect(container.querySelector('svg')).toBeDefined()
  })

  it('applies aria-hidden by default', () => {
    const { container } = render(<Icon icon={Home} />)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('applies custom className', () => {
    const { container } = render(<Icon icon={Zap} className="text-red-500" />)
    expect(
      container.querySelector('svg')?.className.baseVal ||
        container.querySelector('svg')?.getAttribute('class'),
    ).toContain('text-red-500')
  })
})
