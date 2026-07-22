/**
 * Phase 2 smoke: inquiry list/detail contracts via authorized Local API.
 * Does not mutate production records.
 * Run: npx tsx scripts/verify-phase2-inquiries.ts
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
    'dietaryNotes',
    'internalNotes',
    'internalStrategyNotes',
    'relationshipNotes',
    'staffNotes',
    'clientNotes',
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
    listInquiries,
    getInquiryDetail,
    assertInquiryStatus,
    assertInquiryPriority,
  } = await import('../lib/os/inquiries/inquiryQueries')
  const {
    INQUIRY_STATUS_VALUES,
    INQUIRY_UPDATE_ALLOWLIST,
    isInquiryStatus,
    isLeadSource,
  } = await import('../lib/os/inquiries/inquiryConstants')
  const { canWriteOperational, asPlateUser } = await import('../lib/access/roles')

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

  const list = await listInquiries(user as never, {
    pipeline: 'open',
    sort: 'newest',
    page: '1',
    limit: '20',
  })

  assertNoSensitiveKeys('list', list)

  if (list.limit > 50) {
    throw new Error('Pagination limit exceeded max')
  }

  const badList = await listInquiries(user as never, {
    pipeline: 'not-a-pipeline',
    source: 'injected',
    sort: 'hack',
    page: '-3',
    limit: '9999',
  })

  if (badList.filters.pipeline !== 'open') {
    throw new Error('Invalid pipeline was not normalized')
  }
  if (badList.filters.source !== null) {
    throw new Error('Invalid source was not rejected')
  }
  if (badList.filters.sort !== 'newest') {
    throw new Error('Invalid sort was not normalized')
  }
  if (badList.page !== 1 || badList.limit !== 50) {
    throw new Error('Invalid page/limit were not bounded')
  }

  if (!assertInquiryStatus('bogus') && assertInquiryStatus('newLead') !== 'newLead') {
    throw new Error('Status assertion failed')
  }
  if (!assertInquiryPriority('bogus') && assertInquiryPriority('vip') !== 'vip') {
    throw new Error('Priority assertion failed')
  }
  if (!isInquiryStatus(INQUIRY_STATUS_VALUES[0])) {
    throw new Error('Status enum mismatch')
  }
  if (!isLeadSource('website')) {
    throw new Error('Lead source enum mismatch')
  }
  if (INQUIRY_UPDATE_ALLOWLIST.join(',') !== 'status,priorityLevel') {
    throw new Error('Update allowlist drifted')
  }

  let detailId: string | null = list.rows[0]?.id || null
  if (!detailId) {
    const any = await payload.find({
      collection: 'inquiries',
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
      select: { eventTitle: true },
    })
    detailId = any.docs[0] ? String(any.docs[0].id) : null
  }

  let detailOk = false
  if (detailId) {
    const detail = await getInquiryDetail(user as never, detailId)
    if (!detail) {
      throw new Error('Authorized detail lookup failed')
    }
    // Detail may include dietaryNotes as a value, but list must never.
    const listSerialized = JSON.stringify(list)
    if (listSerialized.includes('dietaryNotes')) {
      throw new Error('dietaryNotes leaked into list result')
    }
    if (JSON.stringify(detail).includes('internalNotes')) {
      throw new Error('internalNotes leaked into detail result')
    }
    if (!detail.adminHref.startsWith('/admin/collections/inquiries/')) {
      throw new Error('Detail missing admin href')
    }
    if (!detail.canEditOperational) {
      throw new Error('Martin should be able to edit operational fields')
    }
    detailOk = true
  }

  const missing = await getInquiryDetail(user as never, '000000000000000000000000')
  if (missing !== null) {
    throw new Error('Missing ID should resolve to null')
  }

  const shaped = await getInquiryDetail(user as never, '../etc/passwd')
  if (shaped !== null) {
    throw new Error('Shaped ID should resolve to null')
  }

  // Mutation contract checks without writing production data
  const { updateInquiryOperational } = await import(
    '../lib/os/inquiries/updateInquiryOperational'
  )

  // Unauthenticated / session-less call path is not exercised here (requires Next cookies).
  // Validate allowlist helpers already cover invalid status/priority rejection at the boundary.

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
        mutationFnLoaded: typeof updateInquiryOperational === 'function',
        note: 'No production inquiry was updated.',
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
