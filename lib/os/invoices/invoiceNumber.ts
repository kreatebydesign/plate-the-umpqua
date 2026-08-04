import { getPayload } from 'payload'
import config from '../../../payload.config'
import { PLATE_OS_TIMEZONE } from '../constants'

function yearInLosAngeles(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PLATE_OS_TIMEZONE,
    year: 'numeric',
  }).formatToParts(now)
  return Number(parts.find((p) => p.type === 'year')?.value)
}

export function formatInvoiceNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Invalid invoice year')
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error('Invalid invoice sequence')
  }
  return `PTU-${year}-${String(sequence).padStart(3, '0')}`
}

/**
 * Atomic Mongo update for yearly invoice sequences.
 * Each field must be owned by only one compatible operator — Mongo rejects
 * the same path in both $set and $setOnInsert (ConflictingUpdateOperators).
 */
export function buildInvoiceSequenceAtomicUpdate(
  year: number,
  now = new Date(),
): {
  $inc: { lastSequence: number }
  $setOnInsert: { year: number; createdAt: Date }
  $set: { updatedAt: Date }
} {
  return {
    $inc: { lastSequence: 1 },
    $setOnInsert: {
      year,
      createdAt: now,
    },
    $set: { updatedAt: now },
  }
}

/**
 * Concurrency-safe sequence allocation using Mongo findOneAndUpdate $inc.
 * Does not use count+1.
 */
export async function allocateInvoiceNumber(now = new Date()): Promise<string> {
  const year = yearInLosAngeles(now)
  const payload = await getPayload({ config })

  try {
    // Payload Mongo adapter exposes the mongoose connection.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (payload.db as any)?.connection
    const nativeDb = connection?.db
    if (nativeDb?.collection) {
      const result = await nativeDb.collection('invoice-sequences').findOneAndUpdate(
        { year },
        buildInvoiceSequenceAtomicUpdate(year, now),
        { upsert: true, returnDocument: 'after' },
      )
      const doc = result?.value ?? result
      const seq = doc?.lastSequence
      if (typeof seq === 'number' && seq >= 1) {
        return formatInvoiceNumber(year, seq)
      }
    }
  } catch (err) {
    console.error('[os/invoices] sequence atomic path', err)
  }

  // Fallback with optimistic retries (still increments stored sequence, not count+1 of invoices).
  for (let attempt = 0; attempt < 8; attempt++) {
    const existing = await payload.find({
      collection: 'invoice-sequences',
      where: { year: { equals: year } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      const current = Number(existing.docs[0].lastSequence || 0)
      const next = current + 1
      try {
        await payload.update({
          collection: 'invoice-sequences',
          id: existing.docs[0].id,
          data: { lastSequence: next },
          overrideAccess: true,
        })
        return formatInvoiceNumber(year, next)
      } catch {
        continue
      }
    }

    try {
      await payload.create({
        collection: 'invoice-sequences',
        data: { year, lastSequence: 1 },
        overrideAccess: true,
      })
      return formatInvoiceNumber(year, 1)
    } catch {
      continue
    }
  }

  throw new Error('Unable to allocate invoice number')
}
