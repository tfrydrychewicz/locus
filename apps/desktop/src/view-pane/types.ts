export type ViewContent = { type: 'empty' } | { type: 'note'; noteId: string }

/** A single pane within a tab — shows exactly one piece of content. */
export interface PaneState {
  id: string
  label: string
  content: ViewContent
}

/** A top-level tab shown in the app header. Contains one or more split panes. */
export interface TabState {
  id: string
  /** Label shown in the top bar. Mirrors the first/active pane's note title. */
  label: string
  panes: PaneState[]
  activePaneId: string | null
}
