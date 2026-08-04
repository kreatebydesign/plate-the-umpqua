/**
 * POST /api/square/webhook
 * Receives Square webhook events, verifies signature on raw body, deduplicates, reconciles.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySquareWebhookSignature, processSquareWebhookEvent } from '@/lib/os/square/webhooks'
import type { SquareWebhookEvent } from '@/lib/os/square/webhooks'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text()

  const signatureHeader = req.headers.get('x-square-hmacsha256-signature') ?? ''
  const notificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/square/webhook`

  const valid = await verifySquareWebhookSignature(rawBody, signatureHeader, notificationUrl)
  if (!valid) {
    console.warn('[square/webhook] signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: SquareWebhookEvent
  try {
    event = JSON.parse(rawBody) as SquareWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = await processSquareWebhookEvent(event)

  if (result.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true }, { status: 200 })
  }

  return NextResponse.json({ ok: true, summary: result.summary }, { status: 200 })
}
