import { mergeAttributes, Node } from '@tiptap/core'

export type CalloutType = 'info' | 'warning' | 'success' | 'danger'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type: CalloutType) => ReturnType
      toggleCallout: (type: CalloutType) => ReturnType
    }
  }
}

const typeStyles: Record<CalloutType, string> = {
  info: 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]',
  warning: 'border-[var(--color-warning)] bg-[rgba(245,158,11,0.1)]',
  success: 'border-[var(--color-success)] bg-[rgba(52,211,153,0.1)]',
  danger: 'border-[var(--color-danger)] bg-[var(--color-danger-subtle)]',
}

const typeLabels: Record<CalloutType, string> = {
  info: 'Info',
  warning: 'Warning',
  success: 'Success',
  danger: 'Danger',
}

export const CalloutExtension = Node.create({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {}
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (el: HTMLElement) => (el.getAttribute('data-type') as CalloutType) ?? 'info',
        renderHTML: (attrs: { type: CalloutType }) => ({ 'data-type': attrs.type }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
        getAttrs: (el: HTMLElement) => ({
          type: (el.getAttribute('data-type') ?? 'info') as CalloutType,
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return [
      'div',
      mergeAttributes({
        'data-callout': '',
        class: 'callout-block border-l-4 rounded-r-lg px-3 py-2 my-2',
        'data-type': (HTMLAttributes['data-type'] ?? 'info') as CalloutType,
      }),
      0,
    ]
  },

  addNodeView() {
    return ({ node }: { node: { attrs: { type?: CalloutType } } }) => {
      const dom = document.createElement('div')
      const type = (node.attrs.type as CalloutType) ?? 'info'
      dom.setAttribute('data-callout', '')
      dom.className = `callout-block border-l-4 rounded-r-lg px-3 py-2 my-2 ${typeStyles[type]}`
      dom.setAttribute('data-callout-type', type)

      const label = document.createElement('span')
      label.className =
        'callout-label block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1'
      label.contentEditable = 'false'
      label.textContent = typeLabels[type]

      const content = document.createElement('div')
      content.className = 'callout-content'

      dom.appendChild(label)
      dom.appendChild(content)

      return { dom, contentDOM: content }
    }
  },

  addCommands() {
    return {
      setCallout:
        (type: CalloutType) =>
        ({ commands }: { commands: { wrapIn: (name: string, attrs: object) => boolean } }) =>
          commands.wrapIn(this.name, { type }),

      toggleCallout:
        (type: CalloutType) =>
        ({ commands }: { commands: { toggleWrap: (name: string, attrs: object) => boolean } }) =>
          commands.toggleWrap(this.name, { type }),
    }
  },
})
