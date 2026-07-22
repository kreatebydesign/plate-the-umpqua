import { PLATE_OS_TIMEZONE } from './constants'

const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: PLATE_OS_TIMEZONE,
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const shortDateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: PLATE_OS_TIMEZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const monthDayFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: PLATE_OS_TIMEZONE,
  month: 'short',
  day: 'numeric',
})

/**
 * Start of "today" in America/Los_Angeles as a UTC Date suitable for Mongo comparisons.
 */
export function startOfTodayInTimezone(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PLATE_OS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)

  // Construct noon UTC then adjust via formatter offset approximation:
  // Use a stable approach: interpret Y-M-D as LA local midnight via Temporal-less trick.
  const asUtcGuess = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const laParts = new Intl.DateTimeFormat('en-US', {
    timeZone: PLATE_OS_TIMEZONE,
    hour: '2-digit',
    hour12: false,
  }).formatToParts(asUtcGuess)
  const hourInLa = Number(laParts.find((p) => p.type === 'hour')?.value || 12)
  // Move from noon LA-equivalent toward local midnight
  const ms = asUtcGuess.getTime() - hourInLa * 60 * 60 * 1000
  return new Date(ms)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export function formatLongDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return dateFmt.format(d)
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return shortDateFmt.format(d)
}

export function formatMonthDay(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return monthDayFmt.format(d)
}

export function greetingForHour(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: PLATE_OS_TIMEZONE,
      hour: 'numeric',
      hour12: false,
    }).format(now),
  )

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function firstNameFrom(fullName?: string | null, email?: string | null): string {
  if (fullName?.trim()) {
    return fullName.trim().split(/\s+/)[0] || 'there'
  }
  if (email?.includes('@')) {
    return email.split('@')[0] || 'there'
  }
  return 'there'
}
