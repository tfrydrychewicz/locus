import { Pencil } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Size of the displayed text */
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Accessible label for the edit button */
  editLabel?: string
}

export function EditableText({
  value,
  onChange,
  placeholder = 'Untitled',
  size = 'md',
  className = '',
  editLabel = 'Edit',
}: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(value)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, value])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed !== value) {
      onChange(trimmed)
    }
    setEditing(false)
  }, [draft, value, onChange])

  const cancel = useCallback(() => {
    setDraft(value)
    setEditing(false)
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commit()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancel()
      }
    },
    [commit, cancel],
  )

  const sizeClass =
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg font-semibold' : 'text-base font-medium'

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={[
          'min-w-0 flex-1 rounded border border-[var(--color-accent)] bg-[var(--color-bg-surface)]',
          'px-2 py-0.5 text-[var(--color-text-primary)]',
          'focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
          sizeClass,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={editLabel}
      />
    )
  }

  return (
    <div
      className={['flex min-w-0 flex-1 items-center gap-1.5', className].filter(Boolean).join(' ')}
    >
      <span className={`min-w-0 truncate ${sizeClass} text-[var(--color-text-primary)]`}>
        {value || placeholder}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 rounded p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
        aria-label={editLabel}
      >
        <Pencil size={14} aria-hidden />
      </button>
    </div>
  )
}
