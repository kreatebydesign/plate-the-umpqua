/**
 * Plate OS Clients — constants and labels from the real `clients` schema.
 *
 * No lifecycle stages (Active / Prospect / Past) are invented here.
 * Grouping filters below map only to real fields or authorized reverse
 * relationships on inquiries/events.
 */

import { NEW_INQUIRY_STATUSES } from '../constants'

export const CLIENT_PAGE_SIZE_DEFAULT = 20
export const CLIENT_PAGE_SIZE_MAX = 50
export const CLIENT_SEARCH_MAX = 80

/** Bounded harvest of related inquiry/event IDs for relationship filters. */
export const CLIENT_RELATION_HARVEST_LIMIT = 200

/** Bounded related summaries on client detail. */
export const CLIENT_DETAIL_RELATED_LIMIT = 8

/** Schema enum for `clients.clientType` */
export const CLIENT_TYPE_VALUES = [
  'private',
  'realtor',
  'executive',
  'partner',
  'hospitalityBrand',
  'whiteLabelPartner',
] as const

export type ClientTypeValue = (typeof CLIENT_TYPE_VALUES)[number]

export const CLIENT_TYPE_LABELS: Record<ClientTypeValue, string> = {
  private: 'Private Client',
  realtor: 'Realtor',
  executive: 'Executive / Corporate',
  partner: 'Winery / Estate Partner',
  hospitalityBrand: 'Hospitality Brand',
  whiteLabelPartner: 'White-Label Partner',
}

/** Schema enum for `clients.vipStatus` — real field, not a fabricated ranking. */
export const CLIENT_VIP_VALUES = [
  'standard',
  'preferred',
  'vip',
  'foundingPartner',
] as const

export type ClientVipValue = (typeof CLIENT_VIP_VALUES)[number]

export const CLIENT_VIP_LABELS: Record<ClientVipValue, string> = {
  standard: 'Standard',
  preferred: 'Preferred',
  vip: 'VIP',
  foundingPartner: 'Founding Hospitality Partner',
}

/** Schema enum for `clients.preferredExperienceStyle` (hasMany). */
export const CLIENT_EXPERIENCE_STYLE_VALUES = [
  'privateDinner',
  'estateDinner',
  'wineCountry',
  'executiveHospitality',
  'realtorConcierge',
  'celebration',
  'luxuryEvent',
  'clubLounge',
] as const

export type ClientExperienceStyleValue =
  (typeof CLIENT_EXPERIENCE_STYLE_VALUES)[number]

export const CLIENT_EXPERIENCE_STYLE_LABELS: Record<
  ClientExperienceStyleValue,
  string
> = {
  privateDinner: 'Private Dinner',
  estateDinner: 'Estate Dinner',
  wineCountry: 'Wine Country Experience',
  executiveHospitality: 'Executive Hospitality',
  realtorConcierge: 'Realtor Concierge',
  celebration: 'Celebration / Milestone',
  luxuryEvent: 'Luxury Event',
  clubLounge: 'Club / Lounge Experience',
}

/**
 * Relationship / list view presets.
 * - all: every authorized client
 * - upcoming-events: clients referenced by upcoming active events
 * - open-inquiries: clients referenced by open pipeline inquiries
 * - attention: clients matching deterministic attention rules
 *
 * No Active / Prospect / Past presets — the schema has no lifecycle field.
 */
export type ClientViewFilter =
  | 'all'
  | 'upcoming-events'
  | 'open-inquiries'
  | 'attention'

export const CLIENT_VIEW_OPTIONS: Array<{
  value: ClientViewFilter
  label: string
}> = [
  { value: 'all', label: 'All clients' },
  { value: 'upcoming-events', label: 'With upcoming events' },
  { value: 'open-inquiries', label: 'With open inquiries' },
  { value: 'attention', label: 'Needs attention' },
]

export type ClientSortValue = 'newest' | 'oldest' | 'name-asc' | 'name-desc'

export const CLIENT_SORT_OPTIONS: Array<{
  value: ClientSortValue
  label: string
}> = [
  { value: 'newest', label: 'Newest updated' },
  { value: 'oldest', label: 'Oldest updated' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
]

/**
 * Phase 4 keeps clients read-only in OS.
 * No low-risk operational workflow field (status / readiness / preferred contact)
 * exists on the collection. Classification fields (clientType, vipStatus) are
 * identity/relationship labels, not day-of operational controls.
 */
export const CLIENT_UPDATE_ALLOWLIST = [] as const

/** Inquiry statuses that indicate follow-up attention at the client level. */
export const CLIENT_FOLLOWUP_INQUIRY_STATUSES = NEW_INQUIRY_STATUSES

export function isClientType(value: string): value is ClientTypeValue {
  return (CLIENT_TYPE_VALUES as readonly string[]).includes(value)
}

export function isClientVip(value: string): value is ClientVipValue {
  return (CLIENT_VIP_VALUES as readonly string[]).includes(value)
}

export function isClientView(value: string): value is ClientViewFilter {
  return CLIENT_VIEW_OPTIONS.some((option) => option.value === value)
}

export function isClientSort(value: string): value is ClientSortValue {
  return CLIENT_SORT_OPTIONS.some((option) => option.value === value)
}

export function clientTypeLabel(value?: string | null) {
  if (!value) return '—'
  if (isClientType(value)) return CLIENT_TYPE_LABELS[value]
  return value
}

export function clientVipLabel(value?: string | null) {
  if (!value) return '—'
  if (isClientVip(value)) return CLIENT_VIP_LABELS[value]
  return value
}

export function experienceStyleLabel(value?: string | null) {
  if (!value) return null
  if (
    (CLIENT_EXPERIENCE_STYLE_VALUES as readonly string[]).includes(value)
  ) {
    return CLIENT_EXPERIENCE_STYLE_LABELS[value as ClientExperienceStyleValue]
  }
  return value
}

/**
 * Deterministic client attention rules from real authorized fields only.
 * Returns a short operator-facing reason or null.
 */
export function clientAttentionReason(input: {
  phone?: string | null
  hasUpcomingEvent: boolean
  hasFollowUpInquiry: boolean
}): string | null {
  const phone = input.phone?.trim() || ''
  if (input.hasUpcomingEvent && !phone) {
    return 'Upcoming event — phone missing'
  }
  if (input.hasFollowUpInquiry) {
    return 'Open inquiry needs follow-up'
  }
  return null
}
