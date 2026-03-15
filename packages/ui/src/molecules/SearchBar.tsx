import { Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '../atoms/Input.js'
import { Spinner } from '../atoms/Spinner.js'

const DEBOUNCE_MS = 300

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  loading?: boolean
  className?: string
  'aria-label'?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  loading = false,
  className = '',
  'aria-label': ariaLabel = 'Search',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const flushDebounced = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return flushDebounced
  }, [flushDebounced])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setLocalValue(next)
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      onChangeRef.current(next)
    }, DEBOUNCE_MS)
  }, [])

  return (
    <div className={['relative flex items-center', className].filter(Boolean).join(' ')}>
      <Input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        icon={Search}
        disabled={loading}
        className="pr-9"
        aria-label={ariaLabel}
      />
      {loading && (
        <div
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        >
          <Spinner size="sm" />
        </div>
      )}
    </div>
  )
}
