import { describe, expect, it } from 'vitest'
import { colors } from './colors.js'

describe('colors', () => {
  it('exports dark theme colors', () => {
    expect(colors.dark.bg.DEFAULT).toBe('#1a1a1a')
    expect(colors.dark.bg.sidebar).toBe('#161616')
    expect(colors.dark.bg.surface).toBe('#242424')
    expect(colors.dark.bg.elevated).toBe('#2a2a2a')
    expect(colors.dark.border.DEFAULT).toBe('#2e2e2e')
    expect(colors.dark.text.primary).toBe('#e8e8e8')
    expect(colors.dark.text.secondary).toBe('#888888')
    expect(colors.dark.text.muted).toBe('#666666')
  })

  it('exports light theme colors', () => {
    expect(colors.light.bg.DEFAULT).toBe('#ffffff')
    expect(colors.light.bg.sidebar).toBe('#f5f5f5')
    expect(colors.light.bg.surface).toBe('#fafafa')
    expect(colors.light.bg.elevated).toBe('#ffffff')
    expect(colors.light.border.DEFAULT).toBe('#e2e2e2')
    expect(colors.light.text.primary).toBe('#1a1a1a')
    expect(colors.light.text.secondary).toBe('#555555')
    expect(colors.light.text.muted).toBe('#888888')
  })

  it('exports theme-independent semantic colors', () => {
    expect(colors.accent.DEFAULT).toBe('#5b8def')
    expect(colors.danger.DEFAULT).toBe('#ef4444')
    expect(colors.warning.DEFAULT).toBe('#f59e0b')
    expect(colors.success.DEFAULT).toBe('#34d399')
    expect(colors.note.DEFAULT).toBe('#50c0a0')
  })

  it('exports energy state colors', () => {
    expect(colors.energy.high).toBe('#34d399')
    expect(colors.energy.medium).toBe('#f59e0b')
    expect(colors.energy.low).toBe('#ef4444')
    expect(colors.energy.depleted).toBe('#666666')
  })

  it('exports cognitive mode colors', () => {
    expect(colors.mode.hyperfocus).toBe('#a78bfa')
    expect(colors.mode.flow).toBe('#34d399')
    expect(colors.mode.drift).toBe('#f59e0b')
    expect(colors.mode.depleted).toBe('#666666')
    expect(colors.mode.dysregulated).toBe('#ef4444')
    expect(colors.mode.startup).toBe('#5b8def')
  })

  it('has matching semantic keys across light and dark', () => {
    const lightKeys = Object.keys(colors.light)
    const darkKeys = Object.keys(colors.dark)
    expect(lightKeys).toEqual(darkKeys)

    for (const key of lightKeys) {
      const lightSubKeys = Object.keys(colors.light[key as keyof typeof colors.light])
      const darkSubKeys = Object.keys(colors.dark[key as keyof typeof colors.dark])
      expect(lightSubKeys).toEqual(darkSubKeys)
    }
  })
})
