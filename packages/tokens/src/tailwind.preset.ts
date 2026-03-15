import { animation } from './animation.js'
import { colors } from './colors.js'
import { layout } from './layout.js'
import { spacing } from './spacing.js'
import { typography } from './typography.js'

/**
 * CSS custom properties for theme-dependent colors.
 * Light values are the default; dark values apply under `.dark` on the root element.
 */
export const themeVars = {
  light: {
    '--color-bg': colors.light.bg.DEFAULT,
    '--color-bg-sidebar': colors.light.bg.sidebar,
    '--color-bg-surface': colors.light.bg.surface,
    '--color-bg-elevated': colors.light.bg.elevated,
    '--color-border': colors.light.border.DEFAULT,
    '--color-text-primary': colors.light.text.primary,
    '--color-text-secondary': colors.light.text.secondary,
    '--color-text-muted': colors.light.text.muted,
  },
  dark: {
    '--color-bg': colors.dark.bg.DEFAULT,
    '--color-bg-sidebar': colors.dark.bg.sidebar,
    '--color-bg-surface': colors.dark.bg.surface,
    '--color-bg-elevated': colors.dark.bg.elevated,
    '--color-border': colors.dark.border.DEFAULT,
    '--color-text-primary': colors.dark.text.primary,
    '--color-text-secondary': colors.dark.text.secondary,
    '--color-text-muted': colors.dark.text.muted,
  },
} as const

/**
 * Tailwind v4 `@theme` values for extending the design system.
 * Used via `@config` directive or programmatically with the Vite plugin.
 */
export const tailwindTheme = {
  colors: {
    bg: {
      DEFAULT: 'var(--color-bg)',
      sidebar: 'var(--color-bg-sidebar)',
      surface: 'var(--color-bg-surface)',
      elevated: 'var(--color-bg-elevated)',
    },
    border: {
      DEFAULT: 'var(--color-border)',
    },
    text: {
      primary: 'var(--color-text-primary)',
      secondary: 'var(--color-text-secondary)',
      muted: 'var(--color-text-muted)',
    },
    accent: colors.accent,
    danger: colors.danger,
    warning: colors.warning,
    success: colors.success,
    note: colors.note,
    energy: colors.energy,
    mode: colors.mode,
  },
  spacing,
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  lineHeight: typography.lineHeight,
  transitionDuration: animation.duration,
  transitionTimingFunction: animation.easing,
  width: {
    sidebar: layout.sidebar.width,
    panel: layout.panel.width,
    chat: layout.chat.width,
  },
  maxWidth: {
    editor: layout.editor.maxWidth,
  },
} as const

/**
 * Generates a CSS string with theme custom properties.
 * Inject this into the app's global stylesheet or <style> tag.
 */
export function generateThemeCSS(): string {
  const lightVars = Object.entries(themeVars.light)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  const darkVars = Object.entries(themeVars.dark)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  return `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}\n`
}
