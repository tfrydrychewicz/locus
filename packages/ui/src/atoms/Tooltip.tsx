import { type ReactNode, useCallback, useRef, useState } from 'react'

export interface TooltipProps {
  content: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode
  className?: string
}

const positionStyles: Record<NonNullable<TooltipProps['position']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function Tooltip({ content, position = 'top', children, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), 200)
  }, [])

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }, [])

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: tooltip wrapper delegates focus to children
    <div
      className={['relative inline-flex', className].filter(Boolean).join(' ')}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={[
            'pointer-events-none absolute z-50 whitespace-nowrap',
            'rounded-md bg-[var(--color-text-primary)] px-2.5 py-1.5',
            'text-xs text-[var(--color-bg)]',
            'shadow-lg',
            positionStyles[position],
          ].join(' ')}
        >
          {content}
        </div>
      )}
    </div>
  )
}
