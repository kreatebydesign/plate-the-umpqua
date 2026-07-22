import {
  ACTIVE_EVENT_STATUSES,
  EVENT_STATUS_LABELS,
} from '../constants'

export const EVENT_PAGE_SIZE_DEFAULT = 20
export const EVENT_PAGE_SIZE_MAX = 50
export const EVENT_SEARCH_MAX = 80

/** Schema enum for `events.eventStatus` */
export const EVENT_STATUS_VALUES = [
  'planning',
  'confirmed',
  'vendorCoordination',
  'inProduction',
  'completed',
  'archived',
] as const

export type EventStatusValue = (typeof EVENT_STATUS_VALUES)[number]

/**
 * Pipeline presets derived from real schema values + eventDate.
 * - upcoming: active statuses, eventDate >= start of today (LA)
 * - today: any status, eventDate within today (LA)
 * - next7 / next30: active statuses inside the window
 * - past: eventDate < start of today (LA)
 * - completed: status completed or archived
 * - all: no date/status preset
 */
export type EventPipelineFilter =
  | 'upcoming'
  | 'today'
  | 'next7'
  | 'next30'
  | 'past'
  | 'completed'
  | 'all'

export const EVENT_PIPELINE_OPTIONS: Array<{
  value: EventPipelineFilter
  label: string
}> = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'next7', label: 'Next 7 days' },
  { value: 'next30', label: 'Next 30 days' },
  { value: 'past', label: 'Past dates' },
  { value: 'completed', label: 'Completed / archived' },
  { value: 'all', label: 'All events' },
]

export type EventSortValue = 'soonest' | 'latest' | 'newest' | 'oldest'

export const EVENT_SORT_OPTIONS: Array<{
  value: EventSortValue
  label: string
}> = [
  { value: 'soonest', label: 'Soonest first' },
  { value: 'latest', label: 'Latest date first' },
  { value: 'newest', label: 'Newest created' },
  { value: 'oldest', label: 'Oldest created' },
]

/** Only field safe for OS updates — no hooks, no external side effects. */
export const EVENT_UPDATE_ALLOWLIST = ['eventStatus'] as const

export {
  ACTIVE_EVENT_STATUSES,
  EVENT_STATUS_LABELS,
}

export function isEventStatus(value: string): value is EventStatusValue {
  return (EVENT_STATUS_VALUES as readonly string[]).includes(value)
}

export function isEventPipeline(value: string): value is EventPipelineFilter {
  return EVENT_PIPELINE_OPTIONS.some((option) => option.value === value)
}

export function isEventSort(value: string): value is EventSortValue {
  return EVENT_SORT_OPTIONS.some((option) => option.value === value)
}

export function statusLabel(value?: string | null) {
  if (!value) return '—'
  return EVENT_STATUS_LABELS[value] || value
}

export function isActiveEventStatus(value?: string | null) {
  return Boolean(
    value && (ACTIVE_EVENT_STATUSES as readonly string[]).includes(value),
  )
}

/**
 * Deterministic attention rules based only on real fields.
 * Returns a short operator-facing reason or null.
 */
export function eventAttentionReason(input: {
  eventDate?: string | null
  eventStatus?: string | null
  venueId?: string | null
  guestCount?: number | null
  todayStart: Date
  weekAhead: Date
}): string | null {
  const { eventDate, eventStatus, venueId, guestCount, todayStart, weekAhead } =
    input
  if (!eventDate) return null

  const when = new Date(eventDate)
  if (Number.isNaN(when.getTime())) return null

  const active = isActiveEventStatus(eventStatus)

  if (when < todayStart && active) {
    return 'Date passed — still active'
  }

  if (
    when >= todayStart &&
    when < weekAhead &&
    eventStatus === 'planning'
  ) {
    return 'Within 7 days — still planning'
  }

  if (when >= todayStart && active && !venueId) {
    return 'Upcoming — venue not set'
  }

  if (
    when >= todayStart &&
    active &&
    (guestCount == null || Number.isNaN(guestCount))
  ) {
    return 'Upcoming — guest count missing'
  }

  return null
}
