export const colors = {
  dark: {
    bg: { DEFAULT: '#1a1a1a', sidebar: '#161616', surface: '#242424', elevated: '#2a2a2a' },
    border: { DEFAULT: '#2e2e2e' },
    text: { primary: '#e8e8e8', secondary: '#888888', muted: '#666666' },
  },
  light: {
    bg: { DEFAULT: '#ffffff', sidebar: '#f5f5f5', surface: '#fafafa', elevated: '#ffffff' },
    border: { DEFAULT: '#e2e2e2' },
    text: { primary: '#1a1a1a', secondary: '#555555', muted: '#888888' },
  },

  accent: { DEFAULT: '#5b8def', hover: '#7aaeff', muted: 'rgba(91,141,239,0.1)' },
  danger: { DEFAULT: '#ef4444', subtle: 'rgba(239,68,68,0.1)' },
  warning: { DEFAULT: '#f59e0b' },
  success: { DEFAULT: '#34d399' },
  note: { DEFAULT: '#50c0a0' },

  energy: { high: '#34d399', medium: '#f59e0b', low: '#ef4444', depleted: '#666666' },

  mode: {
    hyperfocus: '#a78bfa',
    flow: '#34d399',
    drift: '#f59e0b',
    depleted: '#666666',
    dysregulated: '#ef4444',
    startup: '#5b8def',
  },
} as const

export type Colors = typeof colors
export type ThemeColors = typeof colors.dark
