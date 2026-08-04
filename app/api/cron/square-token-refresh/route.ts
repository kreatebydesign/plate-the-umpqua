/**
 * GET /api/cron/square-token-refresh
 * Refreshes Square OAuth token if expiring within 7 days.
 * Authenticated with CRON_SECRET (same pattern as feedback-sweep cron).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSquareConnection, updateSquareTokens, setConnectionError, decryptRefreshToken } from '@/lib/os/square/connection'
import { refreshAccessToken, tokenExpiresWithin } from '@/lib/os/square/oauth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const connection = await getSquareConnection()
    if (!connection || connection.status !== 'connected') {
      return NextResponse.json({ ok: true, skipped: true, reason: 'no active connection' })
    }

    const expiresAt = connection.accessTokenExpiresAt
    if (!expiresAt || !tokenExpiresWithin(expiresAt)) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'token not expiring soon' })
    }

    let refreshToken: string
    try {
      refreshToken = await decryptRefreshToken(connection.id)
    } catch {
      await setConnectionError(connection.id, 'Missing or unreadable refresh token')
      return NextResponse.json({ ok: false, error: 'No refresh token' }, { status: 500 })
    }

    const newTokens = await refreshAccessToken(refreshToken)
    await updateSquareTokens(connection.id, newTokens)

    return NextResponse.json({
      ok: true,
      refreshed: true,
      newExpiresAt: newTokens.expiresAt,
    })
  } catch (err) {
    console.error('[cron/square-token-refresh]', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
