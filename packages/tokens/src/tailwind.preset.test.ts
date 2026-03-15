import { describe, expect, it } from 'vitest'
import { colors } from './colors.js'
import { generateThemeCSS, tailwindTheme, themeVars } from './tailwind.preset.js'

describe('themeVars', () => {
  it('defines all expected CSS custom properties for light', () => {
    const keys = Object.keys(themeVars.light)
    expect(keys).toContain('--color-bg')
    expect(keys).toContain('--color-bg-sidebar')
    expect(keys).toContain('--color-bg-surface')
    expect(keys).toContain('--color-bg-elevated')
    expect(keys).toContain('--color-border')
    expect(keys).toContain('--color-text-primary')
    expect(keys).toContain('--color-text-secondary')
    expect(keys).toContain('--color-text-muted')
  })

  it('has matching keys across light and dark', () => {
    expect(Object.keys(themeVars.light)).toEqual(Object.keys(themeVars.dark))
  })

  it('light values match light color tokens', () => {
    expect(themeVars.light['--color-bg']).toBe(colors.light.bg.DEFAULT)
    expect(themeVars.light['--color-text-primary']).toBe(colors.light.text.primary)
  })

  it('dark values match dark color tokens', () => {
    expect(themeVars.dark['--color-bg']).toBe(colors.dark.bg.DEFAULT)
    expect(themeVars.dark['--color-text-primary']).toBe(colors.dark.text.primary)
  })
})

describe('tailwindTheme', () => {
  it('maps semantic colors to CSS variables', () => {
    expect(tailwindTheme.colors.bg.DEFAULT).toBe('var(--color-bg)')
    expect(tailwindTheme.colors.text.primary).toBe('var(--color-text-primary)')
    expect(tailwindTheme.colors.border.DEFAULT).toBe('var(--color-border)')
  })

  it('includes theme-independent colors directly', () => {
    expect(tailwindTheme.colors.accent.DEFAULT).toBe('#5b8def')
    expect(tailwindTheme.colors.danger.DEFAULT).toBe('#ef4444')
    expect(tailwindTheme.colors.energy.high).toBe('#34d399')
    expect(tailwindTheme.colors.mode.hyperfocus).toBe('#a78bfa')
  })

  it('includes spacing tokens', () => {
    expect(tailwindTheme.spacing.xs).toBe('4px')
    expect(tailwindTheme.spacing['3xl']).toBe('48px')
  })

  it('includes typography tokens', () => {
    expect(tailwindTheme.fontFamily.sans).toContain('Inter')
    expect(tailwindTheme.fontSize.base).toBe('14px')
  })

  it('includes layout dimensions', () => {
    expect(tailwindTheme.width.sidebar).toBe('200px')
    expect(tailwindTheme.maxWidth.editor).toBe('720px')
  })
})

describe('generateThemeCSS', () => {
  it('produces valid CSS with :root and .dark blocks', () => {
    const css = generateThemeCSS()
    expect(css).toContain(':root {')
    expect(css).toContain('.dark {')
  })

  it('includes all CSS custom properties', () => {
    const css = generateThemeCSS()
    for (const key of Object.keys(themeVars.light)) {
      expect(css).toContain(key)
    }
  })

  it('uses light values in :root', () => {
    const css = generateThemeCSS()
    const rootBlock = css.split('.dark')[0]
    expect(rootBlock).toContain(colors.light.bg.DEFAULT)
    expect(rootBlock).toContain(colors.light.text.primary)
  })

  it('uses dark values in .dark', () => {
    const css = generateThemeCSS()
    const darkBlock = css.split('.dark')[1]
    expect(darkBlock).toContain(colors.dark.bg.DEFAULT)
    expect(darkBlock).toContain(colors.dark.text.primary)
  })
})
