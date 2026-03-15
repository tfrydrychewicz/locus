import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string
  icon?: LucideIcon
  inputSize?: 'sm' | 'md'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, icon: Icon, inputSize = 'md', className = '', disabled, ...rest },
  ref,
) {
  const sizeClass = inputSize === 'sm' ? 'h-8 text-xs' : 'h-9 text-sm'

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
            <Icon
              size={inputSize === 'sm' ? 14 : 16}
              className="text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={[
            'w-full rounded-lg border bg-[var(--color-bg-surface)] px-3',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
            'transition-colors duration-150',
            'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]',
            Icon ? 'pl-8' : '',
            sizeClass,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${rest.id ?? 'input'}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p
          id={`${rest.id ?? 'input'}-error`}
          className="text-xs text-[var(--color-danger)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
})
