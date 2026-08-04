/**
 * GET /api/square/oauth/callback
 * Validates state, exchanges code for tokens, stores sealed tokens, redirects to Square settings.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import { exchangeCodeForTokens } from '@/lib/os/square/oauth'
import { saveSquareConnection } from '@/lib/os/square/connection'
import { SquareClient, SquareEnvironment } from 'square'
import { getSquareEnv } from '@/lib/os/square/env'

export const dynamic = 'force-dynamic'

const SETTINGS_URL = '/os/settings/square'

function errorRedirect(message: string): NextResponse {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return NextResponse.redirect(
    `${base}${SETTINGS_URL}?error=${encodeURIComponent(message)}`,
  )
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  let user
  try {
    user = await requirePlateOperator()
  } catch {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(`${base}/admin/login?redirect=${encodeURIComponent(SETTINGS_URL)}`)
  }

  if (!isDirector(asPlateUser(user))) {
    return errorRedirect('Directors only')
  }

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  if (errorParam) {
    return errorRedirect(`Square declined: ${errorParam}`)
  }

  if (!code || !stateParam) {
    return errorRedirect('Missing code or state from Square')
  }

  const payload = await getPayload({ config })

  // Validate state (CSRF)
  const stateResult = await (payload as any).find({
    collection: 'square-oauth-states',
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: { state: { equals: stateParam } },
  })

  const stateDoc = stateResult.docs[0]
  if (!stateDoc) {
    return errorRedirect('Invalid or expired OAuth state')
  }
  if (stateDoc.usedAt) {
    return errorRedirect('OAuth state already used — possible replay attack')
  }
  if (new Date(stateDoc.expiresAt as string).getTime() < Date.now()) {
    return errorRedirect('OAuth state expired — please try again')
  }

  // Mark state as used
  await (payload as any).update({
    collection: 'square-oauth-states',
    id: String(stateDoc.id),
    overrideAccess: true,
    data: { usedAt: new Date().toISOString() },
  })

  let tokens
  try {
    tokens = await exchangeCodeForTokens(code)
  } catch (err) {
    console.error('[square/oauth/callback] token exchange failed', err)
    return errorRedirect('Token exchange failed — check Square credentials')
  }

  // Fetch merchant name
  let merchantName = tokens.merchantId
  try {
    const env = getSquareEnv()
    const squareEnv =
      env.environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox
    const client = new SquareClient({ token: tokens.accessToken, environment: squareEnv })
    const merchantResp = await client.merchants.get({ merchantId: tokens.merchantId })
    merchantName = (merchantResp as any).merchant?.businessName ?? tokens.merchantId
  } catch {
    // Non-fatal — use merchantId as name fallback
  }

  await saveSquareConnection(tokens, merchantName, String(user.id))

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return NextResponse.redirect(`${base}${SETTINGS_URL}?connected=1`)
}
