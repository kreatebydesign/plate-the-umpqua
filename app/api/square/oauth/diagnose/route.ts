/**
 * Temporary safe Square OAuth diagnostics.
 * Public during white-screen repair only. Never returns secrets or full Application IDs.
 * Remove after Sandbox OAuth white-screen is resolved.
 */

import { NextResponse } from 'next/server'
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

  let squarePageProbe: {
    httpStatus: number | null
    finalHostname: string | null
    htmlBytes: number
    titleIncludesSquareOAuth: boolean
    looksBlankShell: boolean
    hasSessionFalse: boolean
    error: string | null
  } | null = null

  if (configValid) {
    try {
      const { state } = generateOAuthState()
      const url = buildAuthorizeUrl(state)
      authorizeUrlSafe = assertAuthorizeUrlSafe(url)

      const parsed = new URL(url)
      const hasSessionFalse = parsed.searchParams.get('session') === 'false'
      try {
        const response = await fetch(url, {
          redirect: 'follow',
          headers: {
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            accept: 'text/html,application/xhtml+xml',
          },
        })
        const html = await response.text()
        const lower = html.toLowerCase()
        const visible = html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        squarePageProbe = {
          httpStatus: response.status,
          finalHostname: new URL(response.url).hostname,
          htmlBytes: html.length,
          titleIncludesSquareOAuth: lower.includes('square oauth'),
          // Blank white-screen pattern: SPA shell title only, almost no visible copy.
          looksBlankShell: visible.length < 40 && lower.includes('id="root"'),
          hasSessionFalse,
          error: null,
        }
      } catch (err) {
        squarePageProbe = {
          httpStatus: null,
          finalHostname: null,
          htmlBytes: 0,
          titleIncludesSquareOAuth: false,
          looksBlankShell: true,
          hasSessionFalse,
          error: err instanceof Error ? err.message : 'Square page probe failed',
        }
      }
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
    squarePageProbe,
    notes: [
      'No secrets, tokens, or full Application IDs are included.',
      'Sandbox OAuth must omit session=false.',
      'Sandbox Application IDs must start with sandbox-sq0id.',
    ],
  })
}
