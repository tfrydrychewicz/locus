import { CheckCircle, XCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface QueryFieldEditorProps {
  value: string
  onChange: (value: string) => void
  /** Called to validate the query. Returns an error string on failure, null/undefined on success. */
  onValidate?: (query: string) => Promise<string | null | undefined>
  placeholder?: string
  disabled?: boolean
  labels?: {
    validSuffix?: string
    syntaxError?: string
  }
  className?: string
}

const DEFAULTS = {
  validSuffix: 'Valid',
  syntaxError: 'Syntax error',
}

const VALIDATE_DEBOUNCE_MS = 400

export function QueryFieldEditor({
  value,
  onChange,
  onValidate,
  placeholder = "e.g. entity_type = 'person' and name contains 'alice'",
  disabled = false,
  labels: labelsProp,
  className = '',
}: QueryFieldEditorProps) {
  const L = { ...DEFAULTS, ...labelsProp }
  const [error, setError] = useState<string | null>(null)
  const [valid, setValid] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onValidateRef = useRef(onValidate)
  onValidateRef.current = onValidate

  const validate = useCallback(
    async (q: string) => {
      if (!onValidateRef.current || !q.trim()) {
        setError(null)
        setValid(false)
        return
      }
      const err = await onValidateRef.current(q)
      if (err) {
        setError(`${L.syntaxError}: ${err}`)
        setValid(false)
      } else {
        setError(null)
        setValid(true)
      }
    },
    [L.syntaxError],
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    onChange(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      void validate(next)
    }, VALIDATE_DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const borderColor = error
    ? 'border-[var(--color-danger,#ef4444)] focus:ring-[var(--color-danger,#ef4444)]'
    : valid
      ? 'border-[var(--color-success,#10b981)] focus:ring-[var(--color-success,#10b981)]'
      : 'border-[var(--color-border)] focus:ring-[var(--color-accent)]'

  return (
    <div className={['flex flex-col gap-1', className].filter(Boolean).join(' ')}>
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          spellCheck={false}
          aria-label="LQL query"
          aria-invalid={!!error}
          className={[
            'w-full resize-none rounded-md border bg-[var(--color-bg-surface)]',
            'px-3 py-2 font-mono text-xs text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-muted)]',
            'outline-none focus:ring-1',
            'disabled:opacity-50',
            borderColor,
          ].join(' ')}
        />

        {/* Validation indicator */}
        {value.trim() && (
          <div className="absolute right-2.5 top-2.5 pointer-events-none">
            {error ? (
              <XCircle size={14} className="text-[var(--color-danger,#ef4444)]" aria-hidden />
            ) : valid ? (
              <CheckCircle size={14} className="text-[var(--color-success,#10b981)]" aria-hidden />
            ) : null}
          </div>
        )}
      </div>

      {/* Status row */}
      {error && (
        <p className="text-xs text-[var(--color-danger,#ef4444)]" role="alert">
          {error}
        </p>
      )}
      {!error && valid && value.trim() && (
        <p className="flex items-center gap-1 text-xs text-[var(--color-success,#10b981)]">
          <CheckCircle size={11} aria-hidden />
          {L.validSuffix}
        </p>
      )}
    </div>
  )
}
