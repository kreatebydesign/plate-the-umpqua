/**
 * Temporary safe Square config diagnostics for Production transition.
 * Never returns secrets. Remove after Production OAuth is verified.
 */

import { NextResponse } from 'next/server'
import { getSquareOAuthConfigDiagnostics, isSandbox } from '@/lib/os/square/env'
import { getSquareConnection, getAnySquareConnection } from '@/lib/os/square/connection'

export const dynamic = 'force-dynamic'

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
    try {
      const { getSquareEnv } = await import('@/lib/os/square/env')
      getSquareEnv()
      envLoadOk = true
    } catch (err) {
      envLoadError = err instanceof Error ? err.message.slice(0, 200) : 'env load failed'
    }

    return NextResponse.json({
      ok: true,
      sandboxMode: isSandbox(),
      diagnostics: diag,
      envLoadOk,
      envLoadError,
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
            scopeCount: active.scopes?.length ?? 0,
            hasExpiry: Boolean(active.accessTokenExpiresAt),
          }
        : null,
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
