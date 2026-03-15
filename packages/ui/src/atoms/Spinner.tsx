import { Loader2 } from 'lucide-react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const spinnerSizes: Record<NonNullable<SpinnerProps['size']>, number> = {
  sm: 16,
  md: 24,
  lg: 32,
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={['inline-flex items-center justify-center', className].filter(Boolean).join(' ')}
    >
      <Loader2
        size={spinnerSizes[size]}
        className="animate-spin text-[var(--color-accent)]"
        aria-hidden="true"
      />
    </div>
  )
}
