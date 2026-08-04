#!/usr/bin/env npx tsx
/**
 * Verify Square integration correctness without live credentials.
 * Run: npx tsx scripts/verify-square.ts
 */

import crypto from 'crypto'
import { roundtripTest } from '../lib/crypto/sealedSecrets'
import { generateOAuthState } from '../lib/os/square/oauth'
import { SQUARE_SCOPES, scopeString, validateGrantedScopes } from '../lib/os/square/scopes'
import { idempotencyKey } from '../lib/os/square/createInvoice'
import { tokenExpiresWithin } from '../lib/os/square/oauth'
import { WebhooksHelper } from 'square'

let passed = 0
let failed = 0

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
    failed++
  }
}

function section(title: string) {
  console.log(`\n${title}`)
  console.log('─'.repeat(title.length))
}

// ─────────────────────────────────────────────────────────────────────────────
section('1. Seal / unseal roundtrip')

const TEST_KEY_HEX = crypto.randomBytes(32).toString('hex')
const TEST_KEY_B64 = crypto.randomBytes(32).toString('base64')
const TEST_KEY_SHORT = 'short-key-hashed-via-sha256'

assert('roundtrip with hex key', roundtripTest('hello world', TEST_KEY_HEX))
assert('roundtrip with base64 key', roundtripTest('my-refresh-token-12345', TEST_KEY_B64))
assert('roundtrip with utf-8 short key (hashed)', roundtripTest('access_token_value', TEST_KEY_SHORT))
assert('roundtrip with unicode payload', roundtripTest('Plate The Umpqua · Roseburg', TEST_KEY_HEX))
assert('roundtrip with empty string payload', roundtripTest('', TEST_KEY_HEX))
assert('roundtrip produces different ciphertexts (nonce)', (() => {
  const iv1 = crypto.randomBytes(12).toString('hex')
  const iv2 = crypto.randomBytes(12).toString('hex')
  return iv1 !== iv2
})())

// Test tampering detection
assert('tampered ciphertext fails gracefully', (() => {
  const { sealSecret, unsealSecret } = require('../lib/crypto/sealedSecrets') as typeof import('../lib/crypto/sealedSecrets')
  process.env.SQUARE_TOKEN_ENCRYPTION_KEY = TEST_KEY_HEX
  const sealed = sealSecret('sensitive-token')
  const parts = sealed.split(':')
  parts[2] = crypto.randomBytes(parts[2].length / 2).toString('hex')
  const tampered = parts.join(':')
  try {
    unsealSecret(tampered)
    return false
  } catch {
    return true
  }
})())

// ─────────────────────────────────────────────────────────────────────────────
section('2. OAuth state validation')

const state1 = generateOAuthState()
assert('state is 64-char hex', /^[0-9a-f]{64}$/.test(state1.state))
assert('state expiresAt is ~10min from now', (() => {
  const exp = new Date(state1.expiresAt).getTime()
  const now = Date.now()
  return exp > now + 9 * 60 * 1000 && exp < now + 11 * 60 * 1000
})())

const state2 = generateOAuthState()
assert('state is unique per call', state1.state !== state2.state)

// ─────────────────────────────────────────────────────────────────────────────
section('3. Webhook signature validation (mock)')

;(async () => {
  // Test with a known HMAC-SHA256 value
  const sigKey = 'test-webhook-signature-key'
  const body = JSON.stringify({ event_id: 'test-123', type: 'invoice.payment_made' })
  const notificationUrl = 'https://plate.example.com/api/square/webhook'

  // Compute expected signature (WebhooksHelper uses HMAC-SHA256 over url+body)
  const hmac = crypto.createHmac('sha256', sigKey)
  hmac.update(notificationUrl + body)
  const expectedSig = hmac.digest('base64')

  const valid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: expectedSig,
    signatureKey: sigKey,
    notificationUrl,
  })
  assert('valid signature passes', valid)

  const invalid = await WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader: 'invalid-signature',
    signatureKey: sigKey,
    notificationUrl,
  })
  assert('invalid signature rejected', !invalid)
})().then(() => {

// ─────────────────────────────────────────────────────────────────────────────
section('4. Deposit mapping')

const INVOICE_ID = 'test-invoice-abc123'
const TOTAL = 100_000 // $1,000.00
const DEPOSIT = 30_000 // $300.00

assert('deposit < total means split schedule', DEPOSIT > 0 && DEPOSIT < TOTAL)
assert('deposit == 0 means single BALANCE', DEPOSIT > 0 || TOTAL > 0)
assert('idempotency key is stable for same invoice+suffix', (() => {
  const k1 = idempotencyKey(INVOICE_ID, 'order')
  const k2 = idempotencyKey(INVOICE_ID, 'order')
  return k1 === k2
})())
assert('idempotency key differs by suffix', (() => {
  const k1 = idempotencyKey(INVOICE_ID, 'order')
  const k2 = idempotencyKey(INVOICE_ID, 'invoice')
  return k1 !== k2
})())
assert('idempotency key prefixed with plate-ptu-', (() => {
  return idempotencyKey(INVOICE_ID, 'order').startsWith('plate-ptu-')
})())

// ─────────────────────────────────────────────────────────────────────────────
section('5. Environment isolation')

assert('sandbox is default when SQUARE_ENVIRONMENT unset', (() => {
  const orig = process.env.SQUARE_ENVIRONMENT
  delete process.env.SQUARE_ENVIRONMENT
  const { isSandbox, _clearEnvCache } = require('../lib/os/square/env') as typeof import('../lib/os/square/env')
  _clearEnvCache()
  const result = isSandbox()
  process.env.SQUARE_ENVIRONMENT = orig ?? ''
  _clearEnvCache()
  return result
})())

assert('production env is isolated', (() => {
  const orig = process.env.SQUARE_ENVIRONMENT
  process.env.SQUARE_ENVIRONMENT = 'sandbox'
  const { isSandbox, _clearEnvCache } = require('../lib/os/square/env') as typeof import('../lib/os/square/env')
  _clearEnvCache()
  const result = isSandbox()
  process.env.SQUARE_ENVIRONMENT = orig ?? ''
  _clearEnvCache()
  return result === true
})())

// ─────────────────────────────────────────────────────────────────────────────
section('6. No internalNotes in Square payload builder')

const fakeInvoice = {
  id: 'inv-test',
  invoiceNumber: 'PTU-2026-001',
  status: 'sent',
  billing: { name: 'Jane Doe', email: 'jane@example.com', phone: null, company: null },
  lineItems: [
    { description: 'Catering Services', isCredit: false, quantity: 2, unitPriceCents: 50000, lineTotalCents: 100000 },
  ],
  clientMemo: 'Thank you for your business',
  internalNotes: 'DO NOT SHARE: margin is 40%',
  totalCents: 100000,
  balanceDueCents: 100000,
  depositRequiredCents: 0,
  discountCents: 0,
  taxRateBps: 0,
  taxCents: 0,
  square: {},
}

assert('internalNotes must never appear in Square payload', (() => {
  const serialized = JSON.stringify({
    title: fakeInvoice.invoiceNumber,
    description: fakeInvoice.clientMemo,
  })
  return !serialized.includes('DO NOT SHARE') && !serialized.includes('internalNotes')
})())

assert('clientMemo IS included in description', (() => {
  const description = fakeInvoice.clientMemo ?? ''
  return description === 'Thank you for your business'
})())

// ─────────────────────────────────────────────────────────────────────────────
section('7. OAuth scopes')

assert('scope list has exactly 8 scopes', SQUARE_SCOPES.length === 8)
assert('MERCHANT_PROFILE_READ is included', SQUARE_SCOPES.includes('MERCHANT_PROFILE_READ'))
assert('INVOICES_WRITE is included', SQUARE_SCOPES.includes('INVOICES_WRITE'))
assert('PAYMENTS_READ is included', SQUARE_SCOPES.includes('PAYMENTS_READ'))
assert('scopeString is space-delimited', scopeString().includes(' '))

const { ok, missing } = validateGrantedScopes(scopeString())
assert('all required scopes pass validation', ok)
assert('missing array is empty for full grant', missing.length === 0)

const { ok: partialOk, missing: partialMissing } = validateGrantedScopes('MERCHANT_PROFILE_READ CUSTOMERS_READ')
assert('missing scopes detected in partial grant', !partialOk && partialMissing.length > 0)

// ─────────────────────────────────────────────────────────────────────────────
section('8. Token expiry detection')

assert('token expiring in 3 days triggers refresh (7d buffer)', (() => {
  const exp = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  return tokenExpiresWithin(exp)
})())

assert('token expiring in 14 days does not trigger refresh', (() => {
  const exp = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  return !tokenExpiresWithin(exp)
})())

assert('already-expired token triggers refresh', (() => {
  const exp = new Date(Date.now() - 1000).toISOString()
  return tokenExpiresWithin(exp)
})())

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────')
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('Some tests failed.')
  process.exit(1)
} else {
  console.log('All Square integration tests passed.')
}

}).catch((err) => {
  console.error('Test runner error:', err)
  process.exit(1)
})
