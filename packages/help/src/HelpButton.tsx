import { useCallback } from 'react'
import type { HelpTopicId } from './help-registry.js'
import { useHelp } from './useHelp.js'

interface HelpButtonProps {
  topic: HelpTopicId
  className?: string
  size?: 'sm' | 'md'
}

export function HelpButton({ topic, className = '', size = 'sm' }: HelpButtonProps) {
  const { toggleHelp } = useHelp()

  const handleClick = useCallback(() => {
    toggleHelp(topic)
  }, [topic, toggleHelp])

  const sizeClasses =
    size === 'sm'
      ? 'h-[22px] w-[22px] text-[11px] leading-none'
      : 'h-[28px] w-[28px] text-[13px] leading-none'

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'inline-flex items-center justify-center rounded-full',
        'border border-[var(--color-border)]',
        'text-[var(--color-text-muted)]',
        'hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]',
        'hover:bg-[var(--color-accent-muted)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
        'transition-all duration-150',
        'font-medium cursor-pointer select-none',
        sizeClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Open help"
      title="Help"
    >
      ?
    </button>
  )
}
