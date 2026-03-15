export type DateLike = Date | string | number

function toDate(input: DateLike): Date {
  if (input instanceof Date) return input
  return new Date(input)
}

export function formatDate(input: DateLike, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(toDate(input))
}

export function formatDateTime(input: DateLike, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(input))
}

export function formatTime(input: DateLike, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(input))
}

export function formatRelative(input: DateLike, locale = 'en-US'): string {
  const date = toDate(input)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHr = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHr / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute')
  if (Math.abs(diffHr) < 24) return rtf.format(-diffHr, 'hour')
  if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, 'day')

  return formatDate(input, locale)
}

export function startOfDay(input: DateLike): Date {
  const d = toDate(input)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function endOfDay(input: DateLike): Date {
  const d = toDate(input)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export function startOfWeek(input: DateLike, weekStartsOn: 0 | 1 = 1): Date {
  const d = toDate(input)
  const day = d.getDay()
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
  const result = new Date(d)
  result.setDate(d.getDate() - diff)
  return startOfDay(result)
}

export function addDays(input: DateLike, days: number): Date {
  const d = toDate(input)
  const result = new Date(d)
  result.setDate(d.getDate() + days)
  return result
}

export function addMinutes(input: DateLike, minutes: number): Date {
  const d = toDate(input)
  return new Date(d.getTime() + minutes * 60_000)
}

export function addHours(input: DateLike, hours: number): Date {
  const d = toDate(input)
  return new Date(d.getTime() + hours * 3_600_000)
}

export function isSameDay(a: DateLike, b: DateLike): boolean {
  const da = toDate(a)
  const db = toDate(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export function isToday(input: DateLike): boolean {
  return isSameDay(input, new Date())
}

export function isBefore(a: DateLike, b: DateLike): boolean {
  return toDate(a).getTime() < toDate(b).getTime()
}

export function isAfter(a: DateLike, b: DateLike): boolean {
  return toDate(a).getTime() > toDate(b).getTime()
}

export function isWithinRange(date: DateLike, start: DateLike, end: DateLike): boolean {
  const t = toDate(date).getTime()
  return t >= toDate(start).getTime() && t <= toDate(end).getTime()
}

export function differenceInMinutes(a: DateLike, b: DateLike): number {
  return Math.round((toDate(a).getTime() - toDate(b).getTime()) / 60_000)
}

export function differenceInHours(a: DateLike, b: DateLike): number {
  return Math.round((toDate(a).getTime() - toDate(b).getTime()) / 3_600_000)
}

export function differenceInDays(a: DateLike, b: DateLike): number {
  return Math.round((toDate(a).getTime() - toDate(b).getTime()) / 86_400_000)
}

export function toISODateString(input: DateLike): string {
  const d = toDate(input)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
