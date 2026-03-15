import type { ReactNode } from 'react'

export interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  children: ReactNode
  htmlFor?: string
  className?: string
}

export function FormField({
  label,
  error,
  required = false,
  children,
  htmlFor,
  className = '',
}: FormFieldProps) {
  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      {label !== undefined && label !== '' && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
          {required && (
            <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
