/**
 * GET /api/square/oauth/start
 * Generates a CSRF state, stores it, and redirects to Square OAuth authorize URL.
 * Requires authenticated director session.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import {
  generateOAuthState,
  buildAuthorizeUrl,
  assertAuthorizeUrlSafe,
} from '@/lib/os/square/oauth'
import { getSquareEnv } from '@/lib/os/square/env'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  let user
  try {
    user = await requirePlateOperator()
  } catch {
    return NextResponse.redirect(
      new URL('/admin/login?redirect=/os/settings/square', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    )
  }

  if (!isDirector(asPlateUser(user))) {
    return NextResponse.json({ error: 'Directors only' }, { status: 403 })
  }

  try {
    getSquareEnv()
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Square env not configured' },
      { status: 500 },
    )
  }

  const { state, expiresAt } = generateOAuthState()

  const payload = await getPayload({ config })
  await (payload as any).create({
    collection: 'square-oauth-states',
    overrideAccess: true,
    data: {
      state,
      expiresAt,
      createdBy: user.id,
      usedAt: null,
    },
  })

  const authorizeUrl = buildAuthorizeUrl(state)
  try {
    assertAuthorizeUrlSafe(authorizeUrl)
  } catch (err) {
    return NextResponse.redirect(
      new URL(
        `/os/settings/square?error=${encodeURIComponent(
          err instanceof Error ? err.message : 'Invalid Square OAuth configuration',
        )}`,
        process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      ),
    )
  }
  return NextResponse.redirect(authorizeUrl)
}
