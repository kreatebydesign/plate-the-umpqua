import { getPayload } from 'payload'
import config from '../../payload.config'
import type { User } from '@/payload-types'
import {
  ACTIVE_EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  INQUIRY_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  NEW_INQUIRY_STATUSES,
  OPEN_INQUIRY_STATUSES,
  OPEN_TASK_STATUSES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_WEIGHT,
  TASK_STATUS_LABELS,
} from './constants'
import {
  addDays,
  formatMonthDay,
  formatShortDate,
  startOfTodayInTimezone,
} from './formatDate'

export type TodaySectionError = {
  section: string
  message: string
}

export type TodaySummaryCounts = {
  newInquiries: number
  openInquiries: number
  upcomingEvents: number
  openTasks: number
  overdueTasks: number
}

export type AttentionItem = {
  id: string
  kind: 'overdue-task' | 'new-inquiry' | 'upcoming-event'
  title: string
  meta: string
  href: string
  priority: number
}

export type TodayEventRow = {
  id: string
  name: string
  dateLabel: string
  statusLabel: string
  guestCount: number | null
  venueName: string | null
  clientName: string | null
  adminHref: string
}

export type TodayInquiryRow = {
  id: string
  title: string
  statusLabel: string
  sourceLabel: string
  receivedLabel: string
  clientName: string | null
  adminHref: string
}

export type TodayTaskRow = {
  id: string
  title: string
  statusLabel: string
  priorityLabel: string
  dueLabel: string | null
  overdue: boolean
  adminHref: string
}

export type TodayAtPlateData = {
  generatedAt: string
  todayLabel: string
  counts: TodaySummaryCounts
  attention: AttentionItem[]
  upcomingEvents: TodayEventRow[]
  recentInquiries: TodayInquiryRow[]
  openTasks: TodayTaskRow[]
  sectionErrors: TodaySectionError[]
  totals: {
    clients: number | null
  }
}

type RelDoc = { id?: string | number; fullName?: string | null; venueName?: string | null }

function relName(value: unknown, field: 'fullName' | 'venueName'): string | null {
  if (!value || typeof value !== 'object') return null
  const doc = value as RelDoc
  const name = doc[field]
  return typeof name === 'string' && name.trim() ? name.trim() : null
}

function asId(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return String((value as { id: string | number }).id)
  }
  return ''
}

/**
 * Priority rules for “Needs attention” (deterministic):
 * 1. Overdue tasks — by priority weight (critical→low), then earliest due date
 * 2. New inquiries (newLead / discoveryNeeded) — newest first
 * 3. Events in the next 7 days still in `planning` — soonest first
 */

export async function getTodayAtPlate(user: User): Promise<TodayAtPlateData> {
  const payload = await getPayload({ config })
  const todayStart = startOfTodayInTimezone()
  const weekAhead = addDays(todayStart, 7)
  const sectionErrors: TodaySectionError[] = []

  const shared = {
    user,
    overrideAccess: false as const,
    depth: 1,
  }

  let newInquiriesCount = 0
  let openInquiriesCount = 0
  let upcomingEventsCount = 0
  let openTasksCount = 0
  let overdueTasksCount = 0
  let clientsCount: number | null = null

  let recentInquiries: TodayInquiryRow[] = []
  let upcomingEvents: TodayEventRow[] = []
  let openTaskRows: TodayTaskRow[] = []
  let overdueTaskRows: TodayTaskRow[] = []
  let nearPlanningEvents: TodayEventRow[] = []

  // --- Inquiries ---
  try {
    const [newResult, openResult, recentResult] = await Promise.all([
      payload.count({
        collection: 'inquiries',
        ...shared,
        where: { status: { in: [...NEW_INQUIRY_STATUSES] } },
      }),
      payload.count({
        collection: 'inquiries',
        ...shared,
        where: { status: { in: [...OPEN_INQUIRY_STATUSES] } },
      }),
      payload.find({
        collection: 'inquiries',
        ...shared,
        limit: 6,
        sort: '-createdAt',
        where: { status: { in: [...OPEN_INQUIRY_STATUSES] } },
        select: {
          eventTitle: true,
          status: true,
          leadSource: true,
          createdAt: true,
          client: true,
        },
      }),
    ])

    newInquiriesCount = newResult.totalDocs
    openInquiriesCount = openResult.totalDocs
    recentInquiries = recentResult.docs.map((doc) => ({
      id: asId(doc.id),
      title: doc.eventTitle || 'Hospitality inquiry',
      statusLabel: INQUIRY_STATUS_LABELS[doc.status || ''] || doc.status || '—',
      sourceLabel: LEAD_SOURCE_LABELS[doc.leadSource || ''] || doc.leadSource || '—',
      receivedLabel: formatShortDate(doc.createdAt),
      clientName: relName(doc.client, 'fullName'),
      adminHref: `/admin/collections/inquiries/${doc.id}`,
    }))
  } catch (err) {
    console.error('[os/today] inquiries', err)
    sectionErrors.push({
      section: 'inquiries',
      message: 'Inquiries could not be loaded right now.',
    })
  }

  // --- Events ---
  try {
    const [upcomingCountResult, upcomingResult] = await Promise.all([
      payload.count({
        collection: 'events',
        ...shared,
        where: {
          and: [
            { eventDate: { greater_than_equal: todayStart.toISOString() } },
            { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
          ],
        },
      }),
      payload.find({
        collection: 'events',
        ...shared,
        limit: 6,
        sort: 'eventDate',
        where: {
          and: [
            { eventDate: { greater_than_equal: todayStart.toISOString() } },
            { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
          ],
        },
        select: {
          eventName: true,
          eventDate: true,
          eventStatus: true,
          guestCount: true,
          venue: true,
          client: true,
        },
      }),
    ])

    upcomingEventsCount = upcomingCountResult.totalDocs
    upcomingEvents = upcomingResult.docs.map((doc) => ({
      id: asId(doc.id),
      name: doc.eventName || 'Untitled event',
      dateLabel: formatShortDate(doc.eventDate),
      statusLabel: EVENT_STATUS_LABELS[doc.eventStatus || ''] || doc.eventStatus || '—',
      guestCount: typeof doc.guestCount === 'number' ? doc.guestCount : null,
      venueName: relName(doc.venue, 'venueName'),
      clientName: relName(doc.client, 'fullName'),
      adminHref: `/admin/collections/events/${doc.id}`,
    }))

    nearPlanningEvents = upcomingEvents.filter((event) => {
      const raw = upcomingResult.docs.find((d) => asId(d.id) === event.id)
      if (!raw?.eventDate || raw.eventStatus !== 'planning') return false
      const when = new Date(raw.eventDate)
      return when >= todayStart && when < weekAhead
    })
  } catch (err) {
    console.error('[os/today] events', err)
    sectionErrors.push({
      section: 'events',
      message: 'Events could not be loaded right now.',
    })
  }

  // --- Tasks ---
  try {
    const [openCountResult, overdueCountResult, openResult, overdueResult] =
      await Promise.all([
        payload.count({
          collection: 'tasks',
          ...shared,
          where: { status: { in: [...OPEN_TASK_STATUSES] } },
        }),
        payload.count({
          collection: 'tasks',
          ...shared,
          where: {
            and: [
              { status: { in: [...OPEN_TASK_STATUSES] } },
              { dueDate: { less_than: todayStart.toISOString() } },
            ],
          },
        }),
        payload.find({
          collection: 'tasks',
          ...shared,
          limit: 8,
          sort: 'dueDate',
          where: { status: { in: [...OPEN_TASK_STATUSES] } },
          select: {
            taskTitle: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        }),
        payload.find({
          collection: 'tasks',
          ...shared,
          limit: 8,
          sort: 'dueDate',
          where: {
            and: [
              { status: { in: [...OPEN_TASK_STATUSES] } },
              { dueDate: { less_than: todayStart.toISOString() } },
            ],
          },
          select: {
            taskTitle: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        }),
      ])

    openTasksCount = openCountResult.totalDocs
    overdueTasksCount = overdueCountResult.totalDocs

    const mapTask = (doc: {
      id: string | number
      taskTitle?: string | null
      status?: string | null
      priority?: string | null
      dueDate?: string | null
    }, overdue: boolean): TodayTaskRow => ({
      id: asId(doc.id),
      title: doc.taskTitle || 'Untitled task',
      statusLabel: TASK_STATUS_LABELS[doc.status || ''] || doc.status || '—',
      priorityLabel: TASK_PRIORITY_LABELS[doc.priority || ''] || doc.priority || '—',
      dueLabel: doc.dueDate ? formatMonthDay(doc.dueDate) : null,
      overdue,
      adminHref: `/admin/collections/tasks/${doc.id}`,
    })

    openTaskRows = openResult.docs.map((d) => mapTask(d, false))
    overdueTaskRows = overdueResult.docs
      .map((d) => mapTask(d, true))
      .sort((a, b) => {
        const aw =
          TASK_PRIORITY_WEIGHT[
            Object.entries(TASK_PRIORITY_LABELS).find(([, v]) => v === a.priorityLabel)?.[0] ||
              'normal'
          ] ?? 2
        const bw =
          TASK_PRIORITY_WEIGHT[
            Object.entries(TASK_PRIORITY_LABELS).find(([, v]) => v === b.priorityLabel)?.[0] ||
              'normal'
          ] ?? 2
        return aw - bw
      })
  } catch (err) {
    console.error('[os/today] tasks', err)
    sectionErrors.push({
      section: 'tasks',
      message: 'Tasks could not be loaded right now.',
    })
  }

  // --- Clients count (foundation preview) ---
  try {
    const clients = await payload.count({
      collection: 'clients',
      ...shared,
    })
    clientsCount = clients.totalDocs
  } catch (err) {
    console.error('[os/today] clients', err)
    sectionErrors.push({
      section: 'clients',
      message: 'Client count could not be loaded right now.',
    })
  }

  // Attention list with deterministic priority
  const attention: AttentionItem[] = []

  for (const task of overdueTaskRows) {
    const priorityKey =
      Object.entries(TASK_PRIORITY_LABELS).find(([, v]) => v === task.priorityLabel)?.[0] ||
      'normal'
    attention.push({
      id: `task-${task.id}`,
      kind: 'overdue-task',
      title: task.title,
      meta: `Overdue task · ${task.priorityLabel}${task.dueLabel ? ` · due ${task.dueLabel}` : ''}`,
      href: task.adminHref,
      priority: 100 + (TASK_PRIORITY_WEIGHT[priorityKey] ?? 2),
    })
  }

  for (const inquiry of recentInquiries.filter((row) =>
    ['New lead', 'Discovery needed'].includes(row.statusLabel),
  )) {
    attention.push({
      id: `inquiry-${inquiry.id}`,
      kind: 'new-inquiry',
      title: inquiry.title,
      meta: `${inquiry.statusLabel} · ${inquiry.sourceLabel} · ${inquiry.receivedLabel}`,
      href: inquiry.adminHref,
      priority: 200 + (inquiry.statusLabel === 'New lead' ? 0 : 1),
    })
  }

  for (const event of nearPlanningEvents) {
    attention.push({
      id: `event-${event.id}`,
      kind: 'upcoming-event',
      title: event.name,
      meta: `Planning · ${event.dateLabel}`,
      href: event.adminHref,
      priority: 300,
    })
  }

  attention.sort((a, b) => a.priority - b.priority)

  return {
    generatedAt: new Date().toISOString(),
    todayLabel: formatShortDate(new Date()),
    counts: {
      newInquiries: newInquiriesCount,
      openInquiries: openInquiriesCount,
      upcomingEvents: upcomingEventsCount,
      openTasks: openTasksCount,
      overdueTasks: overdueTasksCount,
    },
    attention: attention.slice(0, 8),
    upcomingEvents,
    recentInquiries,
    openTasks: openTaskRows,
    sectionErrors,
    totals: {
      clients: clientsCount,
    },
  }
}

export async function getFoundationCounts(user: User): Promise<{
  inquiries: number | null
  events: number | null
  clients: number | null
  errors: TodaySectionError[]
}> {
  const payload = await getPayload({ config })
  const shared = { user, overrideAccess: false as const }
  const errors: TodaySectionError[] = []
  let inquiries: number | null = null
  let events: number | null = null
  let clients: number | null = null

  try {
    inquiries = (
      await payload.count({
        collection: 'inquiries',
        ...shared,
        where: { status: { in: [...OPEN_INQUIRY_STATUSES] } },
      })
    ).totalDocs
  } catch (err) {
    console.error('[os/foundation] inquiries', err)
    errors.push({ section: 'inquiries', message: 'Could not load inquiry count.' })
  }

  try {
    const todayStart = startOfTodayInTimezone()
    events = (
      await payload.count({
        collection: 'events',
        ...shared,
        where: {
          and: [
            { eventDate: { greater_than_equal: todayStart.toISOString() } },
            { eventStatus: { in: [...ACTIVE_EVENT_STATUSES] } },
          ],
        },
      })
    ).totalDocs
  } catch (err) {
    console.error('[os/foundation] events', err)
    errors.push({ section: 'events', message: 'Could not load event count.' })
  }

  try {
    clients = (await payload.count({ collection: 'clients', ...shared })).totalDocs
  } catch (err) {
    console.error('[os/foundation] clients', err)
    errors.push({ section: 'clients', message: 'Could not load client count.' })
  }

  return { inquiries, events, clients, errors }
}
