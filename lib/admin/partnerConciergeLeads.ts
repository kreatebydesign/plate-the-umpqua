import type { Client, Inquiry } from '@/payload-types'
import type { Payload } from 'payload'

export type PartnerLeadRow = {
  id: string
  eventTitle: string
  contactName: string
  company: string | null
  email: string
  phone: string | null
  audience: string | null
  budget: string | null
  timeframe: string | null
  eventDate: string | null
  status: NonNullable<Inquiry['status']>
  statusLabel: string
  priorityLevel: Inquiry['priorityLevel']
  createdAt: string
  createdLabel: string
  inquiryUrl: string
  isNew: boolean
  isHighValue: boolean
}

export type PartnerLeadStats = {
  total: number
  newLeads: number
  highValue: number
  vipPriority: number
}

const EMPTY_STATS: PartnerLeadStats = {
  total: 0,
  newLeads: 0,
  highValue: 0,
  vipPriority: 0,
}

const STATUS_LABELS: Record<NonNullable<Inquiry['status']>, string> = {
  newLead: 'New Lead',
  discoveryNeeded: 'Discovery Needed',
  discoveryScheduled: 'Discovery Scheduled',
  briefInProgress: 'Brief In Progress',
  packageInProgress: 'Package In Progress',
  proposalInProgress: 'Proposal In Progress',
  proposalSent: 'Proposal Sent',
  approved: 'Approved',
  closed: 'Closed',
}

const CLIENT_TYPE_LABELS: Record<NonNullable<Client['clientType']>, string> = {
  private: 'Private Client',
  realtor: 'Realtor',
  executive: 'Executive / Corporate',
  partner: 'Winery / Estate Partner',
  hospitalityBrand: 'Hospitality Brand',
  whiteLabelPartner: 'White-Label Partner',
}

const BUDGET_LABELS: Record<string, string> = {
  '425-750': '$425–$750',
  '750-1500': '$750–$1,500',
  '2000+': '$2,000+',
}

const NEW_STATUSES = new Set<NonNullable<Inquiry['status']>>([
  'newLead',
  'discoveryNeeded',
])

function resolveClient(client: Inquiry['client']): Client | null {
  if (!client || typeof client === 'string') {
    return null
  }

  return client
}

function formatDate(value?: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function parseTimeframe(notes?: string | null) {
  if (!notes) {
    return null
  }

  const match = notes.match(/Timeline:\s*\n([^\n]+)/i)

  if (!match?.[1]) {
    return null
  }

  const value = match[1].trim()

  switch (value) {
    case 'this-week':
      return 'This Week'

    case 'this-month':
      return 'This Month'

    case 'future':
      return 'Future Planning'

    default:
      return value || null
  }
}

function mapBudget(value?: string | null) {
  if (!value) {
    return null
  }

  return BUDGET_LABELS[value] || value
}

function mapInquiryToRow(inquiry: Inquiry): PartnerLeadRow {
  const client = resolveClient(inquiry.client)
  const status = inquiry.status || 'newLead'
  const budget = mapBudget(client?.averageSpendRange)
  const isHighValue =
    inquiry.priorityLevel === 'vip' ||
    client?.averageSpendRange === '2000+'

  return {
    id: inquiry.id,
    eventTitle: inquiry.eventTitle,
    contactName: client?.fullName || 'Unknown Contact',
    company: null,
    email: client?.email || '—',
    phone: client?.phone || null,
    audience: client?.clientType
      ? CLIENT_TYPE_LABELS[client.clientType]
      : null,
    budget,
    timeframe: parseTimeframe(client?.relationshipNotes),
    eventDate: formatDate(inquiry.eventDate),
    status,
    statusLabel: STATUS_LABELS[status],
    priorityLevel: inquiry.priorityLevel,
    createdAt: inquiry.createdAt,
    createdLabel: formatDateTime(inquiry.createdAt),
    inquiryUrl: `/admin/collections/inquiries/${inquiry.id}`,
    isNew: NEW_STATUSES.has(status),
    isHighValue,
  }
}

function buildStats(leads: PartnerLeadRow[]): PartnerLeadStats {
  return {
    total: leads.length,
    newLeads: leads.filter((lead) => lead.isNew).length,
    highValue: leads.filter((lead) => lead.isHighValue).length,
    vipPriority: leads.filter((lead) => lead.priorityLevel === 'vip').length,
  }
}

export async function getPartnerConciergeLeadBoard(payload: Payload) {
  try {
    const result = await payload.find({
      collection: 'inquiries',
      depth: 1,
      limit: 100,
      sort: '-createdAt',

      where: {
        leadSource: {
          equals: 'partner-concierge',
        },
      },
    })

    const leads = result.docs.map((doc) =>
      mapInquiryToRow(doc as Inquiry),
    )

    return {
      leads,
      stats: buildStats(leads),
    }
  } catch (error) {
    console.error('Partner Concierge lead board error:', error)

    return {
      leads: [],
      stats: EMPTY_STATS,
    }
  }
}
