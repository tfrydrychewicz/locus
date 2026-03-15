import { i18n } from './instance.js'
import { DEFAULT_LOCALE } from './types.js'

function getLocale(): string {
  return i18n.language ?? DEFAULT_LOCALE
}

export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatDateTime(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(date))
}

export function formatTime(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(getLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | number | string): string {
  const now = Date.now()
  const target = new Date(date).getTime()
  const diffMs = now - target
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' })

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute')
  if (Math.abs(diffHr) < 24) return rtf.format(-diffHr, 'hour')
  if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, 'day')

  return formatDate(date)
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(getLocale(), options).format(value)
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(getLocale(), {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat(getLocale(), {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export function formatListJoin(items: string[]): string {
  return new Intl.ListFormat(getLocale(), { style: 'long', type: 'conjunction' }).format(items)
}
