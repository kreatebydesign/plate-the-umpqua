/** Plate Business OS — shared operational constants */

export const PLATE_OS_TIMEZONE = 'America/Los_Angeles'

/** Inquiry statuses that still need operator attention */
export const OPEN_INQUIRY_STATUSES = [
  'newLead',
  'discoveryNeeded',
  'discoveryScheduled',
  'briefInProgress',
  'packageInProgress',
  'proposalInProgress',
  'proposalSent',
] as const

/** Fresh leads awaiting first meaningful follow-up */
export const NEW_INQUIRY_STATUSES = ['newLead', 'discoveryNeeded'] as const

export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  newLead: 'New lead',
  discoveryNeeded: 'Discovery needed',
  discoveryScheduled: 'Discovery scheduled',
  briefInProgress: 'Brief in progress',
  packageInProgress: 'Package in progress',
  proposalInProgress: 'Proposal in progress',
  proposalSent: 'Proposal sent',
  approved: 'Approved',
  closed: 'Closed',
}

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  concierge: 'Concierge',
  packages: 'Packages',
  'partner-concierge': 'Partner Concierge',
  'community-partnership': 'Community Partnership',
  realtor: 'Realtor',
  'wine-country': 'Wine Country',
  referral: 'Referral',
}

/** Active / upcoming event statuses (exclude completed archive) */
export const ACTIVE_EVENT_STATUSES = [
  'planning',
  'confirmed',
  'vendorCoordination',
  'inProduction',
] as const

export const EVENT_STATUS_LABELS: Record<string, string> = {
  planning: 'Planning',
  confirmed: 'Confirmed',
  vendorCoordination: 'Vendor coordination',
  inProduction: 'In production',
  completed: 'Completed',
  archived: 'Archived',
}

export const OPEN_TASK_STATUSES = [
  'open',
  'inProgress',
  'waiting',
  'blocked',
] as const

export const TASK_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  inProgress: 'In progress',
  waiting: 'Waiting',
  blocked: 'Blocked',
  complete: 'Complete',
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
}

export const TASK_PRIORITY_WEIGHT: Record<string, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  hospitalityDirector: 'Hospitality Director',
  experienceCurator: 'Experience Curator',
  culinaryTeam: 'Culinary Team',
  vendorPartner: 'Vendor Partner',
  client: 'Client',
  team: 'Team',
}

export const OS_NAV = [
  { href: '/os', label: 'Today', exact: true },
  { href: '/os/inquiries', label: 'Inquiries', exact: false },
  { href: '/os/events', label: 'Events', exact: false },
  { href: '/os/clients', label: 'Clients', exact: false },
] as const
