/**
 * Phase 4 smoke: client list/detail contracts via authorized Local API.
 * Does not mutate production records.
 * Run: npx tsx scripts/verify-phase4-clients.ts
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
    'relationshipNotes',
    'internalStrategyNotes',
    'averageSpendRange',
    'dietaryNotes',
    'staffNotes',
    'clientNotes',
    'internalNotes',
    'clientPrice',
    'estimatedProfit',
    'hash',
    'salt',
    'resetPasswordToken',
    'password',
    'favoriteVendors',
    'favoriteVenues',
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
  const { listClients, getClientDetail } = await import(
    '../lib/os/clients/clientQueries'
  )
  const {
    CLIENT_TYPE_VALUES,
    CLIENT_VIP_VALUES,
    CLIENT_UPDATE_ALLOWLIST,
    clientAttentionReason,
    isClientType,
    isClientVip,
  } = await import('../lib/os/clients/clientConstants')
  const { canWriteOperational, asPlateUser } = await import(
    '../lib/access/roles'
  )

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

  // Schema enum sanity
  if (!isClientType(CLIENT_TYPE_VALUES[0]) || !isClientVip(CLIENT_VIP_VALUES[0])) {
    throw new Error('Client enum helpers drifted')
  }
  if (CLIENT_UPDATE_ALLOWLIST.length !== 0) {
    throw new Error('Phase 4 update allowlist must remain empty (read-only)')
  }

  // Attention unit checks (no DB)
  const missingPhone = clientAttentionReason({
    phone: null,
    hasUpcomingEvent: true,
    hasFollowUpInquiry: false,
  })
  if (missingPhone !== 'Upcoming event — phone missing') {
    throw new Error(`Unexpected missing-phone attention: ${missingPhone}`)
  }

  const followUp = clientAttentionReason({
    phone: '555-0100',
    hasUpcomingEvent: false,
    hasFollowUpInquiry: true,
  })
  if (followUp !== 'Open inquiry needs follow-up') {
    throw new Error(`Unexpected follow-up attention: ${followUp}`)
  }

  const clear = clientAttentionReason({
    phone: '555-0100',
    hasUpcomingEvent: true,
    hasFollowUpInquiry: false,
  })
  if (clear !== null) {
    throw new Error('Healthy client should not need attention')
  }

  const list = await listClients(user as never, {
    view: 'all',
    sort: 'newest',
    page: '1',
    limit: '20',
  })

  assertNoSensitiveKeys('list', list)

  if (list.limit > 50) {
    throw new Error('Pagination limit exceeded max')
  }

  if (list.updateAllowlist.length !== 0) {
    throw new Error('List result must expose empty update allowlist')
  }

  const badList = await listClients(user as never, {
    view: 'not-a-view',
    type: 'injected',
    vip: 'hack',
    sort: 'hack',
    page: '-3',
    limit: '9999',
  })

  if (badList.filters.view !== 'all') {
    throw new Error('Invalid view was not normalized')
  }
  if (badList.filters.type !== null || badList.filters.vip !== null) {
    throw new Error('Invalid type/vip were not rejected')
  }
  if (badList.filters.sort !== 'newest') {
    throw new Error('Invalid sort was not normalized')
  }
  if (badList.page !== 1 || badList.limit !== 50) {
    throw new Error('Invalid page/limit were not bounded')
  }

  // Safe search uses contains — no regex construction from input
  const searchList = await listClients(user as never, {
    q: '.*)|(password',
    page: '1',
    limit: '10',
  })
  assertNoSensitiveKeys('search', searchList)

  const missing = await getClientDetail(user as never, 'does-not-exist-000')
  const malformed = await getClientDetail(user as never, '../etc/passwd')
  const empty = await getClientDetail(user as never, '')
  if (missing !== null || malformed !== null || empty !== null) {
    throw new Error('Missing/malformed IDs must fail identically as null')
  }

  let detailId: string | null = list.rows[0]?.id || null
  if (!detailId) {
    const any = await payload.find({
      collection: 'clients',
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
      select: { fullName: true },
    })
    detailId = any.docs[0] ? String(any.docs[0].id) : null
  }

  let detailOk = false
  if (detailId) {
    const detail = await getClientDetail(user as never, detailId)
    if (!detail) {
      throw new Error('Authorized client detail returned null')
    }
    assertNoSensitiveKeys('detail', detail)
    if (!detail.fullName) {
      throw new Error('Detail missing display name')
    }
    detailOk = true

    // Relationship queries under normal access (bounded)
    if (
      detail.upcomingEvents.length > 8 ||
      detail.pastEvents.length > 8 ||
      detail.openInquiries.length > 8 ||
      detail.recentInquiries.length > 8
    ) {
      throw new Error('Related summaries exceeded bound')
    }
  }

  // Mutation contract: Phase 4 is read-only — no live update attempted.
  const mutationContract = {
    allowlistEmpty: CLIENT_UPDATE_ALLOWLIST.length === 0,
    wouldRequireOverrideAccess: false,
    liveSaveExercised: false,
    recordsChanged: 0,
  }

  // Authorized live count under normal access
  const liveCount = await payload.count({
    collection: 'clients',
    user,
    overrideAccess: false,
  })

  console.log(
    JSON.stringify(
      {
        ok: true,
        martinRole: user.role,
        liveClientCount: liveCount.totalDocs,
        listTotal: list.totalDocs,
        listRows: list.rows.length,
        counts: list.counts,
        detailOk,
        detailId,
        mutationContract,
        updateAllowlist: [...CLIENT_UPDATE_ALLOWLIST],
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
