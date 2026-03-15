import { describe, expect, it } from 'vitest'
import { animation } from './animation.js'
import { layout } from './layout.js'
import { spacing } from './spacing.js'
import { typography } from './typography.js'

describe('spacing', () => {
  it('exports all spacing values as pixel strings', () => {
    const values = Object.values(spacing)
    for (const v of values) {
      expect(v).toMatch(/^\d+px$/)
    }
  })

  it('has expected scale keys', () => {
    expect(Object.keys(spacing)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'])
  })
})

describe('typography', () => {
  it('exports font families', () => {
    expect(typography.fontFamily.sans).toContain('Inter')
    expect(typography.fontFamily.mono).toContain('JetBrains Mono')
  })

  it('exports font sizes as pixel strings', () => {
    for (const v of Object.values(typography.fontSize)) {
      expect(v).toMatch(/^\d+px$/)
    }
  })

  it('exports numeric font weights', () => {
    for (const v of Object.values(typography.fontWeight)) {
      expect(typeof v).toBe('number')
      expect(v).toBeGreaterThanOrEqual(100)
      expect(v).toBeLessThanOrEqual(900)
    }
  })

  it('exports numeric line heights', () => {
    for (const v of Object.values(typography.lineHeight)) {
      expect(typeof v).toBe('number')
      expect(v).toBeGreaterThan(0)
    }
  })
})

describe('animation', () => {
  it('exports durations as ms strings', () => {
    for (const v of Object.values(animation.duration)) {
      expect(v).toMatch(/^\d+ms$/)
    }
  })

  it('exports easing functions as cubic-bezier strings', () => {
    for (const v of Object.values(animation.easing)) {
      expect(v).toMatch(/^cubic-bezier\(/)
    }
  })
})

describe('layout', () => {
  it('exports layout dimensions as pixel strings', () => {
    expect(layout.sidebar.width).toMatch(/^\d+px$/)
    expect(layout.panel.width).toMatch(/^\d+px$/)
    expect(layout.chat.width).toMatch(/^\d+px$/)
    expect(layout.editor.maxWidth).toMatch(/^\d+px$/)
  })
})
