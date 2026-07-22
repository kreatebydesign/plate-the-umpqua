/**
 * Phase 3 smoke: event list/detail contracts via authorized Local API.
 * Does not mutate production records.
 * Run: npx tsx scripts/verify-phase3-events.ts
 */
import { readFileSync } from 'node:fs'

function loadEnvLocal() {
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq)
      const value = trimmed.slice(eq + 1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // Rely on process env when .env.local is unavailable
  }
}

function assertNoSensitiveKeys(label: string, payload: unknown) {
  const forbidden = [
    'staffNotes',
    'clientNotes',
    'dietaryNotes',
    'internalNotes',
    'internalStrategyNotes',
    'relationshipNotes',
    'clientPrice',
    'estimatedProfit',
    'hash',
    'salt',
    'resetPasswordToken',
    'password',
  ]
  const serialized = JSON.stringify(payload)
  for (const key of forbidden) {
    if (serialized.includes(`"${key}"`)) {
      throw new Error(`${label}: sensitive key leaked: ${key}`)
    }
  }
}

async function main() {
  loadEnvLocal()

  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const {
    listEvents,
    getEventDetail,
    assertEventStatus,
  } = await import('../lib/os/events/eventQueries')
  const {
    EVENT_STATUS_VALUES,
    EVENT_UPDATE_ALLOWLIST,
    eventAttentionReason,
    isEventStatus,
  } = await import('../lib/os/events/eventConstants')
  const { canWriteOperational, asPlateUser } = await import('../lib/access/roles')
  const { startOfTodayInTimezone, addDays } = await import('../lib/os/formatDate')

  const payload = await getPayload({ config })
  const users = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: 'hello@platetheumpqua.com' } },
  })

  const user = users.docs[0]
  if (!user) {
    console.error('Martin user not found')
    process.exit(1)
  }

  if (user.role !== 'admin') {
    console.error(`Expected Martin role admin, got ${user.role}`)
    process.exit(1)
  }

  if (!canWriteOperational(asPlateUser(user))) {
    console.error('Martin cannot write operational collections')
    process.exit(1)
  }

  const todayStart = startOfTodayInTimezone()
  const weekAhead = addDays(todayStart, 7)

  // Attention rule unit checks (deterministic, no DB)
  const overdue = eventAttentionReason({
    eventDate: addDays(todayStart, -1).toISOString(),
    eventStatus: 'confirmed',
    venueId: 'v1',
    guestCount: 10,
    todayStart,
    weekAhead,
  })
  if (overdue !== 'Date passed — still active') {
    throw new Error(`Unexpected overdue attention: ${overdue}`)
  }

  const planningSoon = eventAttentionReason({
    eventDate: addDays(todayStart, 2).toISOString(),
    eventStatus: 'planning',
    venueId: 'v1',
    guestCount: 10,
    todayStart,
    weekAhead,
  })
  if (planningSoon !== 'Within 7 days — still planning') {
    throw new Error(`Unexpected planning attention: ${planningSoon}`)
  }

  const missingVenue = eventAttentionReason({
    eventDate: addDays(todayStart, 10).toISOString(),
    eventStatus: 'confirmed',
    venueId: null,
    guestCount: 10,
    todayStart,
    weekAhead,
  })
  if (missingVenue !== 'Upcoming — venue not set') {
    throw new Error(`Unexpected venue attention: ${missingVenue}`)
  }

  const clear = eventAttentionReason({
    eventDate: addDays(todayStart, 10).toISOString(),
    eventStatus: 'confirmed',
    venueId: 'v1',
    guestCount: 12,
    todayStart,
    weekAhead,
  })
  if (clear !== null) {
    throw new Error('Healthy upcoming event should not need attention')
  }

  const list = await listEvents(user as never, {
    pipeline: 'all',
    sort: 'soonest',
    page: '1',
    limit: '20',
  })

  assertNoSensitiveKeys('list', list)

  if (list.limit > 50) {
    throw new Error('Pagination limit exceeded max')
  }

  const badList = await listEvents(user as never, {
    pipeline: 'not-a-pipeline',
    status: 'injected',
    sort: 'hack',
    page: '-3',
    limit: '9999',
  })

  if (badList.filters.pipeline !== 'upcoming') {
    throw new Error('Invalid pipeline was not normalized')
  }
  if (badList.filters.status !== null) {
    throw new Error('Invalid status was not rejected')
  }
  if (badList.filters.sort !== 'soonest') {
    throw new Error('Invalid sort was not normalized')
  }
  if (badList.page !== 1 || badList.limit !== 50) {
    throw new Error('Invalid page/limit were not bounded')
  }

  if (!assertEventStatus('bogus') && assertEventStatus('planning') !== 'planning') {
    throw new Error('Status assertion failed')
  }
  if (!isEventStatus(EVENT_STATUS_VALUES[0])) {
    throw new Error('Status enum mismatch')
  }
  if (EVENT_UPDATE_ALLOWLIST.join(',') !== 'eventStatus') {
    throw new Error('Update allowlist drifted')
  }

  let detailId: string | null = list.rows[0]?.id || null
  if (!detailId) {
    const any = await payload.find({
      collection: 'events',
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
      select: { eventName: true },
    })
    detailId = any.docs[0] ? String(any.docs[0].id) : null
  }

  let detailOk = false
  if (detailId) {
    const detail = await getEventDetail(user as never, detailId)
    if (!detail) {
      throw new Error('Authorized detail lookup failed')
    }
    assertNoSensitiveKeys('detail', detail)
    if (!detail.adminHref.startsWith('/admin/collections/events/')) {
      throw new Error('Detail missing admin href')
    }
    if (!detail.canEditOperational) {
      throw new Error('Martin should be able to edit operational fields')
    }
    detailOk = true
  }

  const missing = await getEventDetail(user as never, '000000000000000000000000')
  if (missing !== null) {
    throw new Error('Missing ID should resolve to null')
  }

  const shaped = await getEventDetail(user as never, '../etc/passwd')
  if (shaped !== null) {
    throw new Error('Shaped ID should resolve to null')
  }

  const { updateEventOperational } = await import(
    '../lib/os/events/updateEventOperational'
  )

  // Confirm Today links use OS event routes
  const { getTodayAtPlate } = await import('../lib/os/getTodayAtPlate')
  const today = await getTodayAtPlate(user as never)
  for (const event of today.upcomingEvents) {
    if (!event.adminHref.startsWith('/os/events/')) {
      throw new Error(`Today upcoming event link not OS route: ${event.adminHref}`)
    }
  }
  for (const item of today.attention.filter((a) => a.kind === 'upcoming-event')) {
    if (!item.href.startsWith('/os/events/')) {
      throw new Error(`Today attention event link not OS route: ${item.href}`)
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        role: user.role,
        listRows: list.rows.length,
        listTotal: list.totalDocs,
        counts: list.counts,
        listErrors: list.errors,
        detailOk,
        detailId: detailId ? '[present]' : null,
        missingIdSafe: true,
        shapedIdSafe: true,
        mutationFnLoaded: typeof updateEventOperational === 'function',
        inquiryCrossLink: 'omitted — events collection has no inquiry relationship',
        note: 'No production event was updated.',
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
