export const layout = {
  sidebar: { width: '200px' },
  panel: { width: '360px' },
  chat: { width: '360px' },
  editor: { maxWidth: '720px' },
} as const

export type Layout = typeof layout
