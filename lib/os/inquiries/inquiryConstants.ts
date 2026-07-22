import {
  INQUIRY_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  NEW_INQUIRY_STATUSES,
  OPEN_INQUIRY_STATUSES,
} from '../constants'

export {
  INQUIRY_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  NEW_INQUIRY_STATUSES,
  OPEN_INQUIRY_STATUSES,
}

export const INQUIRY_PAGE_SIZE_DEFAULT = 20
export const INQUIRY_PAGE_SIZE_MAX = 50
export const INQUIRY_SEARCH_MAX = 80

export const INQUIRY_STATUS_VALUES = [
  'newLead',
  'discoveryNeeded',
  'discoveryScheduled',
  'briefInProgress',
  'packageInProgress',
  'proposalInProgress',
  'proposalSent',
  'approved',
  'closed',
] as const

export type InquiryStatusValue = (typeof INQUIRY_STATUS_VALUES)[number]

export const INQUIRY_PRIORITY_VALUES = ['standard', 'highTouch', 'vip'] as const
export type InquiryPriorityValue = (typeof INQUIRY_PRIORITY_VALUES)[number]

export const INQUIRY_PRIORITY_LABELS: Record<InquiryPriorityValue, string> = {
  standard: 'Standard',
  highTouch: 'High touch',
  vip: 'VIP concierge',
}

export const INQUIRY_OCCASION_VALUES = [
  'privateDinner',
  'birthday',
  'anniversary',
  'proposalEngagement',
  'weddingWeekend',
  'corporateExecutive',
  'realtorHospitality',
  'wineCountryExperience',
  'customCelebration',
  'whiteLabelHospitality',
] as const

export type InquiryOccasionValue = (typeof INQUIRY_OCCASION_VALUES)[number]

export const INQUIRY_OCCASION_LABELS: Record<string, string> = {
  privateDinner: 'Private dinner',
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  proposalEngagement: 'Proposal / engagement',
  weddingWeekend: 'Wedding weekend',
  corporateExecutive: 'Corporate / executive',
  realtorHospitality: 'Realtor hospitality',
  wineCountryExperience: 'Wine country experience',
  customCelebration: 'Custom celebration',
  whiteLabelHospitality: 'White-label hospitality',
}

export const INQUIRY_LOCATION_LABELS: Record<string, string> = {
  privateHome: 'Private home',
  estate: 'Estate',
  winery: 'Winery',
  venue: 'Venue',
  countryClub: 'Country club',
  hotel: 'Hotel',
  clubLounge: 'Club / lounge',
  undecided: 'Undecided',
}

export const INQUIRY_BUDGET_LABELS: Record<string, string> = {
  '1-3k': '$1K–$3K',
  '3-5k': '$3K–$5K',
  '5-10k': '$5K–$10K',
  '10-25k': '$10K–$25K',
  '25kPlus': '$25K+',
}

export const INQUIRY_LEAD_SOURCE_VALUES = [
  'website',
  'concierge',
  'packages',
  'partner-concierge',
  'community-partnership',
  'realtor',
  'wine-country',
  'referral',
] as const

export type InquiryPipelineFilter =
  | 'all'
  | 'new'
  | 'open'
  | 'approved'
  | 'closed'

export const INQUIRY_PIPELINE_OPTIONS: Array<{
  value: InquiryPipelineFilter
  label: string
}> = [
  { value: 'all', label: 'All inquiries' },
  { value: 'new', label: 'New / discovery needed' },
  { value: 'open', label: 'Open pipeline' },
  { value: 'approved', label: 'Approved' },
  { value: 'closed', label: 'Closed' },
]

export type InquirySortValue = 'newest' | 'oldest'

export const INQUIRY_SORT_OPTIONS: Array<{
  value: InquirySortValue
  label: string
}> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

/** Fields allowed on OS inquiry updates — never contact identity or original message. */
export const INQUIRY_UPDATE_ALLOWLIST = ['status', 'priorityLevel'] as const

export function isInquiryStatus(value: string): value is InquiryStatusValue {
  return (INQUIRY_STATUS_VALUES as readonly string[]).includes(value)
}

export function isInquiryPriority(value: string): value is InquiryPriorityValue {
  return (INQUIRY_PRIORITY_VALUES as readonly string[]).includes(value)
}

export function isInquiryOccasion(value: string): value is InquiryOccasionValue {
  return (INQUIRY_OCCASION_VALUES as readonly string[]).includes(value)
}

export function isLeadSource(value: string): boolean {
  return (INQUIRY_LEAD_SOURCE_VALUES as readonly string[]).includes(value)
}

export function isPipelineFilter(value: string): value is InquiryPipelineFilter {
  return ['all', 'new', 'open', 'approved', 'closed'].includes(value)
}

export function isInquirySort(value: string): value is InquirySortValue {
  return value === 'newest' || value === 'oldest'
}

export function pipelineStatuses(
  pipeline: InquiryPipelineFilter,
): readonly string[] | null {
  switch (pipeline) {
    case 'new':
      return NEW_INQUIRY_STATUSES
    case 'open':
      return OPEN_INQUIRY_STATUSES
    case 'approved':
      return ['approved']
    case 'closed':
      return ['closed']
    default:
      return null
  }
}

export function statusLabel(value?: string | null) {
  if (!value) return '—'
  return INQUIRY_STATUS_LABELS[value] || value
}

export function sourceLabel(value?: string | null) {
  if (!value) return '—'
  return LEAD_SOURCE_LABELS[value] || value
}

export function occasionLabel(value?: string | null) {
  if (!value) return '—'
  return INQUIRY_OCCASION_LABELS[value] || value
}

export function needsFollowUp(status?: string | null) {
  return status === 'newLead' || status === 'discoveryNeeded'
}
