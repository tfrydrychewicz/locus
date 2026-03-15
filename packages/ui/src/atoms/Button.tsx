import type { LucideIcon } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  children?: ReactNode
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: [
    'bg-[var(--color-accent)] text-white',
    'hover:bg-[var(--color-accent-hover)]',
    'active:brightness-90',
  ].join(' '),
  secondary: [
    'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]',
    'border border-[var(--color-border)]',
    'hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-text-muted)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-text-secondary)]',
    'hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]',
  ].join(' '),
  danger: [
    'bg-[var(--color-danger)] text-white',
    'hover:brightness-110',
    'active:brightness-90',
  ].join(' '),
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-base gap-2.5 rounded-lg',
}

const iconSizes: Record<NonNullable<ButtonProps['size']>, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon: Icon,
  iconPosition = 'left',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading

  const iconEl = loading ? (
    <Loader2 size={iconSizes[size]} className="animate-spin" aria-hidden="true" />
  ) : Icon ? (
    <Icon size={iconSizes[size]} aria-hidden="true" />
  ) : null

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'cursor-pointer select-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {iconPosition === 'left' && iconEl}
      {children}
      {iconPosition === 'right' && iconEl}
    </button>
  )
}
