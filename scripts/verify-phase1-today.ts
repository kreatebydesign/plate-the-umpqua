/**
 * Phase 1 smoke: load Today at Plate for Martin via authorized Local API.
 * Run: npx tsx scripts/verify-phase1-today.ts
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

async function main() {
  loadEnvLocal()

  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const { getTodayAtPlate } = await import('../lib/os/getTodayAtPlate')

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

  const data = await getTodayAtPlate(user as never)

  const forbidden = [
    'dietaryNotes',
    'internalNotes',
    'internalStrategyNotes',
    'relationshipNotes',
    'staffNotes',
    'clientNotes',
  ]
  const serialized = JSON.stringify(data)
  for (const key of forbidden) {
    if (serialized.includes(`"${key}"`)) {
      console.error(`Sensitive key leaked in overview payload: ${key}`)
      process.exit(1)
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        role: user.role,
        counts: data.counts,
        attention: data.attention.length,
        upcomingEvents: data.upcomingEvents.length,
        recentInquiries: data.recentInquiries.length,
        openTasks: data.openTasks.length,
        sectionErrors: data.sectionErrors,
        totals: data.totals,
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
