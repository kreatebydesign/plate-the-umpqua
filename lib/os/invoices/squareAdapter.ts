/**
 * Square integration boundary — not connected.
 * Do not fabricate credentials or make live Square API calls.
 */

export type SquareConnectionState = 'not_connected' | 'connected'

export type SquareAdapter = {
  getConnectionState: () => SquareConnectionState
  createPaymentLink?: never
  syncPayment?: never
  handleWebhook?: never
}

export function getSquareConnectionState(): SquareConnectionState {
  // Live credentials are intentionally not read here until OAuth is implemented.
  return 'not_connected'
}

export function createSquareAdapter(): SquareAdapter {
  return {
    getConnectionState: getSquareConnectionState,
  }
}

export const SQUARE_SETUP_CHECKLIST = [
  'SQUARE_APPLICATION_ID',
  'SQUARE_ACCESS_TOKEN (env only — never store plaintext in the database)',
  'SQUARE_LOCATION_ID',
  'SQUARE_WEBHOOK_SIGNATURE_KEY',
  'OAuth redirect URI for production and preview',
  'Webhook endpoint for payment.updated / invoice events with event-ID deduplication',
  'Idempotency key strategy for payment-link creation',
] as const
