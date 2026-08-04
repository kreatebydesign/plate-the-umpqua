/**
 * Square integration boundary — reflects real connection state.
 * Server-only. For Square API actions, use lib/os/square/ modules directly.
 */

export type SquareConnectionState = 'not_connected' | 'connected' | 'error' | 'disconnected'

export type SquareAdapter = {
  getConnectionState: () => SquareConnectionState
}

/**
 * Get the Square connection state by checking the square-connections collection.
 * Uses dynamic import to avoid circular deps; returns 'not_connected' on any error.
 */
export async function getSquareConnectionState(): Promise<SquareConnectionState> {
  try {
    const { getSquareConnection } = await import('@/lib/os/square/connection')
    const conn = await getSquareConnection()
    if (!conn) return 'not_connected'
    return conn.status as SquareConnectionState
  } catch {
    return 'not_connected'
  }
}

/** Synchronous adapter object for legacy compatibility. */
export function createSquareAdapter(): SquareAdapter {
  return {
    getConnectionState: () => 'not_connected',
  }
}

export const SQUARE_SETUP_CHECKLIST = [
  'SQUARE_APPLICATION_ID — from Square Developer Dashboard',
  'SQUARE_APPLICATION_SECRET — from Square Developer Dashboard (never commit)',
  'SQUARE_OAUTH_REDIRECT_URL — {NEXT_PUBLIC_SITE_URL}/api/square/oauth/callback',
  'SQUARE_WEBHOOK_SIGNATURE_KEY — from Square Webhook subscription',
  'SQUARE_TOKEN_ENCRYPTION_KEY — 32+ byte secret for AES-256-GCM, use SQUARE_TOKEN_ENCRYPTION_KEY',
  'SQUARE_ENVIRONMENT=sandbox until production is authorized',
  'Complete OAuth flow at /os/settings/square',
  'Select location in /os/settings/square',
] as const
