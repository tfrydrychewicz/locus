import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { EditorToolbar } from './EditorToolbar.js'
import { CalloutExtension } from './extensions/CalloutExtension.js'
import { CodeBlockWithPreviewExtension } from './extensions/CodeBlockWithPreview.js'

export interface NoteEditorProps {
  /** HTML content (TipTap/ProseMirror JSON or HTML string) */
  content: string
  onUpdate: (content: string, plainText: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

function stripHtmlToPlain(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent?.trim() ?? ''
}

export function NoteEditor({
  content,
  onUpdate,
  placeholder = 'Write something…',
  editable = true,
  className = '',
}: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CalloutExtension,
      CodeBlockWithPreviewExtension,
    ],
    content: content || '',
    editable,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-[var(--color-text-primary)]',
      },
      handleDOMEvents: {},
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const plain = stripHtmlToPlain(html)
      onUpdate(html, plain)
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (content !== current) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [editor, content])

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  return (
    <div
      className={[
        'note-editor relative flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <EditorToolbar editor={editor} />
      <div className="min-h-0 flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
