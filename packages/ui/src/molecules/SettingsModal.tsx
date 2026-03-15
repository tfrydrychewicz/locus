import type { ReactNode } from 'react'
import { Button } from '../atoms/Button.js'

export interface SettingsModalProps {
  /** Page/modal title shown in the header */
  title: string
  /** Left nav pane content (use SettingsNav) */
  nav: ReactNode
  /** Right content pane */
  content: ReactNode
  /** Label for the primary save button */
  saveLabel: string
  /** Label for the cancel/discard button */
  cancelLabel: string
  /** Whether there are unsaved pending changes */
  isDirty: boolean
  /** Short label shown near Save when isDirty (e.g. "Unsaved changes") */
  dirtyLabel?: string
  onSave: () => void
  onCancel: () => void
}

export function SettingsModal({
  title,
  nav,
  content,
  saveLabel,
  cancelLabel,
  isDirty,
  dirtyLabel,
  onSave,
  onCancel,
}: SettingsModalProps) {
  return (
    <div
      className="flex h-full flex-col bg-[var(--color-bg)]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {isDirty && dirtyLabel && (
          <span className="text-xs text-[var(--color-text-muted)]" aria-live="polite">
            {dirtyLabel}
          </span>
        )}
      </div>

      {/* Body: left nav + right content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left nav — fixed width */}
        <div className="w-[180px] shrink-0 overflow-y-auto border-r border-[var(--color-border)] px-2">
          {nav}
        </div>

        {/* Right content pane — scrollable */}
        <div className="min-w-0 flex-1 overflow-y-auto">{content}</div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--color-border)] px-5 py-3">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="primary" size="sm" disabled={!isDirty} onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}
