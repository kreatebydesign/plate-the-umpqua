/**
 * Square webhook signature verification and event reconciliation.
 * Uses WebhooksHelper from the Square SDK for HMAC-SHA256 verification.
 * Deduplicates by eventId using the square-webhook-events collection.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { WebhooksHelper } from 'square'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import { getSquareEnv } from './env'
import { syncSquareInvoice } from './sync'

export type SquareWebhookEvent = {
  event_id: string
  type: string
  merchant_id?: string
  location_id?: string
  created_at?: string
  data?: {
    type?: string
    id?: string
    object?: Record<string, unknown>
  }
}

/**
 * Verify a Square webhook signature on the raw request body.
 * Returns false if signature key is not configured (non-fatal in sandbox).
 */
export async function verifySquareWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  notificationUrl: string,
): Promise<boolean> {
  const env = getSquareEnv()
  if (!env.webhookSignatureKey) {
    if (env.environment === 'production') {
      console.error(
        '[square/webhooks] SQUARE_WEBHOOK_SIGNATURE_KEY is required in production — rejecting webhook',
      )
      return false
    }
    console.warn(
      '[square/webhooks] SQUARE_WEBHOOK_SIGNATURE_KEY not set — skipping signature verification (sandbox only)',
    )
    return true
  }

  try {
    return await WebhooksHelper.verifySignature({
      requestBody: rawBody,
      signatureHeader,
      signatureKey: env.webhookSignatureKey,
      notificationUrl,
    })
  } catch (err) {
    console.error('[square/webhooks] signature verification error', err)
    return false
  }
}

/** Check if an eventId has already been processed. */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const payload = await getPayload({ config })
  const result = await (payload as any).find({
    collection: 'square-webhook-events',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: { eventId: { equals: eventId } },
  })
  return (result as any).totalDocs > 0
}

/** Record a processed event for deduplication. */
async function recordEvent(
  eventId: string,
  type: string,
  summary: string,
  invoiceId?: string,
): Promise<void> {
  const payload = await getPayload({ config })
  try {
    await (payload as any).create({
      collection: 'square-webhook-events',
      overrideAccess: true,
      data: {
        eventId,
        type,
        processedAt: new Date().toISOString(),
        invoiceId: invoiceId ?? null,
        summary,
      },
    })
  } catch {
    // Unique constraint — means already recorded by a concurrent request; harmless
  }
}

/** Find a Plate invoice by its Square invoice ID. */
async function findPlateInvoiceBySquareId(squareInvoiceId: string): Promise<string | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'invoices',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: { 'square.invoiceId': { equals: squareInvoiceId } },
  })
  const doc = result.docs[0]
  return doc ? String(doc.id) : null
}

/**
 * Process an incoming Square webhook event.
 * Deduplicates, reconciles payments, and returns a summary.
 */
export async function processSquareWebhookEvent(event: SquareWebhookEvent): Promise<{
  processed: boolean
  duplicate: boolean
  summary: string
}> {
  const eventId = event.event_id
  if (!eventId) {
    return { processed: false, duplicate: false, summary: 'Missing event_id' }
  }

  if (await isEventProcessed(eventId)) {
    return { processed: false, duplicate: true, summary: `Duplicate event ${eventId}` }
  }

  const type = event.type ?? 'unknown'
  let summary = `Event ${type} (${eventId})`
  let plateInvoiceId: string | undefined

  try {
    if (type.startsWith('invoice.') || type.startsWith('payment.')) {
      const objectId = event.data?.id
      if (objectId) {
        if (type.startsWith('invoice.')) {
          const found = await findPlateInvoiceBySquareId(objectId)
          if (found) {
            plateInvoiceId = found
            const result = await syncSquareInvoice(found)
            summary = `Synced ${type}: ${result.newPaymentsRecorded} new payments, status=${result.squareStatus}`
          } else {
            summary = `No Plate invoice found for Square invoice ${objectId}`
          }
        }
      }
    }
  } catch (err) {
    summary = `Error processing ${type}: ${err instanceof Error ? err.message : String(err)}`
    console.error('[square/webhooks] processEvent error', err)
  }

  await recordEvent(eventId, type, summary.slice(0, 500), plateInvoiceId)

  return { processed: true, duplicate: false, summary }
}
