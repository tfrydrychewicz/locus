import { Button } from '@locus/ui'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  ChevronDown,
  Code,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Type,
} from 'lucide-react'
import { useCallback, useState } from 'react'

const Separator = () => <div className="h-5 w-px bg-[var(--color-border)]" aria-hidden="true" />

const menuItemClass = 'w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-bg-surface)]'
const menuClass =
  'absolute left-0 top-full z-20 mt-0.5 min-w-[140px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-lg'

export interface EditorToolbarProps {
  editor: Editor | null
  className?: string
}

export function EditorToolbar({ editor, className = '' }: EditorToolbarProps) {
  const [headingOpen, setHeadingOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)

  const run = useCallback(
    (fn: (e: Editor) => void) => {
      if (editor) fn(editor)
    },
    [editor],
  )

  const closeAll = useCallback(() => {
    setHeadingOpen(false)
    setListOpen(false)
    setBlockOpen(false)
  }, [])

  if (!editor) return null

  return (
    <div
      className={`flex flex-wrap items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2 py-1 ${className}`.trim()}
      role="toolbar"
      aria-label="Formatting"
    >
      {/* Text formatting */}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        aria-pressed={editor.isActive('bold')}
        onClick={() => run((e) => e.chain().focus().toggleBold().run())}
      >
        <Bold size={14} aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        aria-pressed={editor.isActive('italic')}
        onClick={() => run((e) => e.chain().focus().toggleItalic().run())}
      >
        <Type size={14} className="italic" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        aria-pressed={editor.isActive('strike')}
        onClick={() => run((e) => e.chain().focus().toggleStrike().run())}
      >
        <Strikethrough size={14} aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        aria-pressed={editor.isActive('code')}
        onClick={() => run((e) => e.chain().focus().toggleCode().run())}
      >
        <Code size={14} aria-hidden />
      </Button>

      <Separator />

      {/* Headings dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setHeadingOpen((o) => !o)
            setListOpen(false)
            setBlockOpen(false)
          }}
          aria-expanded={headingOpen}
          aria-haspopup="menu"
        >
          <span className="text-xs font-medium">Heading</span>
          <ChevronDown size={12} aria-hidden />
        </Button>
        {headingOpen && (
          <>
            <div className="fixed inset-0 z-10" aria-hidden="true" onClick={closeAll} />
            <div role="menu" className={menuClass}>
              {([1, 2, 3] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => {
                    run((e) => e.chain().focus().toggleHeading({ level }).run())
                    setHeadingOpen(false)
                  }}
                >
                  Heading {level}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Lists dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setListOpen((o) => !o)
            setHeadingOpen(false)
            setBlockOpen(false)
          }}
          aria-expanded={listOpen}
          aria-haspopup="menu"
        >
          <List size={14} aria-hidden />
          <ChevronDown size={12} aria-hidden />
        </Button>
        {listOpen && (
          <>
            <div className="fixed inset-0 z-10" aria-hidden="true" onClick={closeAll} />
            <div role="menu" className={menuClass}>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  run((e) => e.chain().focus().toggleBulletList().run())
                  setListOpen(false)
                }}
              >
                Bullet list
              </button>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  run((e) => e.chain().focus().toggleOrderedList().run())
                  setListOpen(false)
                }}
              >
                <ListOrdered size={14} className="mr-1 inline" aria-hidden />
                Numbered list
              </button>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  run((e) => e.chain().focus().toggleTaskList().run())
                  setListOpen(false)
                }}
              >
                Task list
              </button>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Blocks dropdown */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setBlockOpen((o) => !o)
            setHeadingOpen(false)
            setListOpen(false)
          }}
          aria-expanded={blockOpen}
          aria-haspopup="menu"
        >
          <Quote size={14} aria-hidden />
          <ChevronDown size={12} aria-hidden />
        </Button>
        {blockOpen && (
          <>
            <div className="fixed inset-0 z-10" aria-hidden="true" onClick={closeAll} />
            <div role="menu" className={`${menuClass} min-w-[160px]`}>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  run((e) => e.chain().focus().toggleBlockquote().run())
                  setBlockOpen(false)
                }}
              >
                Quote
              </button>
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => {
                  run((e) => e.chain().focus().toggleCodeBlock().run())
                  setBlockOpen(false)
                }}
              >
                Code block
              </button>
              {(['info', 'warning', 'success', 'danger'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  role="menuitem"
                  className={`${menuItemClass} capitalize`}
                  onClick={() => {
                    run((e) =>
                      e
                        .chain()
                        .focus()
                        .insertContent({
                          type: 'callout',
                          attrs: { type },
                          content: [{ type: 'paragraph' }],
                        })
                        .run(),
                    )
                    setBlockOpen(false)
                  }}
                >
                  Callout ({type})
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Date */}
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() =>
          run((e) => e.chain().focus().insertContent(new Date().toISOString().slice(0, 10)).run())
        }
      >
        <span className="text-xs">Date</span>
      </Button>
    </div>
  )
}
