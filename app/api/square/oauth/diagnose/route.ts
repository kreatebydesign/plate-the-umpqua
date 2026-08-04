/**
 * Temporary safe Square OAuth diagnostics.
 * Director-only. Never returns secrets or full Application IDs.
 * Remove after Sandbox OAuth white-screen is resolved.
 */

import { NextResponse } from 'next/server'
import { requirePlateOperator } from '@/lib/auth/requirePlateOperator'
import { asPlateUser, isDirector } from '@/lib/access/roles'
import {
  _clearEnvCache,
  getSquareOAuthConfigDiagnostics,
  getSquareEnv,
} from '@/lib/os/square/env'
import {
  assertAuthorizeUrlSafe,
  buildAuthorizeUrl,
  generateOAuthState,
} from '@/lib/os/square/oauth'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  let user
  try {
    user = await requirePlateOperator()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isDirector(asPlateUser(user))) {
    return NextResponse.json({ error: 'Directors only' }, { status: 403 })
  }

  _clearEnvCache()
  const diagnostics = getSquareOAuthConfigDiagnostics()

  let configValid = false
  let configError: string | null = null
  let authorizeUrlSafe: ReturnType<typeof assertAuthorizeUrlSafe> | null = null
  let authorizeError: string | null = null

  try {
    getSquareEnv()
    configValid = true
  } catch (err) {
    configError = err instanceof Error ? err.message : 'Square env invalid'
  }

  if (configValid) {
    try {
      const { state } = generateOAuthState()
      const url = buildAuthorizeUrl(state)
      authorizeUrlSafe = assertAuthorizeUrlSafe(url)
    } catch (err) {
      authorizeError = err instanceof Error ? err.message : 'Unable to build authorize URL'
    }
  }

  return NextResponse.json({
    temporary: true,
    purpose: 'Square Sandbox OAuth white-screen diagnosis',
    diagnostics,
    configValid,
    configError,
    authorizeUrlSafe,
    authorizeError,
    notes: [
      'No secrets, tokens, or full Application IDs are included.',
      'Sandbox OAuth must omit session=false.',
      'Sandbox Application IDs must start with sandbox-sq0id.',
    ],
  })
}
