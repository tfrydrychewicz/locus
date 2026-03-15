import type { Editor } from '@tiptap/react'
import { useCallback, useEffect, useState } from 'react'

export interface SlashCommandItem {
  id: string
  label: string
  onSelect: (editor: Editor) => void
}

const DEFAULT_ITEMS: SlashCommandItem[] = [
  {
    id: 'h1',
    label: 'Heading 1',
    onSelect: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    label: 'Heading 2',
    onSelect: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    label: 'Heading 3',
    onSelect: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'task',
    label: 'Task list',
    onSelect: (e) => e.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'date',
    label: 'Date',
    onSelect: (e) => {
      const date = new Date().toISOString().slice(0, 10)
      e.chain().focus().insertContent(date).run()
    },
  },
  {
    id: 'bullet',
    label: 'Bullet list',
    onSelect: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'code',
    label: 'Code block',
    onSelect: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'quote',
    label: 'Quote',
    onSelect: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'callout-info',
    label: 'Callout (info)',
    onSelect: (e) =>
      e
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { type: 'info' },
          content: [{ type: 'paragraph' }],
        })
        .run(),
  },
  {
    id: 'callout-warning',
    label: 'Callout (warning)',
    onSelect: (e) =>
      e
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { type: 'warning' },
          content: [{ type: 'paragraph' }],
        })
        .run(),
  },
  {
    id: 'callout-success',
    label: 'Callout (success)',
    onSelect: (e) =>
      e
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { type: 'success' },
          content: [{ type: 'paragraph' }],
        })
        .run(),
  },
  {
    id: 'callout-danger',
    label: 'Callout (danger)',
    onSelect: (e) =>
      e
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { type: 'danger' },
          content: [{ type: 'paragraph' }],
        })
        .run(),
  },
]

export interface SlashCommandMenuProps {
  editor: Editor | null
  onClose: () => void
}

export function SlashCommandMenu({ editor, onClose }: SlashCommandMenuProps) {
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState<SlashCommandItem[]>(DEFAULT_ITEMS)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [range, setRange] = useState<{ from: number; to: number } | null>(null)

  useEffect(() => {
    if (!editor) return
    const onUpdate = () => {
      const { state } = editor
      const { selection } = state
      const $from = selection.$from
      const blockStart = $from.start($from.depth)
      const textBefore = state.doc.textBetween(blockStart, selection.from, '\n', '\u00a0')
      if (textBefore.startsWith('/')) {
        const query = textBefore.slice(1).toLowerCase()
        setFiltered(
          query
            ? DEFAULT_ITEMS.filter((i) => i.label.toLowerCase().includes(query))
            : DEFAULT_ITEMS,
        )
        setSelectedIndex(0)
        setRange({ from: blockStart, to: selection.from })
        setOpen(true)
      } else {
        setOpen(false)
      }
    }
    editor.on('selectionUpdate', onUpdate)
    editor.on('transaction', onUpdate)
    return () => {
      editor.off('selectionUpdate', onUpdate)
      editor.off('transaction', onUpdate)
    }
  }, [editor])

  const handleSelect = useCallback(
    (item: SlashCommandItem) => {
      if (!editor || !range) return
      editor.chain().focus().deleteRange(range).run()
      item.onSelect(editor)
      setOpen(false)
      onClose()
    },
    [editor, range, onClose],
  )

  useEffect(() => {
    if (!open || !editor) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = filtered[selectedIndex] ?? filtered[0]
        if (item) handleSelect(item)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, editor, filtered, selectedIndex, handleSelect, onClose])

  if (!open || filtered.length === 0) return null

  return (
    <div
      className="absolute z-50 min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-lg"
      role="listbox"
    >
      {filtered.map((item, i) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={i === selectedIndex}
          className={`w-full px-3 py-2 text-left text-sm ${
            i === selectedIndex
              ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]'
          }`}
          onMouseEnter={() => setSelectedIndex(i)}
          onClick={() => handleSelect(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
