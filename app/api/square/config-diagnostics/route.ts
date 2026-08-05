/**
 * Temporary safe Square config diagnostics for Production transition.
 * Never returns secrets. Remove after Production OAuth is verified.
 */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getSquareOAuthConfigDiagnostics, getSquareEnv, isSandbox } from '@/lib/os/square/env'
import { getSquareConnection, getAnySquareConnection } from '@/lib/os/square/connection'
import { listSquareLocations } from '@/lib/os/square/locations'
import { SQUARE_SCOPES } from '@/lib/os/square/scopes'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function redact(id: string | null | undefined): string | null {
  if (!id) return null
  if (id.length < 8) return 'too_short'
  return `${id.slice(0, 4)}…${id.slice(-4)}`
}

export async function GET(): Promise<NextResponse> {
  try {
    const diag = getSquareOAuthConfigDiagnostics()
    const active = await getSquareConnection()
    const anyEnv = await getAnySquareConnection()

    let envLoadOk = false
    let envLoadError: string | null = null
    let webhookSignatureKeyConfigured = false
    try {
      const env = getSquareEnv()
      envLoadOk = true
      webhookSignatureKeyConfigured = Boolean(env.webhookSignatureKey)
    } catch (err) {
      envLoadError = err instanceof Error ? err.message.slice(0, 200) : 'env load failed'
    }

    let locations: Array<{
      name: string
      status: string
      locationIdRedacted: string | null
      address: string | null
    }> = []
    let locationsError: string | null = null
    let activeLocationCount = 0
    if (active?.status === 'connected') {
      try {
        const listed = await listSquareLocations()
        locations = listed.map((l) => ({
          name: l.name,
          status: l.status,
          locationIdRedacted: redact(l.id),
          address: l.address,
        }))
        activeLocationCount = listed.filter(
          (l) => String(l.status).toUpperCase() === 'ACTIVE',
        ).length
      } catch (err) {
        locationsError = err instanceof Error ? err.message.slice(0, 200) : 'locations failed'
      }
    }

    const grantedScopes = Array.isArray(active?.scopes) ? active.scopes.map(String) : []
    const requiredScopesPresent = SQUARE_SCOPES.every((s) => grantedScopes.includes(s))
    const missingScopes = SQUARE_SCOPES.filter((s) => !grantedScopes.includes(s))

    // Read-only QA invoice check — never mutate
    const payload = await getPayload({ config })
    const qaInvoice = await payload.find({
      collection: 'invoices',
      overrideAccess: true,
      depth: 0,
      limit: 1,
      where: { invoiceNumber: { equals: 'PTU-2026-007' } },
    })
    const inv = qaInvoice.docs[0] as unknown as Record<string, unknown> | undefined
    let paymentCount = 0
    let payments: Array<{ amountCents: number; method: string; hasSquarePaymentId: boolean }> = []
    if (inv?.id) {
      const payResult = await payload.find({
        collection: 'invoice-payments',
        overrideAccess: true,
        depth: 0,
        limit: 20,
        where: { invoice: { equals: String(inv.id) } },
      })
      paymentCount = payResult.totalDocs
      payments = (payResult.docs as unknown as Array<Record<string, unknown>>).map((p) => ({
        amountCents: Number(p.amountCents ?? 0),
        method: String(p.method ?? ''),
        hasSquarePaymentId: Boolean(p.squarePaymentId),
      }))
    }

    // Count production-env connections and recent webhook events (metadata only)
    const prodConnections = await (payload as unknown as {
      find: (args: Record<string, unknown>) => Promise<{ totalDocs: number }>
    }).find({
      collection: 'square-connections',
      overrideAccess: true,
      depth: 0,
      limit: 5,
      where: {
        and: [
          { environment: { equals: 'production' } },
          { status: { equals: 'connected' } },
        ],
      },
    })

    const recentWebhooks = await (payload as unknown as {
      find: (args: Record<string, unknown>) => Promise<{
        totalDocs: number
        docs: Array<Record<string, unknown>>
      }>
    }).find({
      collection: 'square-webhook-events',
      overrideAccess: true,
      depth: 0,
      limit: 10,
      sort: '-processedAt',
    })

    const webhookSummaries = recentWebhooks.docs.map((e) => ({
      type: e.type,
      processedAt: e.processedAt,
      invoiceId: e.invoiceId || null,
      summary: String(e.summary || '').slice(0, 120),
    }))

    return NextResponse.json({
      ok: true,
      sandboxMode: isSandbox(),
      diagnostics: diag,
      envLoadOk,
      envLoadError,
      webhookSignatureKeyConfigured,
      webhookSignatureVerificationActive:
        !isSandbox() && webhookSignatureKeyConfigured && envLoadOk,
      expectedCallback: 'https://www.platetheumpqua.com/api/square/oauth/callback',
      expectedWebhook: 'https://www.platetheumpqua.com/api/square/webhook',
      activeConnection: active
        ? {
            environment: active.environment,
            status: active.status,
            merchantName: active.merchantName,
            merchantIdRedacted: redact(active.merchantId),
            locationName: active.locationName,
            locationIdRedacted: redact(active.locationId),
            locationSelected: Boolean(active.locationId),
            scopeCount: grantedScopes.length,
            scopes: grantedScopes,
            requiredScopesPresent,
            missingScopes,
            hasAccessTokenExpiry: Boolean(active.accessTokenExpiresAt),
            accessTokenExpiresAt: active.accessTokenExpiresAt,
            hasRefreshTokenExpiryField: active.refreshTokenExpiresAt != null,
            connectedAt: active.connectedAt,
            lastError: active.lastError,
          }
        : null,
      productionConnectedCount: prodConnections.totalDocs,
      locations,
      locationsError,
      activeLocationCount,
      locationSelectionRequired: activeLocationCount !== 1 || !active?.locationId,
      qaInvoicePtu2026007: inv
        ? {
            id: String(inv.id),
            invoiceNumber: inv.invoiceNumber,
            status: inv.status,
            totalCents: inv.totalCents,
            amountPaidCents: inv.amountPaidCents,
            balanceDueCents: inv.balanceDueCents,
            paymentCount,
            payments,
            squareStatus: (inv.square as Record<string, unknown> | undefined)?.status ?? null,
            unchangedPaidZeroBalance:
              inv.status === 'paid' &&
              Number(inv.amountPaidCents) === 1000 &&
              Number(inv.balanceDueCents) === 0 &&
              paymentCount === 1,
          }
        : null,
      recentWebhookEventCount: recentWebhooks.totalDocs,
      recentWebhookEvents: webhookSummaries,
      envScopedHistory: anyEnv
        ? {
            environment: anyEnv.environment,
            status: anyEnv.status,
            merchantName: anyEnv.merchantName,
          }
        : null,
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message.slice(0, 200) : 'diagnostics failed',
      },
      { status: 500 },
    )
  }
}
