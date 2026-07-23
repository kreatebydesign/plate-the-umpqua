/**
 * Post-event client feedback constants and pure helpers.
 */

import { PLATE_OS_TIMEZONE } from '@/lib/os/constants'

export const GOOGLE_REVIEW_URL =
  'https://g.page/r/CTOBZUoTQPynEBM/review' as const

/** Production env names — never set values from application code. */
export const FEEDBACK_AUTOMATION_ENABLED_ENV = 'FEEDBACK_AUTOMATION_ENABLED'
export const FEEDBACK_AUTOMATION_START_AT_ENV = 'FEEDBACK_AUTOMATION_START_AT'

export const FEEDBACK_TOKEN_TTL_MS = 45 * 24 * 60 * 60 * 1000
export const FEEDBACK_RETRY_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
export const FEEDBACK_BATCH_SIZE = 8
export const FEEDBACK_SEND_CLAIM_STALE_MS = 15 * 60 * 1000

export const FEEDBACK_COMMENT_MAX = 4000
export const FEEDBACK_STOOD_OUT_MAX = 800
export const FEEDBACK_DISPLAY_NAME_MAX = 80

export const FEEDBACK_CONSENT_VERSION = 'v1-2026-07'
export const FEEDBACK_CONSENT_WORDING =
  'Plate The Umpqua may share my comments as a testimonial.'

/** Booked / real experiences — excludes draft planning and archived. */
export const FEEDBACK_ELIGIBLE_STATUSES = [
  'confirmed',
  'vendorCoordination',
  'inProduction',
  'completed',
] as const

export type FeedbackEligibleStatus =
  (typeof FEEDBACK_ELIGIBLE_STATUSES)[number]

export function isFeedbackEligibleStatus(
  value: unknown,
): value is FeedbackEligibleStatus {
  return (
    typeof value === 'string' &&
    (FEEDBACK_ELIGIBLE_STATUSES as readonly string[]).includes(value)
  )
}

/**
 * Hard launch gate: only the exact string "true" enables automation.
 * Absent, empty, "1", "yes", or any other value keeps automation disabled.
 */
export function isFeedbackAutomationEnabledFlag(
  value: string | undefined | null,
): boolean {
  return value === 'true'
}

/**
 * Parse FEEDBACK_AUTOMATION_START_AT as a calendar day in America/Los_Angeles.
 * Accepts YYYY-MM-DD or a parseable ISO datetime (calendar day taken in LA).
 */
export function parseFeedbackAutomationStartAt(
  value: string | undefined | null,
): Date | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const dayOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dayOnly) {
    const year = Number(dayOnly[1])
    const month = Number(dayOnly[2])
    const day = Number(dayOnly[3])
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null
    // Store as UTC noon for stable calendar-day comparisons via LA formatter.
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  }

  const parsed = Date.parse(trimmed)
  if (!Number.isFinite(parsed)) return null
  return new Date(parsed)
}

export type FeedbackAutomationGate =
  | {
      status: 'disabled'
      enabled: false
      startAt: null
      startAtLabel: null
      reason: 'automation_disabled'
    }
  | {
      status: 'config_error'
      enabled: false
      startAt: null
      startAtLabel: null
      reason: 'missing_or_invalid_start_at'
    }
  | {
      status: 'enabled'
      enabled: true
      startAt: Date
      startAtLabel: string
      reason: null
    }

/**
 * Resolve launch-safety gate from server-only env.
 * Fail closed when enabled without a valid cutoff.
 */
export type FeedbackAutomationEnv = Record<string, string | undefined>

export function resolveFeedbackAutomationGate(
  env: FeedbackAutomationEnv = process.env,
): FeedbackAutomationGate {
  const enabledRaw = env[FEEDBACK_AUTOMATION_ENABLED_ENV]
  if (!isFeedbackAutomationEnabledFlag(enabledRaw)) {
    return {
      status: 'disabled',
      enabled: false,
      startAt: null,
      startAtLabel: null,
      reason: 'automation_disabled',
    }
  }

  const startAt = parseFeedbackAutomationStartAt(
    env[FEEDBACK_AUTOMATION_START_AT_ENV],
  )
  if (!startAt) {
    return {
      status: 'config_error',
      enabled: false,
      startAt: null,
      startAtLabel: null,
      reason: 'missing_or_invalid_start_at',
    }
  }

  const startAtLabel = eventCalendarDayKeyInLosAngeles(startAt)
  if (!startAtLabel) {
    return {
      status: 'config_error',
      enabled: false,
      startAt: null,
      startAtLabel: null,
      reason: 'missing_or_invalid_start_at',
    }
  }

  return {
    status: 'enabled',
    enabled: true,
    startAt,
    startAtLabel,
    reason: null,
  }
}

/** YYYY-MM-DD for an instant in America/Los_Angeles. */
export function eventCalendarDayKeyInLosAngeles(
  eventDate: string | Date | null | undefined,
): string | null {
  if (!eventDate) return null
  const raw = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  if (!(raw instanceof Date) || Number.isNaN(raw.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PLATE_OS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(raw)

  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  if (!year || !month || !day) return null
  return `${year}-${month}-${day}`
}

/**
 * Event/service calendar day must be on or after the launch cutoff day (LA).
 */
export function eventMeetsLaunchCutoff(
  eventDate: string | Date | null | undefined,
  launchStartAt: Date,
): boolean {
  const eventDay = eventCalendarDayKeyInLosAngeles(eventDate)
  const startDay = eventCalendarDayKeyInLosAngeles(launchStartAt)
  if (!eventDay || !startDay) return false
  return eventDay >= startDay
}

/**
 * End of the event calendar day in America/Los_Angeles.
 * Events currently store a date only — treat service as ending 11:59:59.999 PM LA.
 * Centralized so an exact end datetime can replace this later.
 */
export function eventEndAtLosAngeles(
  eventDate: string | Date | null | undefined,
): Date | null {
  if (!eventDate) return null
  const raw = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  if (!(raw instanceof Date) || Number.isNaN(raw.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PLATE_OS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(raw)

  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)
  if (!year || !month || !day) return null

  // Locate local midnight, then advance to end of day.
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const hourInLa = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: PLATE_OS_TIMEZONE,
      hour: '2-digit',
      hour12: false,
    })
      .formatToParts(noonUtc)
      .find((p) => p.type === 'hour')?.value || 12,
  )
  const startMs = noonUtc.getTime() - hourInLa * 60 * 60 * 1000
  return new Date(startMs + 24 * 60 * 60 * 1000 - 1)
}

export function feedbackEligibleAt(eventEnd: Date): Date {
  return new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000)
}

export function feedbackRetryDeadline(eventEnd: Date): Date {
  return new Date(
    feedbackEligibleAt(eventEnd).getTime() + FEEDBACK_RETRY_WINDOW_MS,
  )
}

export type FeedbackEligibilityInput = {
  eventStatus?: string | null
  eventDate?: string | Date | null
  clientEmail?: string | null
  feedbackOptOut?: boolean | null
  feedbackSentAt?: string | Date | null
  feedbackSubmittedAt?: string | Date | null
  launchStartAt?: Date | null
  now?: number
}

export type FeedbackEligibilityResult =
  | { ok: true; eventEnd: Date; eligibleAt: Date; retryDeadline: Date }
  | { ok: false; reason: string }

export function evaluateFeedbackEligibility(
  input: FeedbackEligibilityInput,
): FeedbackEligibilityResult {
  const now = input.now ?? Date.now()

  if (!isFeedbackEligibleStatus(input.eventStatus)) {
    return { ok: false, reason: 'status_ineligible' }
  }

  if (input.feedbackOptOut) {
    return { ok: false, reason: 'opted_out' }
  }

  if (input.feedbackSentAt) {
    return { ok: false, reason: 'already_sent' }
  }

  const email = input.clientEmail?.trim()
  if (!email || !email.includes('@') || email.length > 254) {
    return { ok: false, reason: 'missing_email' }
  }

  if (input.launchStartAt) {
    if (!eventMeetsLaunchCutoff(input.eventDate, input.launchStartAt)) {
      return { ok: false, reason: 'before_launch_cutoff' }
    }
  }

  const eventEnd = eventEndAtLosAngeles(input.eventDate)
  if (!eventEnd) {
    return { ok: false, reason: 'invalid_event_date' }
  }

  const eligibleAt = feedbackEligibleAt(eventEnd)
  if (now < eligibleAt.getTime()) {
    return { ok: false, reason: 'too_early' }
  }

  const retryDeadline = feedbackRetryDeadline(eventEnd)
  if (now > retryDeadline.getTime()) {
    return { ok: false, reason: 'outside_retry_window' }
  }

  return { ok: true, eventEnd, eligibleAt, retryDeadline }
}

export function firstNameForFeedbackGreeting(
  fullName?: string | null,
): string | null {
  const trimmed = fullName?.trim()
  if (!trimmed) return null
  const first = trimmed.split(/\s+/)[0]
  if (!first || first.length < 2) return null
  if (!/^[A-Za-z][A-Za-z'.-]*$/.test(first)) return null
  return first
}

export function sanitizeFeedbackText(
  value: unknown,
  max: number,
): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/\0/g, '').trim()
  if (!cleaned) return null
  return cleaned.slice(0, max)
}

export function isValidFeedbackRating(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  )
}
